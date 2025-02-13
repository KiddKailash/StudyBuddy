import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

// MUI imports
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";
import Link from "@mui/material/Link";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";
import SearchIcon from "@mui/icons-material/Search";
import { useTheme } from "@mui/material/styles";
import Stack from "@mui/material/Stack";

// Custom components
import Flashcard from "../components/Flashcard";
import Footer from "../components/Footer";

// i18n
import { useTranslation, Trans } from "react-i18next";

const FlashcardSession = () => {
  const theme = useTheme();
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  // Determine if we're using local sessions vs DB-based sessions
  const isLocalSession = location.pathname.includes("/flashcards-local/");

  // State for session data, loading/generating status, and search term
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Context
  const { user } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const accountType = user?.accountType || "free";

  // i18n
  const { t } = useTranslation();

  // Backend URI
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      if (isLocalSession) {
        // Load session from local storage
        const localSessions = JSON.parse(
          localStorage.getItem("localSessions") || "[]"
        );
        const found = localSessions.find((s) => s.id === id);
        setSession(found || null);
      } else {
        // Protected DB-based session
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User is not authenticated.");
        const response = await axios.get(`${BACKEND}/api/flashcards/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
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

  const handleGenerateMoreFlashcards = async () => {
    // Feature not supported for local sessions
    if (isLocalSession) {
      showSnackbar(t("feature_unavailable_to_free_account"), "info");
      return;
    }

    // If user is free, nudge them to upgrade
    if (accountType === "free") {
      showSnackbar(t("premium_feature_upgrade"), "info");
      return;
    }

    setGenerating(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("User is not authenticated.");

      await axios.post(
        `${BACKEND}/api/flashcards/${id}/generate-additional-flashcards`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );
      showSnackbar(t("flashcards_generated_success"), "success");
      // Re-fetch session to get newly generated cards
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
      <Box
        sx={{
          display: "flex",
          height: "80%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If there's no session after loading, redirect home
  if (!session) {
    navigate("/");
  }

  // The array of flashcards from the session
  const flashcardsArray = session?.flashcardsJSON || [];

  // Filter flashcards by search term
  const filteredFlashcards = flashcardsArray.filter((card) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      card.question.toLowerCase().includes(lowerSearch) ||
      card.answer.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <Container sx={{ mt: 1, mb: 2 }}>
      {/* 
        TOP AREA: 
        - "Generate More" button + possible upgrade text 
        - Search bar
        Reordered responsively using Stack + order.
      */}
      <Box
        // This box manages the direction/search bar/etc.
        sx={{
          alignItems: "flex-start",
          display: 'inline-flex',
          width: '100%',
          justifyContent: "space-between",
          mb: 2,
          gap: 2,
        }}
      >
        {/* SEARCH BAR */}
        <TextField
          placeholder={t("searchbar")}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.primary.main }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: { xs: "100%", md: "auto" },
            order: { xs: 2, md: 1 }, // On xs => second; md => first
            display: {xs: 'none', md: 'inherit'},
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        />

        {/* BUTTON + UPGRADE TEXT STACK */}
        <Stack
          // Force a row layout on xs so text + button sit side by side
          direction="row"
          spacing={2} // Creates gap between items
          alignItems="center"
          justifyContent="flex-start"
          sx={{
            width: "100%",
          }}
        >
          {/* "GENERATE MORE" BUTTON */}
          <Button
            variant="outlined"
            onClick={handleGenerateMoreFlashcards}
            disabled={generating}
          >
            {generating ? t("generating") : t("more_flashcards")}
          </Button>

          {/* UPGRADE TEXT (typography) */}
          {(accountType === "free" || !user) && (
            <Box sx={{ textAlign: "left" }}>
              <Typography variant="body1" color="textSecondary">
                {t("want_more_flashcards")}
              </Typography>
              <Typography>
                <Trans i18nKey="upgrade_to_unlock">
                  <Link
                    component="span"
                    variant="body1"
                    onClick={() => navigate("/checkout")}
                    sx={{ cursor: "pointer" }}
                  >
                    {t("upgrade_your_account")}
                  </Link>
                </Trans>
              </Typography>
            </Box>
          )}
        </Stack>
      </Box>

      <TextField
          placeholder={t("searchbar")}
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ color: theme.palette.primary.main }} />
              </InputAdornment>
            ),
          }}
          sx={{
            width: "100%",
            mb: 1,
            display: {md: 'none'},
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        />

      {/* Flashcards grid */}
      {filteredFlashcards.length === 0 ? (
        <Box sx={{ borderRadius: 2, bgcolor: "background.paper", p: 4 }}>
          <Typography>{t("no_flashcards_in_session")}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredFlashcards.map((card, idx) => (
            <Grid size={{ xs: 12, md: 6, xl: 4 }} key={idx}>
              <Flashcard question={card.question} answer={card.answer} />
            </Grid>
          ))}
        </Grid>
      )}

      {/* Footer */}
      <Footer />
    </Container>
  );
};

export default FlashcardSession;
