import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

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
import Link from "@mui/material/Link";

import { Link as RouterLink } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialAuthMode = searchParams.get("authMode") || "create";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [authMode, setAuthMode] = useState(initialAuthMode);
  const [loading, setLoading] = useState(false);

  const { resetUserContext, setUser, setIsLoggedIn, isLoggedIn } =
    useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();
  const { t } = useTranslation();

  // Update URL when authMode changes
  const handleAuthModeChange = (event) => {
    const newAuthMode = event.target.value;
    setAuthMode(newAuthMode);
    setSearchParams({ authMode: newAuthMode });
    resetForm();
  };

  // Reset form fields
  const resetForm = () => {
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setCompany("");
    setTosChecked(false);
    setErrors({});
  };

  useEffect(() => {
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  const validateRequiredFields = () => {
    const newErrors = {};

    if (authMode === "login") {
      if (!email) newErrors.email = true;
      if (!password) newErrors.password = true;
    } else if (authMode === "create") {
      if (!firstName) newErrors.firstName = true;
      if (!lastName) newErrors.lastName = true;
      if (!email) newErrors.email = true;
      if (!password) newErrors.password = true;
      if (!confirmPassword) newErrors.confirmPassword = true;
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      showSnackbar(t("please_fill_in_all_required_fields"), "error");
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (!validateRequiredFields()) {
      setLoading(false);
      return;
    }

    const endpoint =
      authMode === "create" ? "/api/auth/register" : "/api/auth/login";

    const payload =
      authMode === "create"
        ? { email, password, firstName, lastName, company: company || null }
        : { email, password };

    try {
      const response = await axios.post(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}${endpoint}`,
        payload
      );

      const { token, user } = response.data;

      resetUserContext();
      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      setUser(user);
      setIsLoggedIn(true);

      showSnackbar(
        authMode === "create"
          ? t("account_created_successfully")
          : t("login_successful"),
        "success"
      );
    } catch (err) {
      console.error(err);
      showSnackbar(
        err.response?.data?.error || t("error_occurred_try_again"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ border: "1px solid #e0e0e0", borderRadius: 2, p: 4, mt: 3 }}>
      <Box textAlign="center" sx={{ transition: "all 0.3s ease-in-out", mb: 2 }}>
        <FormControl component="fieldset" sx={{ mb: 1 }}>
          <RadioGroup
            row
            aria-label="auth mode"
            name="auth-mode"
            value={authMode}
            onChange={handleAuthModeChange}
          >
            <FormControlLabel value="login" control={<Radio />} label={t("login")} />
            <FormControlLabel value="create" control={<Radio />} label={t("create_account")} />
          </RadioGroup>
        </FormControl>

        <Typography variant="h4" color="primary">
          Study Buddy
        </Typography>
        <Typography variant="h5" color="textPrimary" sx={{ mt: 1, fontWeight: "bold" }}>
          {authMode === "create" ? t("create_study_cards_from_resource") : t("login_to_your_account")}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        {authMode === "create" && (
          <Grid container spacing={2} sx={{ mb: 1.5 }}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("first_name")}
                variant="outlined"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={!!errors.firstName}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }}>
              <TextField
                fullWidth
                label={t("last_name")}
                variant="outlined"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={!!errors.lastName}
              />
            </Grid>
          </Grid>
        )}

        <TextField
          fullWidth
          label={t("email")}
          type="email"
          variant="outlined"
          sx={{ mb: 1.5 }}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          error={!!errors.email}
        />
        <TextField
          fullWidth
          label={t("password")}
          type="password"
          variant="outlined"
          sx={{ mb: 1.5 }}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          error={!!errors.password}
        />

        {authMode === "create" && (
          <TextField
            fullWidth
            label={t("re_enter_password")}
            type="password"
            variant="outlined"
            sx={{ mb: 1.5 }}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            error={!!errors.confirmPassword}
          />
        )}

        <Button fullWidth variant="contained" color="primary" type="submit" disabled={loading}>
          {loading
            ? authMode === "create"
              ? t("creating_account")
              : t("logging_in")
            : authMode === "create"
            ? t("create_your_clipcard_account")
            : t("login")}
        </Button>
      </Box>
    </Container>
  );
};

export default LoginPage;
