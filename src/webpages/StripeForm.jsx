import React, { useEffect, useState, useContext } from "react";
import { Navigate } from "react-router-dom";
import axios from "axios";
import UserContext from "../contexts/UserContext";
import {
  Box,
  CircularProgress,
  Typography,
  Link,
  Alert,
} from "@mui/material";

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
          <strong>{customerEmail}</strong>. If you have any questions, please email{" "}
          <Link href="mailto:kiddkailash@gmail.com" underline="hover">
            our admin team
          </Link>.
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
