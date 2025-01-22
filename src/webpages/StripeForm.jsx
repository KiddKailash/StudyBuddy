import React, { useCallback, useEffect, useState, useContext } from "react";
import PropTypes from "prop-types";
import { loadStripe } from "@stripe/stripe-js";
import {
  EmbeddedCheckoutProvider,
  EmbeddedCheckout,
} from "@stripe/react-stripe-js";
import { Navigate } from "react-router-dom";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import { Box, CircularProgress, Typography, Link, Alert } from "@mui/material";

// Make sure to call `loadStripe` outside of a component’s render to avoid
// recreating the `Stripe` object on every render.
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

/**
 * CheckoutForm Component
 *
 * Renders the embedded Stripe Checkout form.
 * Requires the user to be authenticated and sends the accountType to the backend.
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
  accountType: PropTypes.string,
  showSnackbar: PropTypes.func,
};

export const Return = () => {
  const [status, setStatus] = useState(null);
  const [customerEmail, setCustomerEmail] = useState("");
  const { setUser } = useContext(UserContext);
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

        // Update user context after successful return
        const updatedUserResponse = await axios.get(`${BACKEND}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUser(updatedUserResponse.data.user);
      } catch (error) {
        console.error("Error fetching session status:", error);
        setStatus("error");
      }
    };

    fetchSessionStatus();
  }, [BACKEND, setUser]);

  if (status === "open") {
    return <Navigate to="/checkout" />;
  }

  if (status === "complete") {
    return (
      <Box id="success" textAlign="center" padding={4}>
        <Alert severity="success">
          We appreciate your business! A confirmation email has been sent to{" "}
          <strong>{customerEmail}</strong>. If you have any questions, please
          email{" "}
          <Link href="mailto:kiddkailash@gmail.com" underline="hover">
            our admin team
          </Link>
          .
        </Alert>
      </Box>
    );
  }

  if (status === "unauthorized") {
    return (
      <Box id="unauthorized" textAlign="center" padding={4}>
        <Alert severity="warning">
          Your session has expired. Please{" "}
          <Link href="/login" underline="hover">
            log in
          </Link>{" "}
          again.
        </Alert>
      </Box>
    );
  }

  if (status === "error") {
    return (
      <Box id="error" textAlign="center" padding={4}>
        <Alert severity="error">
          There was an error processing your subscription. Please try again.
        </Alert>
      </Box>
    );
  }

  // Loading state
  return (
    <Box id="loading" textAlign="center" padding={4}>
      <CircularProgress />
      <Typography variant="body1" marginTop={2}>
        Processing your subscription...
      </Typography>
    </Box>
  );
};
