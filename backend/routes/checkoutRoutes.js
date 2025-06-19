/**
 * Stripe Checkout Routes Module
 * 
 * Defines Express.js routes for Stripe payment processing and subscription management.
 * Provides endpoints for creating checkout sessions, checking payment status,
 * and managing user subscriptions. All routes require JWT authentication.
 * 
 * Key Features:
 * - Stripe embedded checkout session creation
 * - Subscription status checking
 * - Subscription cancellation
 * - Payment processing integration
 * - User account type management
 * 
 * Dependencies:
 * - Express.js for route handling
 * - Stripe SDK for payment processing
 * - authMiddleware for JWT authentication
 * - MongoDB for user data updates
 * 
 * Environment Variables:
 * - STRIPE_SECRET_KEY: Stripe secret key for API access
 * - CLIENT_URL: Frontend URL for checkout return
 * - STRIPE_PRICE_ID_PAID_MONTHLY: Monthly subscription price ID
 * - STRIPE_PRICE_ID_PAID_YEARLY: Yearly subscription price ID
 * 
 * Route Base: /api/checkout
 * Authentication: All routes require valid JWT token
 */
const express = require("express");
const router = express.Router();
const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require("../middleware/authMiddleware");
const { getDB } = require("../database/db");
const { ObjectId } = require("mongodb");

// Frontend domain for checkout return URLs
const YOUR_DOMAIN = process.env.CLIENT_URL;

// Validate required environment variable
if (!YOUR_DOMAIN) {
  console.error("Error: CLIENT_URL is not defined in environment variables.");
  process.exit(1);
}

/**
 * @route   POST /api/checkout/create-checkout-session
 * @desc    Create a Stripe Checkout session for upgrading to a paid subscription
 * @access  Private (JWT required)
 * @body    {accountType} - "paid-monthly" or "paid-yearly"
 * @returns {clientSecret} - Client secret for embedded checkout
 */
router.post("/create-checkout-session", authMiddleware, async (req, res) => {
  // Extract account type from request body
  const { accountType } = req.body;

  // Validate required account type parameter
  if (!accountType) {
    return res.status(400).json({ error: "accountType is required." });
  }

  // Map account types to Stripe price IDs
  // These price IDs are configured in Stripe dashboard and stored in environment variables
  const priceIds = {
    "paid-monthly": process.env.STRIPE_PRICE_ID_PAID_MONTHLY,
    "paid-yearly": process.env.STRIPE_PRICE_ID_PAID_YEARLY,
  };

  // Validate that the provided account type is supported
  const selectedPriceId = priceIds[accountType];
  if (!selectedPriceId) {
    return res.status(400).json({ error: "Invalid accountType." });
  }

  try {
    // Create Stripe checkout session for embedded checkout
    const session = await stripe.checkout.sessions.create({
      mode: "subscription", // Recurring subscription mode
      payment_method_types: ["card"], // Accept card payments
      line_items: [
        {
          price: selectedPriceId, // Use the selected price ID
          quantity: 1, // One subscription
        },
      ],
      // Configure for embedded checkout in iframe
      ui_mode: "embedded",
      // Return URL for checkout completion or cancellation
      return_url: `${YOUR_DOMAIN}/return?session_id={CHECKOUT_SESSION_ID}`,
      automatic_tax: { enabled: true }, // Enable automatic tax calculation
      customer_email: req.user.email, // Pre-fill customer email
      metadata: {
        userId: req.user.id,  // Store user ID for webhook processing
        accountType,          // Store account type for webhook processing
      },
    });

    // Return client secret for embedded checkout frontend integration
    res.json({ clientSecret: session.client_secret });
  } catch (err) {
    console.error("Error creating embedded session:", err);
    res.status(500).json({ error: "Failed to create embedded checkout session." });
  }
});

/**
 * @route   GET /api/checkout/session-status
 * @desc    Retrieve the status of a Stripe Checkout session
 * @access  Private (JWT required)
 * @query   {session_id} - Stripe checkout session ID
 * @returns {status, customer_email} - Session status and customer details
 */
router.get("/session-status", authMiddleware, async (req, res) => {
  try {
    // Extract session ID from query parameters
    const { session_id } = req.query;
    if (!session_id) {
      return res.status(400).json({ error: "Missing session_id in query." });
    }

    // Retrieve checkout session details from Stripe
    const session = await stripe.checkout.sessions.retrieve(session_id);

    // Return session status and customer information
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
 * @desc    Cancel the user's active subscription immediately
 * @access  Private (JWT required)
 * @returns {message, subscription} - Cancellation confirmation and subscription details
 */
router.post("/cancel-subscription", authMiddleware, async (req, res) => {
  try {
    // Get subscription ID from authenticated user data
    const subscriptionId = req.user.subscriptionId;

    // Validate that user has an active subscription
    if (!subscriptionId) {
      return res.status(400).json({ error: "No subscription found for this user." });
    }

    // Cancel the subscription in Stripe
    const subscription = await stripe.subscriptions.cancel(subscriptionId);

    // Update user record to reflect subscription cancellation
    const db = getDB();
    const usersCollection = db.collection("users");
    await usersCollection.updateOne(
      { _id: new ObjectId(req.user.id) },
      { $set: { accountType: "free" } } // Downgrade to free account
    );

    // Return success response with subscription details
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
