import React, { useState, useContext, useEffect } from "react";
import axios from "axios";
import { useNavigate, useSearchParams, Link as RouterLink } from "react-router-dom";
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
import Grid from "@mui/material/Grid";
import Radio from "@mui/material/Radio";
import RadioGroup from "@mui/material/RadioGroup";
import FormControl from "@mui/material/FormControl";
import Link from "@mui/material/Link";

import { useTranslation, Trans } from "react-i18next";

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "create";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [company, setCompany] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [authMode, setAuthMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);

  const { resetUserContext, setUser, setIsLoggedIn, isLoggedIn } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);

  const navigate = useNavigate();
  const { t } = useTranslation();

  useEffect(() => {
    // If user is already logged in, redirect to "/"
    if (isLoggedIn) {
      navigate("/");
    }
  }, [isLoggedIn, navigate]);

  // Whenever authMode changes, update the URL query param.
  useEffect(() => {
    setSearchParams({ mode: authMode });
  }, [authMode, setSearchParams]);

  const handleAuthModeChange = (event) => {
    setAuthMode(event.target.value);

    // Clear form fields when toggling between modes
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
    setCompany("");
    setTosChecked(false);
    setErrors({});
  };

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

  const validateTOS = () => {
    if (authMode === "create" && !tosChecked) {
      setErrors((prev) => ({ ...prev, tos: true }));
      showSnackbar(t("must_agree_to_terms"), "error");
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

    if (authMode === "create" && password !== confirmPassword) {
      showSnackbar(t("passwords_do_not_match"), "error");
      setErrors((prev) => ({ ...prev, password: true, confirmPassword: true }));
      setLoading(false);
      return;
    }

    if (!validateTOS()) {
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
      showSnackbar(err.response?.data?.error || t("error_occurred_try_again"), "error");
    } finally {
      setLoading(false);
    }
  };

  const handleFieldChange = (field, value) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
        break;
      case "company":
        setCompany(value);
        break;
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      case "confirmPassword":
        setConfirmPassword(value);
        break;
      default:
        break;
    }

    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  return (
    <Container
      maxWidth="sm"
      sx={{
        border: "1px solid #e0e0e0",
        borderRadius: 2,
        p: 4,
        mt: 3,
      }}
    >
      <Box textAlign="center" sx={{ transition: "all 0.3s ease-in-out", mb: 2 }}>
        <FormControl component="fieldset" sx={{ mb: 1 }}>
          <RadioGroup
            row
            aria-label="auth mode"
            name="auth-mode"
            value={authMode}
            onChange={handleAuthModeChange}
          >
            <FormControlLabel
              value="login"
              control={<Radio />}
              label={t("login")}
            />
            <FormControlLabel
              value="create"
              control={<Radio />}
              label={t("create_account")}
            />
          </RadioGroup>
        </FormControl>

        <Typography variant="h4" color="primary">
          Study Buddy
        </Typography>
        <Typography variant="h5" color="textPrimary" sx={{ mt: 1, fontWeight: "bold" }}>
          {authMode === "create"
            ? t("create_study_cards_from_resource")
            : t("login_to_your_account")}
        </Typography>
        <Typography variant="body1" color="textSecondary" sx={{ mt: 1 }}>
          {authMode === "create"
            ? t("create_mode_description")
            : t("login_mode_description")}
        </Typography>
      </Box>

      <Box component="form" onSubmit={handleSubmit}>
        {authMode === "create" && (
          <>
            <Grid container spacing={2} sx={{ mb: 1.5 }}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("first_name")}
                  variant="outlined"
                  value={firstName}
                  onChange={(e) => handleFieldChange("firstName", e.target.value)}
                  error={!!errors.firstName}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label={t("last_name")}
                  variant="outlined"
                  value={lastName}
                  onChange={(e) => handleFieldChange("lastName", e.target.value)}
                  error={!!errors.lastName}
                />
              </Grid>
            </Grid>
            <TextField
              fullWidth
              label={t("company")}
              variant="outlined"
              sx={{ mb: 1.5 }}
              value={company}
              onChange={(e) => handleFieldChange("company", e.target.value)}
            />
          </>
        )}

        <TextField
          fullWidth
          label={t("email")}
          type="email"
          variant="outlined"
          sx={{ mb: 1.5 }}
          value={email}
          onChange={(e) => handleFieldChange("email", e.target.value)}
          error={!!errors.email}
        />
        <TextField
          fullWidth
          label={t("password")}
          type="password"
          variant="outlined"
          sx={{ mb: 1.5 }}
          value={password}
          onChange={(e) => handleFieldChange("password", e.target.value)}
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
            onChange={(e) => handleFieldChange("confirmPassword", e.target.value)}
            error={!!errors.confirmPassword}
          />
        )}

        {authMode === "create" && (
          <FormControlLabel
            control={
              <Checkbox
                color="primary"
                checked={tosChecked}
                onChange={(e) => {
                  setTosChecked(e.target.checked);
                  if (errors.tos) {
                    setErrors((prev) => {
                      const newErrors = { ...prev };
                      delete newErrors.tos;
                      return newErrors;
                    });
                  }
                }}
              />
            }
            label={
              // Use the Trans component with placeholders replaced by links.
              <Trans
                i18nKey="agree_to_terms"
                components={[
                  <Link component={RouterLink} to="/terms" key="0" />,
                  <Link component={RouterLink} to="/privacy" key="1" />,
                ]}
              />
            }
            sx={{ mb: 1.5 }}
          />
        )}

        <Button
          fullWidth
          variant="contained"
          color="primary"
          type="submit"
          disabled={loading}
        >
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
