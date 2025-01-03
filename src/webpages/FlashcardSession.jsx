import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

// MUI
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";

import Flashcard from "../components/Flashcard";
import Footer from "../components/Footer";

import { redirectToStripeCheckout } from "../utils/redirectToStripeCheckout";
import { useTranslation, Trans } from "react-i18next";

const FlashcardSession = () => {
  const { id } = useParams();
  const location = useLocation();
  // Determine local vs. DB-based from URL path
  const isLocalSession = location.pathname.includes("/flashcards-local/");

  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const { user } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const accountType = user?.accountType || "free";

  const { t } = useTranslation();

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      if (isLocalSession) {
        // Load session from local storage
        let localSessions = JSON.parse(
          localStorage.getItem("localSessions") || "[]"
        );
        const found = localSessions.find((s) => s.id === id);
        setSession(found || null);
      } else {
        // Protected DB-based session
        const token = localStorage.getItem("token");
        if (!token) {
          throw new Error("User is not authenticated.");
        }
        const response = await axios.get(
          `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setSession(response.data);
      }
    } catch (error) {
      console.error("Error fetching session:", error);
      showSnackbar(
        error.response?.data?.error ||
          error.message ||
          t("error_fetching_session"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Generate more flashcards - only works for DB-based sessions
   */
  const handleGenerateMoreFlashcards = async () => {
    // This feature is not supported for local sessions
    if (isLocalSession) {
      showSnackbar(
        "This feature is only available for DB-based sessions.",
        "info"
      );
      return;
    }

    if (accountType === "free") {
      showSnackbar(t("premium_feature_upgrade"), "info");
      return;
    }
    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not authenticated.");

      await axios.post(
        `${
          import.meta.env.VITE_LOCAL_BACKEND_URL
        }/api/flashcards/${id}/generate-additional-flashcards`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar(t("flashcards_generated_success"), "success");
      // Re-fetch session
      fetchSession();
    } catch (error) {
      console.error("Error generating more flashcards:", error);
      showSnackbar(
        error.response?.data?.error ||
          error.message ||
          t("error_generating_flashcards"),
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ mt: 2, mb: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  if (!session) {
    return (
      <Container sx={{ mt: 2, mb: 2 }}>
        <Typography>{t("no_session_data_available")}</Typography>
        <Footer />
      </Container>
    );
  }

  const flashcardsArray = session.flashcardsJSON || [];

  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      {/* Only show "Generate more" for DB-based sessions */}
      {!isLocalSession && (
        <Box sx={{ display: "flex", mb: 2, textAlign: "left" }}>
          <Button
            variant="outlined"
            onClick={handleGenerateMoreFlashcards}
            disabled={generating}
          >
            {generating ? t("generating") : t("more_flashcards")}
          </Button>
          {(accountType === "free" || !user) && (
            <Box sx={{ marginLeft: 2 }}>
              <Typography variant="body1" color="textSecondary">
                {t("want_more_flashcards")}
              </Typography>
              <Typography>
                <Trans i18nKey="upgrade_to_unlock">
                  <Link
                    component="button"
                    variant="body1"
                    onClick={() =>
                      redirectToStripeCheckout("paid", showSnackbar)
                    }
                  >
                    {t("upgrade_your_account")}
                  </Link>
                </Trans>
              </Typography>
            </Box>
          )}
        </Box>
      )}

      {flashcardsArray.length === 0 ? (
        <Typography>{t("no_flashcards_in_session")}</Typography>
      ) : (
        <Grid container spacing={2}>
          {flashcardsArray.map((card, idx) => (
            <Grid size={{ xs: 12, sm: 6, md: 6, xl: 4 }} key={idx}>
              <Flashcard question={card.question} answer={card.answer} />
            </Grid>
          ))}
        </Grid>
      )}

      <Footer />
    </Container>
  );
};

FlashcardSession.propTypes = {};

export default FlashcardSession;
