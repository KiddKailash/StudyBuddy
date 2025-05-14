const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

const YOUR_DOMAIN = process.env.CLIENT_URL;

// Ensure YOUR_DOMAIN is defined
if (!YOUR_DOMAIN) {
  console.error("Error: CLIENT_URL is not defined in environment variables.");
  process.exit(1);
}

/**
 * @route   POST /api/checkout/create-checkout-session
 * @desc    Create a Stripe Checkout session for upgrading to a paid subscription (Embedded)
 * @access  Private
 */
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  // The front end should send accountType: "paid-monthly" OR "paid-yearly"
  const { accountType } = req.body;

  if (!accountType) {
    return res.status(400).json({ error: "accountType is required." });
  }

  /**
   *  Define your two Price IDs (from .env). 
   *  If the user picks "paid-monthly" or "paid-yearly", we map them accordingly.
   */
  const priceIds = {
    "paid-monthly": process.env.STRIPE_PRICE_ID_PAID_MONTHLY,
    "paid-yearly": process.env.STRIPE_PRICE_ID_PAID_YEARLY,
  };

  // Ensure the passed accountType is valid
  const selectedPriceId = priceIds[accountType];
  if (!selectedPriceId) {
    return res.status(400).json({ error: "Invalid accountType." });
  }

  try {
    // Create the session for Embedded Checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", 
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      // Make sure you're using "embedded" if you're embedding the checkout in an iFrame
      ui_mode: "embedded",
      // Return URL if user closes or completes checkout 
      return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true },
      customer_email: req.user.email, // from authMiddleware
      metadata: {
        userId: req.user.id,  // your user ID 
        accountType,          // e.g. "paid-monthly" or "paid-yearly"
      },
    });

    // For embedded checkout, return the client_secret for the front-end
    res.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Error creating embedded session:", err);
    res.status(500).json({ error: "Failed to create embedded checkout session." });
  }
});

/**
 * @route   GET /api/checkout/session-status
 * @desc    Retrieve the status of a Stripe Checkout session
 * @access  Private
 */
router.get("/session-status", authMiddleware, async (req, res) => {
  try {
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id in query." });
    }

    // Retrieve the Checkout session from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    res.json({
      status: session.status,
      customer_email: session.customer_details?.email || null,
    });
  } catch (error) {
    console.error("Error retrieving session status:", error);
    res.status(500).json({ error: "Failed to retrieve session status." });
  }
});

/**
 * @route   POST /api/checkout/cancel-subscription
 * @desc    Cancel the user's subscription immediately
 * @access  Private
 */
router.post("/cancel-subscription", authMiddleware, async (req, res) => {
  try {
    const subscriptionId = req.user.subscriptionId;

    if (!subscriptionId) {
      return res.status(400).json({ error: "No subscription found for this user." });
    }

    // Cancel the subscription using Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update the user's record to reflect the canceled subscription
    const db = getDB();
    const usersCollection = db.collection("users");
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { accountType: "free" } }
    );

    res.status(200).json({
      message: "Subscription canceled successfully.",
      subscription,
    });
  } catch (err) {
    console.error("Error canceling subscription:", err);
    res.status(500).json({ error: "Failed to cancel subscription." });
  }
});

module.exports = router;
