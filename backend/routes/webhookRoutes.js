const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { getDB } = require('../database/db');
const { ObjectId } = require('mongodb');

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const webhookHandler = async (req, res) => {
  console.log('Webhook received');
  let event;
  try {
    const signature = req.headers['stripe-signature'];
    // Stripe requires the raw body, which is available because of express.raw()
    event = stripe.webhooks.constructEvent(req.body, signature, endpointSecret);
    console.log(`Event type: ${event.type}`);
  } catch (err) {
    console.error(`Webhook signature verification failed:`, err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const db = getDB();

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed': {
      const session = event.data.object;
      const customerId = session.customer; 
      const userId = session.metadata.userId; 
      const chosenPlan = session.metadata.accountType; // "paid-monthly" or "paid-yearly"
    
      await db.collection('users').updateOne(
        { _id: new ObjectId(userId) },
        {
          $set: {
            stripeCustomerId: customerId,
            accountType: chosenPlan,  // store the EXACT plan type
            subscriptionStatus: 'active',
            subscriptionId: session.subscription,
          },
        }
      );
      break;
    }

    case 'customer.subscription.created':
    case 'customer.subscription.updated': {
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription ${event.type} for customer ${customerId}`);

      // Update your database with the new subscription status and accountType
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
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment succeeded for customer ${customerId}`);

      // Update your database to mark the payment as successful
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
      const invoice = event.data.object;
      const customerId = invoice.customer;

      console.log(`Payment failed for customer ${customerId}`);

      // Update your database to mark the payment as failed
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
      const subscription = event.data.object;
      const customerId = subscription.customer;

      console.log(`Subscription deleted for customer ${customerId}`);

      // Update your database to reflect the cancellation
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
      console.log(`Unhandled event type ${event.type}`);
  }

  // Acknowledge receipt of the event
  res.status(200).send('Event received');
};

module.exports = webhookHandler;
