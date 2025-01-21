import axios from "axios";

/**
 * Redirects the user to the Stripe Checkout page in a new tab.
 *
 * @param {string} accountType - The type of account (e.g., 'free', 'paid').
 * @param {function} showSnackbar - Function to display messages to the user.
 * @returns {Promise<void>}
 */
export const redirectToStripeCheckout = async (accountType, showSnackbar) => {
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  try {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("User is not authenticated.");
    }

    // 1. Create a Checkout Session on your backend.
    const response = await axios.post(
      `${BACKEND}/api/checkout/create-checkout-session`,
      { accountType },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    // 2. Get the Checkout URL from the response.
    const { checkoutUrl } = response.data;
    if (!checkoutUrl) {
      throw new Error("No Checkout URL returned from server.");
    }

    // 3. Open Stripe Checkout in a new tab.
    window.open(checkoutUrl, "_blank");

    // Optionally, show a message or handle success logic here
  } catch (err) {
    console.error("Error starting Stripe Checkout flow:", err);
    showSnackbar(
      err.response?.data?.error ||
        err.message ||
        "An error occurred while processing your request.",
      "error"
    );
  }
};
