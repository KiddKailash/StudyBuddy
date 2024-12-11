import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";
import axios from "axios";
import LanguageSwitcher from "../components/LanguageSwitcher";

// MUI Component Imports
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Switch from "@mui/material/Switch";
import FormControlLabel from "@mui/material/FormControlLabel";

// Import the useTranslation hook
import { useTranslation } from 'react-i18next';

const SettingsPage = () => {
  const { user, setUser } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);

  // Initialize the translation function
  const { t } = useTranslation();

  // State for Account Information
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "");

  // State for Preferences
  const [darkMode, setDarkMode] = useState(
    user?.preferences?.darkMode || false
  );
  const [notificationsEnabled, setNotificationsEnabled] = useState(
    user?.preferences?.notificationsEnabled || false
  );

  // State for Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  /**
   * Handles account information submission.
   * Updates both the database and the user context.
   */
  const handleAccountInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    const payload = { firstName, lastName, email, company };

    try {
      const response = await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/users/update`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the user in context
      setUser(response.data.user);
      showSnackbar(t("account_info_updated_success"), "success");
    } catch (err) {
      console.error("Error updating account information:", err);
      showSnackbar(
        err.response?.data?.error || t("failed_to_update_account_info"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles password change submission.
   * Updates the database but does not alter user profile fields.
   */
  const handlePasswordChangeSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (newPassword !== confirmPassword) {
      showSnackbar(t("password_mismatch"), "error");
      setLoading(false);
      return;
    }

    const payload = { currentPassword, newPassword };

    try {
      await axios.put(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/users/change-password`,
        payload,
        {
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      showSnackbar(t("password_changed_success"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      showSnackbar(
        err.response?.data?.error || t("failed_to_change_password"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles preferences update.
   * Updates both the database and the user context.
   */
  const handlePreferencesChange = async () => {
    setLoading(true);

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
          headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        }
      );

      // Update the user in context with new preferences
      setUser(response.data.user);
      showSnackbar(t("preferences_updated_success"), "success");
    } catch (err) {
      console.error("Error updating preferences:", err);
      showSnackbar(
        err.response?.data?.error || t("failed_to_update_preferences"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="md" sx={{ mt: 5, alignContent: 'inherit', alignItems: 'inherit' }}>
      <Box sx={{ mb: 4 }}>
        <Typography variant="h4" gutterBottom>
          {t("change_language")}
        </Typography>
        <LanguageSwitcher />
      </Box>

      {/* Account Information Form */}
      <Typography variant="h4" gutterBottom>
        {t("account_settings")}
      </Typography>
      <Box component="form" onSubmit={handleAccountInfoSubmit} sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("account_information")}
        </Typography>
        <TextField
          label={t("first_name")}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={firstName}
          onChange={(e) => setFirstName(e.target.value)}
          required
        />
        <TextField
          label={t("last_name")}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={lastName}
          onChange={(e) => setLastName(e.target.value)}
          required
        />
        <TextField
          label={t("email")}
          type="email"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <TextField
          label={t("company")}
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={company}
          onChange={(e) => setCompany(e.target.value)}
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? t("updating") : t("update_account_information")}
        </Button>
      </Box>

      {/* Password Change Form */}
      <Box
        component="form"
        onSubmit={handlePasswordChangeSubmit}
        sx={{ mb: 4 }}
      >
        <Typography variant="h6" gutterBottom>
          {t("change_password")}
        </Typography>
        <TextField
          label={t("current_password")}
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={currentPassword}
          onChange={(e) => setCurrentPassword(e.target.value)}
          required
        />
        <TextField
          label={t("new_password")}
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
          required
        />
        <TextField
          label={t("confirm_new_password")}
          type="password"
          variant="outlined"
          fullWidth
          sx={{ mb: 2 }}
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
        />
        <Button
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
          {loading ? t("changing_password") : t("change_password")}
        </Button>
      </Box>

      {/* Preferences */}
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" gutterBottom>
          {t("preferences")}
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
          label={t("enable_dark_mode")}
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
          label={t("enable_notifications")}
        />
        <Box sx={{ mt: 2 }}>
          <Button
            variant="contained"
            color="primary"
            onClick={handlePreferencesChange}
            disabled={loading}
          >
            {loading ? t("updating_preferences") : t("update_preferences")}
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default SettingsPage;
