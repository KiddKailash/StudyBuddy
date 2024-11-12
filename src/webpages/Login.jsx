import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { UserContext } from '../contexts/UserContext';

// ================================
// MUI Component Imports
// ================================
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Switch from "@mui/material/Switch";
import Grid from "@mui/material/Grid";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

const LoginPage = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState(""); // New state
  const [lastName, setLastName] = useState("");   // New state
  const [company, setCompany] = useState("");     // New state
  const [isCreateAccount, setIsCreateAccount] = useState(true); // Toggle between login and create account
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  // Accessing UserContext to reset it and update user/authentication state
  const { resetUserContext, setUser, setIsLoggedIn, isLoggedIn, flashcardSessions, loadingSessions } = useContext(UserContext);

  const navigate = useNavigate();

  const handleToggleChange = (event) => {
    setIsCreateAccount(event.target.checked);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    // Determine the endpoint based on the mode
    const endpoint = isCreateAccount ? "/api/auth/register" : "/api/auth/login";

    // Prepare the payload
    const payload = isCreateAccount
      ? { email, password, firstName, lastName, company }
      : { email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}${endpoint}`,
        payload
      );

      const { token, user } = response.data;

      // Clear any existing user data to reset contexts
      resetUserContext(); // Function to reset contexts

      // Store token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update user state in context
      setUser(user);
      setIsLoggedIn(true);
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error || "An error occurred. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Effect to handle navigation after successful login or account creation.
   */
  useEffect(() => {
    if (isLoggedIn && !loadingSessions) {
      if (flashcardSessions && flashcardSessions.length > 0) {
        // Navigate to the first flashcard session
        navigate(`/flashcards/${flashcardSessions[0].id}`);
      } else {
        // Navigate to the home page if no flashcard sessions exist
        navigate("/");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, loadingSessions, flashcardSessions]);

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
      <Box textAlign="center" mb={2}>
        <Box display="flex" alignItems="center" justifyContent="center" mb={2}>
          <Typography variant="body1" sx={{ mr: 1 }}>
            Login
          </Typography>
          <Switch
            checked={isCreateAccount}
            onChange={handleToggleChange}
            color="primary"
            inputProps={{
              "aria-label": "toggle login or create account",
            }}
          />
          <Typography variant="body1" sx={{ ml: 1 }}>
            Create
          </Typography>
        </Box>

        <Typography variant="h4" color="primary">
          ClipCard
        </Typography>
        <Typography
          variant="h5"
          color="textPrimary"
          sx={{ mt: 1, fontWeight: "bold" }}
        >
          {isCreateAccount
            ? "Create study cards from any video."
            : "Login to your account."}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          {isCreateAccount
            ? "Get ready for higher performance, reduced costs, and greater ease of use."
            : "Access your study cards and continue learning."}
        </Typography>
      </Box>

      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        {isCreateAccount && (
          <>
            <Grid container spacing={2} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  required
                  value={firstName}
                  onChange={(e) => setFirstName(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
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
              required
            />
          </>
        )}
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

        {isCreateAccount && (
          <FormControlLabel
            control={<Checkbox color="primary" required />}
            label="I agree to the Terms of Service and Privacy Policy."
          />
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          sx={{ mt: 2 }}
          type="submit"
          disabled={loading}
        >
          {loading
            ? isCreateAccount
              ? "Creating Account..."
              : "Logging In..."
            : isCreateAccount
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
