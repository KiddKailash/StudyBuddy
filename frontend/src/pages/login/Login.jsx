import React, { useState, useContext, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useTranslation, Trans } from "react-i18next";

// Contexts
import { UserContext } from "../../contexts/User";
import { SnackbarContext } from "../../contexts/Snackbar";

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Grid from "@mui/material/Grid2";
import Link from "@mui/material/Link";
import IconButton from "@mui/material/IconButton";
import InputAdornment from "@mui/material/InputAdornment";

// MUI Icons
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";

const LoginPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialMode = searchParams.get("mode") === "login" ? "login" : "create";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [tosChecked, setTosChecked] = useState(false);
  const [errors, setErrors] = useState({});
  const [authMode, setAuthMode] = useState(initialMode);
  const [loading, setLoading] = useState(false);

  const {
    logout,
    resetUserContext,
    setUser,
    setIsLoggedIn,
    isLoggedIn,
    authLoading,
    loginUser,
    registerUser,
    googleLoginUser,
  } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const navigate = useNavigate();
  const { t } = useTranslation();

  // On mount: if authLoading is done, redirect logged-in users home
  useEffect(() => {
    if (!authLoading) {
      if (isLoggedIn) {
        navigate("/create");
      } else {
        const storedToken = localStorage.getItem("token");
        if (storedToken) {
          logout();
        }
      }
    }
  }, [authLoading, isLoggedIn, logout, navigate]);

  // Update URL query param when authMode changes
  useEffect(() => {
    setSearchParams({ mode: authMode });
  }, [authMode, setSearchParams]);

  const handleAuthModeChange = (event) => {
    setAuthMode(event.target.value);
    // Clear form fields when toggling modes
    setEmail("");
    setPassword("");
    setConfirmPassword("");
    setFirstName("");
    setLastName("");
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
      showSnackbar(t("please_fill_in_all_required_fields"), "warning");
      return false;
    }
    return true;
  };

  const validateTOS = () => {
    if (authMode === "create" && !tosChecked) {
      setErrors((prev) => ({ ...prev, tos: true }));
      showSnackbar(t("must_agree_to_terms"), "warning");
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
      showSnackbar(t("passwords_do_not_match"), "warning");
      setErrors((prev) => ({ ...prev, password: true, confirmPassword: true }));
      setLoading(false);
      return;
    }

    if (!validateTOS()) {
      setLoading(false);
      return;
    }

    const payload =
      authMode === "create"
        ? { email, password, firstName, lastName }
        : { email, password };

    try {
      let responseData;
      if (authMode === "create") {
        responseData = await registerUser(payload);
      } else {
        responseData = await loginUser(payload);
      }
      const { token, user } = responseData;

      // Reset context for a clean state
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
      navigate("/create");
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

  const handleFieldChange = (field, value) => {
    switch (field) {
      case "firstName":
        setFirstName(value);
        break;
      case "lastName":
        setLastName(value);
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

  const handleClickShowPassword = () => {
    setShowPassword((prev) => !prev);
  };

  const handleClickShowConfirmPassword = () => {
    setShowConfirmPassword((prev) => !prev);
  };

  // Prevent input from losing focus when clicking on the icon
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  return (
    <PageWrapper>
      <Container
        maxWidth="xs"
        sx={{
          border: "1px solid #e0e0e0",
          borderRadius: 2,
          p: 4,
        }}
      >
        <Box
          textAlign="center"
          sx={{ transition: "all 0.3s ease-in-out", mb: 2 }}
        >
          <Typography variant="h4" color="primary">
            StudyBuddy.ai
          </Typography>
          <Typography
            variant="h5"
            color="textPrimary"
            sx={{ mt: 1, pr: 6, pl: 6, fontWeight: 600 }}
          >
            {authMode === "create"
              ? t("create_study_cards_from_resource")
              : t("login_to_your_account")}
          </Typography>
          <Typography variant="subtitle1" color="textSecondary" sx={{ mt: 1 }}>
            <Trans
              i18nKey={
                authMode === "create"
                  ? "create_mode_description"
                  : "login_mode_description"
              }
              components={[
                <Link
                  key="0"
                  component="span"
                  variant="body1"
                  onClick={(e) => {
                    e.preventDefault();
                    setAuthMode(authMode === "create" ? "login" : "create");
                  }}
                />,
              ]}
            />
          </Typography>
        </Box>

        <Box component="form" onSubmit={handleSubmit}>
          <Grid container rowSpacing={1.5} columnSpacing={1}>
            {authMode === "create" && (
              <>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("first_name")}
                    variant="outlined"
                    value={firstName}
                    onChange={(e) =>
                      handleFieldChange("firstName", e.target.value)
                    }
                    error={!!errors.firstName}
                  />
                </Grid>
                <Grid size={{ xs: 12, sm: 6 }}>
                  <TextField
                    fullWidth
                    label={t("last_name")}
                    variant="outlined"
                    value={lastName}
                    onChange={(e) =>
                      handleFieldChange("lastName", e.target.value)
                    }
                    error={!!errors.lastName}
                  />
                </Grid>
              </>
            )}

            <Grid size={12}>
              <TextField
                fullWidth
                label={t("email")}
                type="email"
                variant="outlined"
                value={email}
                onChange={(e) => handleFieldChange("email", e.target.value)}
                error={!!errors.email}
              />
            </Grid>
            <Grid size={12}>
              <TextField
                label={t("password")}
                fullWidth
                type={showPassword ? "text" : "password"}
                variant="outlined"
                value={password}
                onChange={(e) => handleFieldChange("password", e.target.value)}
                error={!!errors.password}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end" sx={{ mr: 1 }}>
                        <IconButton
                          aria-label="toggle password visibility"
                          onClick={handleClickShowPassword}
                          onMouseDown={handleMouseDownPassword}
                          edge="end"
                          sx={{
                            fontSize: "small",
                            opacity: 0.5,
                            "&:hover": {
                              opacity: 0.7,
                            },
                            color: "text.secondary",
                          }}
                        >
                          {showPassword ? <VisibilityOff /> : <Visibility />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
            </Grid>
            {authMode === "create" && (
              <>
                <Grid size={12}>
                  <TextField
                    fullWidth
                    label={t("re_enter_password")}
                    type={showConfirmPassword ? "text" : "password"}
                    variant="outlined"
                    value={confirmPassword}
                    onChange={(e) =>
                      handleFieldChange("confirmPassword", e.target.value)
                    }
                    error={!!errors.confirmPassword}
                    slotProps={{
                      input: {
                        endAdornment: (
                          <InputAdornment position="end" sx={{ mr: 1 }}>
                            <IconButton
                              aria-label="toggle confirm password visibility"
                              onClick={handleClickShowConfirmPassword}
                              onMouseDown={handleMouseDownPassword}
                              edge="end"
                              sx={{
                                opacity: 0.5,
                                "&:hover": {
                                  opacity: 0.7,
                                },
                                color: "text.secondary",
                              }}
                            >
                              {showConfirmPassword ? (
                                <VisibilityOff />
                              ) : (
                                <Visibility />
                              )}
                            </IconButton>
                          </InputAdornment>
                        ),
                      },
                    }}
                  />
                </Grid>
                <Grid size={12} sx={{ textAlign: "left" }}>
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
                      <Trans
                        i18nKey="agree_to_terms"
                        components={[
                          <Link
                            component="span"
                            onClick={() => {
                              navigate("/terms");
                            }}
                            key="0"
                          />,
                          <Link
                            component="span"
                            onClick={() => {
                              navigate("/privacy");
                            }}
                            key="1"
                          />,
                        ]}
                      />
                    }
                  />
                </Grid>
              </>
            )}

            <Grid size={12}>
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
            </Grid>
          </Grid>
        </Box>
      </Container>
    </PageWrapper>
  );
};

export default LoginPage;
