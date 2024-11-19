import React, { useState, useContext } from 'react';
import axios from 'axios';
import { UserContext } from "../contexts/UserContext";

// MUI Component Imports
import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';
import Button from '@mui/material/Button';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Alert from '@mui/material/Alert';

// Stripe Imports
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your publishable key
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const UpgradeSubscription = () => {
  const { user, setUser } = useContext(UserContext);
  const [accountType, setAccountType] = useState(user.accountType);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleUpgrade = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) throw new Error('User is not authenticated.');

      // Make a request to create a Checkout session
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
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });

      if (stripeError) {
        console.error('Stripe Checkout error:', stripeError);
        setError(stripeError.message);
      }
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'An error occurred while upgrading your subscription.'
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
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
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
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={handleUpgrade}
          disabled={loading || accountType === 'free'}
        >
          {loading ? 'Processing...' : 'Upgrade'}
        </Button>
      </Box>
    </Container>
  );
};

export default UpgradeSubscription;
