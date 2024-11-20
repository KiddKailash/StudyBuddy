import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

/**
 * Redirects the user to the Stripe Checkout page.
 *
 * @param {string} accountType - The type of account (e.g., 'free', 'paid').
 * @param {function} showSnackbar - Function to display messages to the user.
 * @returns {Promise<void>}
 */
export const redirectToStripeCheckout = async (accountType, showSnackbar) => {
  try {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("User is not authenticated.");

    // Create a Checkout session
    const response = await axios.post(
      `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/checkout/create-checkout-session`,
      { accountType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    const { sessionId } = response.data;

    // Redirect to Stripe Checkout
    const stripe = await stripePromise;
    const { error: stripeError } = await stripe.redirectToCheckout({
      sessionId,
    });

    if (stripeError) {
      console.error("Stripe Checkout error:", stripeError);
      showSnackbar(stripeError.message, "error");
    }
  } catch (err) {
    console.error(err);
    showSnackbar(
      err.response?.data?.error ||
        err.message ||
        "An error occurred while processing your request.",
      "error"
    );
  }
};
