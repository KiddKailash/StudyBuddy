// src/webpages/UpgradeSubscription.jsx
import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../contexts/UserContext";
import {
  Box,
  Container,
  Typography,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';

/**
 * UpgradeSubscription component allows users to upgrade their subscription.
 *
 * @return {JSX.Element} - The rendered UpgradeSubscription component.
 */
const UpgradeSubscription = () => {
  const { user, setUser } = useContext(UserContext); // Consume context
  const [accountType, setAccountType] = useState(user.accountType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles the subscription upgrade process.
   */
  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/auth/upgrade`,
        { accountType },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      const { token, user: updatedUser } = response.data;

      // Update token and user in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(updatedUser));

      // Update user state
      setUser(updatedUser);

      alert('Subscription upgraded successfully!');
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          'An error occurred. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ mt: 5 }}>
      <Typography variant="h5" gutterBottom>
        Upgrade Subscription
      </Typography>
      {error && (
        <Typography color="error" sx={{ mb: 2 }}>
          {error}
        </Typography>
      )}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <FormControl fullWidth>
          <InputLabel id="account-type-label">Account Type</InputLabel>
          <Select
            labelId="account-type-label"
            value={accountType}
            label="Account Type"
            onChange={(e) => setAccountType(e.target.value)}
          >
            <MenuItem value="free">Free</MenuItem>
            <MenuItem value="paid">Paid</MenuItem>
            {/* Add more tiers if necessary */}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpgrade}
          disabled={loading}
        >
          {loading ? 'Upgrading...' : 'Upgrade'}
        </Button>
      </Box>
    </Container>
  );
};

// Removed propTypes since we are not passing props
UpgradeSubscription.propTypes = {};

export default UpgradeSubscription;
