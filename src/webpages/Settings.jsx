import React, { useState, useContext } from "react";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

// MUI Component Imports
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

const SettingsPage = () => {
  const { user, setUser, updateAccountInfo, changePassword, updatePreferences, cancelSubscription } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const { t } = useTranslation();

  // State for Account Information
  const [firstName, setFirstName] = useState(user?.firstName || "");
  const [lastName, setLastName] = useState(user?.lastName || "");
  const [email, setEmail] = useState(user?.email || "");
  const [company, setCompany] = useState(user?.company || "");

  // Preferences states
  const [darkMode, setDarkMode] = useState(user?.preferences?.darkMode || false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(user?.preferences?.notificationsEnabled || false);

  // State for Password Change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Loading State
  const [loading, setLoading] = useState(false);

  // Dialog State for Cancel Subscription Confirmation
  const [openDialog, setOpenDialog] = useState(false);

  /**
   * Handles account information submission.
   */
  const handleAccountInfoSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const payload = { firstName, lastName, email, company };
    try {
      const updatedUser = await updateAccountInfo(payload);
      setUser(updatedUser);
      showSnackbar(t("account_info_updated_success"), "success");
    } catch (err) {
      console.error("Error updating account information:", err);
      showSnackbar(err.response?.data?.error || t("failed_to_update_account_info"), "error");
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
    if (newPassword !== confirmPassword) {
      showSnackbar(t("password_mismatch"), "error");
      setLoading(false);
      return;
    }
    const payload = { currentPassword, newPassword };
    try {
      await changePassword(payload);
      showSnackbar(t("password_changed_success"), "success");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      console.error("Error changing password:", err);
      showSnackbar(err.response?.data?.error || t("failed_to_change_password"), "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles preferences update.
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
      const updatedUser = await updatePreferences(payload);
      setUser(updatedUser);
      showSnackbar(t("preferences_updated_success"), "success");
    } catch (err) {
      console.error("Error updating preferences:", err);
      showSnackbar(err.response?.data?.error || t("failed_to_update_preferences"), "error");
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles direct subscription cancellation.
   */
  const handleCancelSubscription = async () => {
    setLoading(true);
    try {
      const updatedUser = await cancelSubscription();
      setUser(updatedUser);
      showSnackbar(t("subscription_canceled_successfully"), "success");
    } catch (err) {
      console.error("Error canceling subscription:", err);
      showSnackbar(err.response?.data?.error || t("failed_to_cancel_subscription"), "error");
    } finally {
      setLoading(false);
      setOpenDialog(false);
    }
  };

  return (
    <Container maxWidth="xl" sx={{ mt: 5, alignContent: "inherit", alignItems: "inherit", textAlign: "left" }}>
      {/* Account Information Form */}
      <Typography variant="h4" gutterBottom>
        {t("account_settings")}
      </Typography>
      <Box component="form" onSubmit={handleAccountInfoSubmit} sx={{ mb: 2 }}>
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
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? t("updating") : t("update_account_information")}
        </Button>
      </Box>

      {/* Password Change Form */}
      <Box component="form" onSubmit={handlePasswordChangeSubmit} sx={{ mb: 2 }}>
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
        <Button variant="contained" color="primary" type="submit" disabled={loading}>
          {loading ? t("changing_password") : t("change_password")}
        </Button>
      </Box>

      {/* Preferences Section */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="h6" gutterBottom>
          {t("preferences")}
        </Typography>
        {/* You can implement toggles or checkboxes for preferences as needed */}
        <TextField
          label={t("dark_mode")}
          type="checkbox"
          checked={darkMode}
          onChange={(e) => setDarkMode(e.target.checked)}
          sx={{ mb: 2 }}
        />
        <TextField
          label={t("notifications_enabled")}
          type="checkbox"
          checked={notificationsEnabled}
          onChange={(e) => setNotificationsEnabled(e.target.checked)}
          sx={{ mb: 2 }}
        />
        <Button variant="contained" color="primary" onClick={handlePreferencesChange} disabled={loading}>
          {loading ? t("updating") : t("update_preferences")}
        </Button>
      </Box>

      {/* Subscription Management Section */}
      {user?.accountType === "paid" && (
        <Box sx={{ mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            {t("subscription_management")}
          </Typography>
          <Button variant="contained" onClick={() => setOpenDialog(true)}>
            {t("cancel_subscription")}
          </Button>

          {/* Confirmation Dialog */}
          <Dialog open={openDialog} onClose={() => setOpenDialog(false)} sx={{ textAlign: "center" }}>
            <DialogTitle sx={{ pb: 1 }}>{t("confirm_cancel_subscription")}</DialogTitle>
            <DialogContent sx={{ pb: 1 }}>
              <DialogContentText>{t("cancel_subscription_warning")}</DialogContentText>
            </DialogContent>
            <DialogActions sx={{ justifyContent: "center" }}>
              <Button onClick={() => setOpenDialog(false)} color="primary">
                {t("cancel")}
              </Button>
              <Button variant="text" color="error" onClick={handleCancelSubscription} disabled={loading}>
                {loading ? t("cancelling_subscription") : t("confirm_cancel")}
              </Button>
            </DialogActions>
          </Dialog>
        </Box>
      )}
    </Container>
  );
};

export default SettingsPage;
