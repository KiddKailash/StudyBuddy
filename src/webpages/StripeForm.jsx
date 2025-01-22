import React, { useCallback, useEffect, useState } from "react";
import PropTypes from "prop-types";
import axios from "axios";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { useNavigate, Navigate } from "react-router-dom";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

/**
 * CheckoutForm Component
 *
 * Renders the embedded Stripe Checkout form.
 * Requires the user to be authenticated and sends the accountType to the backend.
 *
 * Props:
 * - accountType (string): The type of account to create a checkout session for.
 * - showSnackbar (function): Function to display notifications to the user.
 */
export const CheckoutForm = ({ accountType = "paid", showSnackbar }) => {
  /**
   * Fetches the client secret from the backend to initiate the embedded Checkout.
   */
  const fetchClientSecret = useCallback(async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      // POST to your create-checkout-session endpoint using Axios
      const response = await axios.post(
        `${BACKEND}/api/checkout/create-checkout-session`,
        { accountType }, // e.g., { accountType: "paid" }
        {
          headers: {
            Authorization: `Bearer ${token}`, // Important for authMiddleware
            "Content-Type": "application/json",
          },
        }
      );

      // Check if clientSecret is present in the response
      if (!response.data.clientSecret) {
        throw new Error("No clientSecret returned from server.");
      }

      return response.data.clientSecret;
    } catch (err) {
      console.error("Error starting Stripe Checkout flow:", err);
      if (showSnackbar && typeof showSnackbar === "function") {
        showSnackbar(
          err.response?.data?.error ||
            err.message ||
            "An error occurred while creating the Checkout Session.",
          "error"
        );
      }
      return null; // Return null so the EmbeddedCheckout component won't render
    }
  }, [accountType, showSnackbar]);

  // Provide fetchClientSecret to EmbeddedCheckoutProvider
  const options = { fetchClientSecret };

  return (
    <div id="checkout">
      <EmbeddedCheckoutProvider stripe={stripePromise} options={options}>
        <EmbeddedCheckout />
      </EmbeddedCheckoutProvider>
    </div>
  );
};

/**
 * PropTypes Validation
 */
CheckoutForm.propTypes = {
  /**
   * The type of account to create a checkout session for.
   * Typically "paid" or other defined account types.
   */
  accountType: PropTypes.string,

  /**
   * A function to display notifications or messages to the user.
   * Should accept two arguments: message (string) and type (string).
   */
  showSnackbar: PropTypes.func,
};

/**
 * Return Component
 *
 * Since `success_url` is not supported with `ui_mode: 'embedded'`,
 * this component relies on webhook updates. It can display a loading state.
 */
export const Return = () => {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const navigate = useNavigate();
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  useEffect(() => {
    const fetchSessionStatus = async () => {
      try {
        const queryString = window.location.search;
        const urlParams = new URLSearchParams(queryString);
        const sessionId = urlParams.get("session_id");

        if (!sessionId) {
          console.error("No session_id found in URL.");
          setStatus("error");
          return;
        }

        // Fetch session status from the backend
        const token = localStorage.getItem("token");
        if (!token) {
          console.error("User is not authenticated.");
          setStatus("unauthorized");
          return;
        }

        const response = await axios.get(
          `${BACKEND}/api/checkout/session-status`,
          {
            params: { session_id: sessionId },
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setStatus(response.data.status);
        setCustomerEmail(response.data.customer_email);
      } catch (error) {
        console.error("Error fetching session status:", error);
        setStatus("error");
      }
    };

    fetchSessionStatus();
  }, [BACKEND]);

  if (status === "open") {
    return <Navigate to="/checkout" />;
  }

  if (status === "complete") {
    return (
      <section id="success">
        <p>
          We appreciate your business! A confirmation email has been sent to{" "}
          {customerEmail}. If you have any questions, please email{" "}
          <a href="mailto:orders@example.com">orders@example.com</a>.
        </p>
      </section>
    );
  }

  if (status === "unauthorized") {
    return (
      <section id="unauthorized">
        <p>
          Your session has expired. Please <a href="/login">log in</a> again.
        </p>
      </section>
    );
  }

  if (status === "error") {
    return (
      <section id="error">
        <p>
          There was an error processing your subscription. Please try again.
        </p>
      </section>
    );
  }

  // Loading state
  return (
    <section id="loading">
      <p>Processing your subscription...</p>
    </section>
  );
};

Return.propTypes = {};
