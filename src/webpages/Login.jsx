import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext"; // Import SnackbarContext

// MUI Component Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";

const LoginPage = () => {
  // State for form fields
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // New state
  const [lastName, setLastName] = useState(""); // New state
  const [company, setCompany] = useState(""); // New state

  // State to manage authentication mode: 'login' or 'create'
  const [authMode, setAuthMode] = useState("login"); // Default to 'login'

  // Loading state
  const [loading, setLoading] = useState(false);

  // Accessing UserContext to reset it and update user/authentication state
  const {
    resetUserContext,
    setUser,
    setIsLoggedIn,
    isLoggedIn,
  } = useContext(UserContext);

  // Access Snackbar Context
  const { showSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();

  /**
   * Handles changes in the RadioGroup (auth mode selection).
   *
   * @param {Object} event - The change event.
   */
  const handleAuthModeChange = (event) => {
    setAuthMode(event.target.value);
    // Reset form fields when switching modes
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setCompany("");
  };

  /**
   * Handles form submission for both login and create account.
   *
   * @param {Object} e - The form submission event.
   */
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Determine the endpoint based on the mode
    const endpoint =
      authMode === "create" ? "/api/auth/register" : "/api/auth/login";

    // Prepare the payload
    const payload =
      authMode === "create"
        ? { email, password, firstName, lastName, company }
        : { email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}${endpoint}`,
        payload
      );

      const { token, user } = response.data;

      // Clear any existing user data to reset contexts
      resetUserContext();

      // Store token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update user state in context
      setUser(user);
      setIsLoggedIn(true);

      // Show success Snackbar
      showSnackbar(
        authMode === "create"
          ? "Account created successfully!"
          : "Login successful!",
        "success"
      );
    } catch (err) {
      console.error(err);

      // Show error Snackbar
      showSnackbar(
        err.response?.data?.error || "An error occurred. Please try again.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to handle navigation after successful login or account creation.
   */
  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  return (
    <Container
      maxWidth="sm"
      sx={{
        mt: 5,
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 4,
      }}
    >
      <Box textAlign="center" sx={{ transition: "all 0.3s ease-in-out", mb: 2 }}>
        {/* RadioGroup for Auth Mode Selection */}
        <FormControl component="fieldset" sx={{ mb: 3 }}>
          <RadioGroup
            row
            aria-label="auth mode"
            name="auth-mode"
            value={authMode}
            onChange={handleAuthModeChange}
          >
            <FormControlLabel value="login" control={<Radio />} label="Login" />
            <FormControlLabel
              value="create"
              control={<Radio />}
              label="Create Account"
            />
          </RadioGroup>
        </FormControl>

        <Typography variant="h4" color="primary">
          ClipCard
        </Typography>
        <Typography
          variant="h5"
          color="textPrimary"
          sx={{ mt: 1, fontWeight: "bold" }}
        >
          {authMode === "create"
            ? "Create study cards from any video."
            : "Login to your account."}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          {authMode === "create"
            ? "Get ready for higher performance, reduced costs, and greater ease of use."
            : "Access your study cards and continue learning."}
        </Typography>
      </Box>

      {/* Form */}
      <Box component="form" onSubmit={handleSubmit}>
        {/* Conditionally render fields for Create Account */}
        {authMode === "create" && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  required
                  value={lastName}
                  onChange={(e) => setLastName(e.target.value)}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Company"
              variant="outlined"
              sx={{ mb: 2 }}
              value={company}
              onChange={(e) => setCompany(e.target.value)}
            />
          </>
        )}

        {/* Common Fields */}
        <TextField
          fullWidth
          label="Email"
          type="email"
          variant="outlined"
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          fullWidth
          label="Password"
          type="password"
          variant="outlined"
          sx={{ mb: 2 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Conditionally render Terms of Service checkbox for Create Account */}
        {authMode === "create" && (
          <FormControlLabel
            control={<Checkbox color="primary" required />}
            label="I agree to the Terms of Service and Privacy Policy."
            sx={{ mb: 2 }}
          />
        )}

        {/* Submit Button */}
        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          type="submit"
          disabled={loading}
        >
          {loading
            ? authMode === "create"
              ? "Creating Account..."
              : "Logging In..."
            : authMode === "create"
            ? "Create your ClipCard account"
            : "Login"}
        </Button>
      </Box>
    </Container>
  );
};

// Removed propTypes since we are not passing props
LoginPage.propTypes = {};

export default LoginPage;
