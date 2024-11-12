import React, { useState, useContext, useEffect } from 'react';
import { UserContext } from '../contexts/UserContext';
import axios from 'axios';

// MUI Component Imports
import Container from '@mui/material/Container';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Switch from '@mui/material/Switch';
import FormControlLabel from '@mui/material/FormControlLabel';
import Alert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';
import CircularProgress from '@mui/material/CircularProgress';

const SettingsPage = () => {
  const { user, setUser } = useContext(UserContext);

  // State for Account Information
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [company, setCompany] = useState(user?.company || '');

  // State for Preferences
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notificationsEnabled || false
  );

  // State for Password Change
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Loading and Error States
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');

  /**
   * Handles account information submission.
   */
  const handleAccountInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Prepare the payload
    const payload = {
      firstName,
      lastName,
      email,
      company,
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/users/update`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update user context
      setUser(response.data.user);

      setSnackbarMessage('Account information updated successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating account information:', err);
      setError(err.response?.data?.error || 'Failed to update account information.');
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles password change submission.
   */
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.');
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
      setLoading(false);
      return;
    }

    // Prepare the payload
    const payload = {
      currentPassword,
      newPassword,
    };

    try {
      await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/users/change-password`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      setSnackbarMessage('Password changed successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);

      // Reset password fields
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      console.error('Error changing password:', err);
      setError(err.response?.data?.error || 'Failed to change password.');
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles preferences update.
   */
  const handlePreferencesChange = async () => {
    setLoading(true);
    setError('');

    // Prepare the payload
    const payload = {
      preferences: {
        darkMode,
        notificationsEnabled,
      },
    };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/users/preferences`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );

      // Update user context
      setUser(response.data.user);

      setSnackbarMessage('Preferences updated successfully.');
      setSnackbarSeverity('success');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error updating preferences:', err);
      setError(err.response?.data?.error || 'Failed to update preferences.');
      setSnackbarMessage(error);
      setSnackbarSeverity('error');
      setSnackbarOpen(true);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles closing of the Snackbar.
   */
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5 }}>
      <Typography variant="h4" gutterBottom>
        Account Settings
      </Typography>

      {/* Account Information Form */}
      <Box component="form" onSubmit={handleAccountInfoSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Account Information
        </Typography>
        <TextField
          label="First Name"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          label="Last Name"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          label="Email"
          type="email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label="Company"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? 'Updating...' : 'Update Account Information'}
        </Button>
      </Box>

      {/* Password Change Form */}
      <Box component="form" onSubmit={handlePasswordChangeSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Change Password
        </Typography>
        <TextField
          label="Current Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          label="New Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <TextField
          label="Confirm New Password"
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? 'Changing Password...' : 'Change Password'}
        </Button>
      </Box>

      {/* Preferences */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          Preferences
        </Typography>
        <FormControlLabel
          control={
            <Switch
              checked={darkMode}
              onChange={(e) => setDarkMode(e.target.checked)}
              name="darkMode"
              color="primary"
            />
          }
          label="Enable Dark Mode"
        />
        <FormControlLabel
          control={
            <Switch
              checked={notificationsEnabled}
              onChange={(e) => setNotificationsEnabled(e.target.checked)}
              name="notificationsEnabled"
              color="primary"
            />
          }
          label="Enable Notifications"
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePreferencesChange}
            disabled={loading}
          >
            {loading ? 'Updating Preferences...' : 'Update Preferences'}
          </Button>
        </Box>
      </Box>

      {/* Error and Success Messages */}
      {error && (
        <Alert severity="error" sx={{ mt: 2 }}>
          {error}
        </Alert>
      )}

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'left' }}
      >
        <Alert
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: '100%' }}
          variant="filled"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Container>
  );
};

export default SettingsPage;
