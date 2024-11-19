const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const authMiddleware = require('../middleware/authMiddleware');

/**
 * @route   POST /api/checkout/create-checkout-session
 * @desc    Create a Stripe Checkout session
 * @access  Private
 */
router.post('/create-checkout-session', authMiddleware, async (req, res) => {
  const { accountType } = req.body;

  if (!accountType) {
    return res.status(400).json({ error: 'Account type is required.' });
  }

  const priceIds = {
    paid: process.env.STRIPE_PRICE_ID_PAID, // Set this in your .env
  };

  const selectedPriceId = priceIds[accountType];

  if (!selectedPriceId) {
    return res.status(400).json({ error: 'Invalid account type.' });
  }

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: selectedPriceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL}/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.CLIENT_URL}/cancel`,
      automatic_tax: { enabled: true },
      metadata: {
        userId: req.user.id,
        accountType: accountType,
      },
    });

    // Return session ID to the frontend
    res.json({ sessionId: session.id });
  } catch (error) {
    console.error('Error creating Stripe Checkout session:', error);
    res.status(500).json({ error: 'Failed to create checkout session.' });
  }
});

module.exports = router;
