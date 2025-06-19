/**
 * Stripe Webhook Handler Module
 * 
 * Handles webhook events from Stripe payment processing service.
 * Processes subscription lifecycle events and updates user account status.
 * 
 * Webhook Events Handled:
 * - checkout.session.completed: New subscription creation
 * - customer.subscription.created/updated: Subscription status changes
 * - invoice.payment_succeeded/failed: Payment status updates
 * - customer.subscription.deleted: Subscription cancellation
 */
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

// Webhook endpoint secret for signature verification
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

/**
 * Stripe webhook event handler
 * 
 * Processes incoming webhook events from Stripe and updates user account
 * status accordingly. Verifies webhook signature for security and handles
 * various subscription lifecycle events.
 * 
 * Process Flow:
 * 1. Verifies webhook signature using Stripe SDK
 * 2. Extracts event type and data from webhook payload
 * 3. Routes to appropriate event handler based on event type
 * 4. Updates user database records with subscription/payment status
 * 5. Returns acknowledgment to Stripe
 * 
 * @param {Object} req - Express request object with raw body
 * @param {Object} res - Express response object
 * @returns {Promise<void>} Acknowledgment response to Stripe
 */
const webhookHandler = async (req, res) => {
  console.log('Webhook received');
  let event;
  
  try {
    // Extract Stripe signature from headers for verification
    const signature = req.headers['stripe-signature'];
    
    // Verify webhook signature using raw body and endpoint secret
    // This ensures the webhook came from Stripe and hasn't been tampered with
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    console.log(`Event type: ${event.type}`);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Get database connection for user updates
  const db = getDB();

  // Route webhook event to appropriate handler based on event type
  switch (event.type) {
    case 'checkout.session.completed': {
      // Handle successful checkout completion (new subscription)
      const session = event.data.object;
      const customerId = session.customer; 
      const userId = session.metadata.userId; 
      const chosenPlan = session.metadata.accountType; // "paid-monthly" or "paid-yearly"
    
      // Update user record with subscription information
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            stripeCustomerId: customerId,
            accountType: chosenPlan,  // Store the exact plan type
            subscriptionStatus: 'active',
            subscriptionId: session.subscription,
          },
        }
      );
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      // Handle subscription creation or updates
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription ${event.type} for customer ${customerId}`);

      // Update user account status based on subscription status
      try {
        const accountType = subscription.status === 'active' ? 'paid' : 'free';

        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          {
            $set: {
              subscriptionStatus: subscription.status,
              subscriptionId: subscription.id,
              accountType: accountType, // Update accountType based on subscription status
            },
          }
        );
      } catch (error) {
        console.error(`Failed to update subscription status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    case 'invoice.payment_succeeded': {
      // Handle successful payment processing
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment succeeded for customer ${customerId}`);

      // Update payment status in user record
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          {
            $set: {
              paymentStatus: 'succeeded',
              lastInvoice: invoice.id,
            },
          }
        );
      } catch (error) {
        console.error(`Failed to update payment status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    case 'invoice.payment_failed': {
      // Handle failed payment processing
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment failed for customer ${customerId}`);

      // Update payment status in user record
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          {
            $set: {
              paymentStatus: 'failed',
              lastInvoice: invoice.id,
            },
          }
        );
      } catch (error) {
        console.error(`Failed to update payment status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    case 'customer.subscription.deleted': {
      // Handle subscription cancellation
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription deleted for customer ${customerId}`);

      // Update user record to reflect subscription cancellation
      try {
        await db.collection('users').updateOne(
          { stripeCustomerId: customerId },
          {
            $set: {
              subscriptionStatus: 'canceled',
              subscriptionId: null,
              accountType: 'free', // Downgrade accountType to 'free'
            },
          }
        );
      } catch (error) {
        console.error(`Failed to update subscription status:`, error);
        return res.status(500).send('Database error');
      }

      break;
    }

    default:
      // Log unhandled event types for monitoring
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the webhook event to Stripe
  res.status(200).send('Event received');
};

module.exports = webhookHandler;
