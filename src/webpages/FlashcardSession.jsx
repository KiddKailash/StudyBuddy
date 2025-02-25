import React, { useState, useEffect, useContext } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
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

  // Determine if we're using a local session or a DB-based session
  const isLocalSession = location.pathname.includes("/flashcards-local/");

  // State for session data, loading/generating status, and search term
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Context values and helper functions
  const { user, fetchFlashcardSession, generateAdditionalFlashcards } = useContext(UserContext);
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
        const localSessions = JSON.parse(localStorage.getItem("localSessions") || "[]");
        const found = localSessions.find((s) => s.id === id);
        setSession(found || null);
      } else {
        // Use the context helper function to fetch the session
        const data = await fetchFlashcardSession(id);
        setSession(data);
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
    if (isLocalSession) {
      showSnackbar(t("feature_unavailable_to_free_account"), "info");
      return;
    }
    if (accountType === "free") {
      showSnackbar(t("premium_feature_upgrade"), "info");
      return;
    }
    setGenerating(true);
    try {
      await generateAdditionalFlashcards(id);
      showSnackbar(t("flashcards_generated_success"), "success");
      // Refresh the session to include newly generated flashcards
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

  if (!session) {
    navigate("/");
    return null;
  }

  const flashcardsArray = session?.flashcardsJSON || [];
  const filteredFlashcards = flashcardsArray.filter((card) => {
    const lowerSearch = searchTerm.toLowerCase();
    return (
      card.question.toLowerCase().includes(lowerSearch) ||
      card.answer.toLowerCase().includes(lowerSearch)
    );
  });

  return (
    <Container sx={{ mt: 1, mb: 2 }}>
      <Box
        sx={{
          display: "inline-flex",
          width: "100%",
          justifyContent: "space-between",
          mb: 1,
          alignItems: "flex-start",
        }}
      >
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
            order: { xs: 2, md: 1 },
            display: { xs: "none", md: "inherit" },
            "& .MuiOutlinedInput-root": { borderRadius: "8px" },
          }}
        />

        <Stack
          direction="row"
          spacing={2}
          alignItems="center"
          justifyContent="flex-start"
          sx={{ width: "100%" }}
        >
          <Button
            variant="outlined"
            onClick={handleGenerateMoreFlashcards}
            disabled={generating}
          >
            {generating ? t("generating") : t("more_flashcards")}
          </Button>
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
          mb: { xs: 1, md: 0 },
          display: { md: "none" },
          "& .MuiOutlinedInput-root": { borderRadius: "8px" },
        }}
      />

      {filteredFlashcards.length === 0 ? (
        <Box sx={{ borderRadius: 2, bgcolor: "background.paper", p: 4 }}>
          <Typography>{t("no_flashcards_in_session")}</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {filteredFlashcards.map((card, idx) => (
            <Grid key={idx} size={{xs: 12, md: 6, xl: 4}} >
              <Flashcard question={card.question} answer={card.answer} />
            </Grid>
          ))}
        </Grid>
      )}

      <Footer />
    </Container>
  );
};

export default FlashcardSession;
