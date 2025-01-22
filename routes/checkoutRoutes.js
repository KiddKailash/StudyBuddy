const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

/**
 * @route   POST /api/checkout/create-checkout-session
 * @desc    Create a Stripe Checkout session for upgrading to a paid subscription (Embedded)
 * @access  Private
 */
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  const { accountType } = req.body;

  if (!accountType) {
    return res.status(400).json({ error: "Account type is required." });
  }

  // Define your Price IDs here (from .env)
  const priceIds = {
    paid: process.env.STRIPE_PRICE_ID_PAID,
    // Add other account types and corresponding Price IDs if you have them
  };

  const selectedPriceId = priceIds[accountType];
  if (!selectedPriceId) {
    return res.status(400).json({ error: "Invalid account type." });
  }

  try {
    // Create the session for Embedded Checkout
    const session = await stripe.checkout.sessions.create({
      ui_mode: "embedded",
      payment_method_types: ["card"],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: "subscription", // or 'payment' if it's a one-time purchase
      success_url: `${process.env.CLIENT_URL}/return?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/return?canceled=true`,
      automatic_tax: { enabled: true },
      customer_email: req.user.email,
      metadata: {
        userId: req.user.id,
        accountType,
      },
    });

    // For embedded checkout, return the client_secret for the front-end
    res.json({
      clientSecret: session.client_secret,
    });
  } catch (err) {
    console.error("Error creating embedded session:", err);
    res.status(500).json({ error: "Failed to create embedded checkout session." });
  }
});

/**
 * @route   GET /api/checkout/session-status
 * @desc    Retrieve the status of a Stripe Checkout session
 * @access  Private (requires Auth)
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
      return res
        .status(400)
        .json({ error: "No subscription found for this user." });
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
