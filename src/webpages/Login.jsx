import React, { useState } from "react";
import PropTypes from "prop-types";
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Checkbox,
  FormControlLabel,
  Switch,
} from "@mui/material";
import Grid from "@mui/material/Grid2";
import axios from "axios";

const LoginPage = ({ setIsLoggedIn, setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isCreateAccount, setIsCreateAccount] = useState(true); // Toggle between login and create account
  const [loading, setLoading] = useState(false); // Loading state
  const [error, setError] = useState(""); // Error message

  const handleToggleChange = (event) => {
    setIsCreateAccount(event.target.checked);
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const endpoint = isCreateAccount ? "/api/auth/register" : "/api/auth/login";

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}${endpoint}`,
        { email, password }
      );

      const { token, user } = response.data;

      // Store token and user in localStorage
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // Update user state
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
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="First Name"
                  variant="outlined"
                  required
                />
              </Grid>
              <Grid size={{ xs: 12, sm: 6 }}>
                <TextField
                  fullWidth
                  label="Last Name"
                  variant="outlined"
                  required
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label="Company"
              variant="outlined"
              sx={{ mb: 2 }}
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

// Prop validation
LoginPage.propTypes = {
  setIsLoggedIn: PropTypes.func.isRequired,
  setUser: PropTypes.func.isRequired,
};

export default LoginPage;
