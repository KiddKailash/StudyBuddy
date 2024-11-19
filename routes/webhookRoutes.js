const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDB } = require('../utils/db');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * @route   POST /webhook
 * @desc    Stripe webhook to handle subscription and payment events
 * @access  Public
 */
router.post('/', async (req, res) => {
  let event;

  try {
    // Stripe expects the raw body to construct the event
    const signature = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
  } catch (err) {
    console.error(`⚠️ Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getDB();

  // Handle the event
  switch (event.type) {
    case 'invoice.payment_succeeded': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment succeeded for customer ${customerId}`);

      // Update your database to mark the payment as successful
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          { $set: { paymentStatus: 'succeeded', lastInvoice: invoice.id } }
        );
      } catch (error) {
        console.error(`Failed to update payment status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    case 'invoice.payment_failed': {
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment failed for customer ${customerId}`);

      // Update your database to mark the payment as failed
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          { $set: { paymentStatus: 'failed', lastInvoice: invoice.id } }
        );
      } catch (error) {
        console.error(`Failed to update payment status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription updated for customer ${customerId}`);

      // Update your database with the new subscription status
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          { $set: { subscriptionStatus: subscription.status, subscriptionId: subscription.id } }
        );
      } catch (error) {
        console.error(`Failed to update subscription status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    case 'customer.subscription.deleted': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription deleted for customer ${customerId}`);

      // Update your database to reflect the cancellation
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          { $set: { subscriptionStatus: 'canceled', subscriptionId: null } }
        );
      } catch (error) {
        console.error(`Failed to update subscription status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.status(200).send('Event received');
});

module.exports = router;
