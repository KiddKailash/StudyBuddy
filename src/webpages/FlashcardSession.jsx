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
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import { useTheme } from "@mui/material/styles";

// Icons
import SearchIcon from "@mui/icons-material/Search";
import ShuffleRoundedIcon from "@mui/icons-material/ShuffleRounded";
import ArrowLeftIcon from "@mui/icons-material/ArrowLeft";
import ArrowRightIcon from "@mui/icons-material/ArrowRight";
import ViewCarouselRoundedIcon from "@mui/icons-material/ViewCarouselRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import IconButton from "@mui/material/IconButton";
import EditNoteRoundedIcon from "@mui/icons-material/EditNoteRounded";

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

  // Practice mode states
  const [practiceMode, setPracticeMode] = useState(false);
  const [practiceCards, setPracticeCards] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  // Context values and helper functions
  const {
    user,
    fetchFlashcardSession,
    generateAdditionalFlashcards,
    flashcardSessions,
  } = useContext(UserContext);
  const { showSnackbar } = useContext(SnackbarContext);
  const accountType = user?.accountType || "free";

  const { t } = useTranslation();

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, flashcardSessions]);

  const fetchSession = async () => {
    setLoading(true);
    try {
      if (isLocalSession) {
        const localSessions = JSON.parse(
          localStorage.getItem("localSessions") || "[]"
        );
        const found = localSessions.find((s) => s.id === id);
        setSession(found || null);
      } else {
        // Use the context helper function to fetch the session
        const response = await fetchFlashcardSession(id);
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

  // Enter/exit practice mode
  const handleTogglePractice = () => {
    if (practiceMode) {
      // Switch back to grid view
      setPracticeMode(false);
    } else {
      // Enter practice mode: shuffle current filtered flashcards
      const shuffled = [...filteredFlashcards].sort(() => 0.5 - Math.random());
      setPracticeCards(shuffled);
      setCurrentIndex(0);
      setPracticeMode(true);
    }
  };

  const handleReshuffle = () => {
    // Re-shuffle current practice deck
    const reshuffled = [...practiceCards].sort(() => 0.5 - Math.random());
    setPracticeCards(reshuffled);
    setCurrentIndex(0);
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % practiceCards.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) =>
      prev === 0 ? practiceCards.length - 1 : prev - 1
    );
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
    // If no session found, redirect home
    navigate("/create");
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
    <>
      <Typography
        variant="h5"
        gutterBottom
        sx={{ textAlign: "left", fontWeight: 600, mb: 2 }}
      >
        {session.studySession}
      </Typography>
      {/* Top bar (Search + Buttons) only if NOT in practice mode */}
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
          <Stack
            direction="row"
            spacing={1}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.5,
              border: "0.5px solid grey",
              borderRadius: 2,
            }}
          >
            <Button
              variant="text"
              color="text.secondary"
              onClick={handleGenerateMoreFlashcards}
              disabled={generating}
              startIcon={<AddRoundedIcon sx={{ color: "primary.main" }} />}
            >
              {generating ? t("generating") : t("more_flashcards")}
            </Button>

            <Button
              variant="text"
              color="text.secondary"
              onClick={handleTogglePractice}
              startIcon={
                practiceMode ? (
                  <EditNoteRoundedIcon color="primary" />
                ) : (
                  <ViewCarouselRoundedIcon color="primary" />
                )
              }
            >
              {practiceMode ? t("edit") : t("practice")}
            </Button>
          </Stack>

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

      {/* Search field for small screens (hidden if in practice mode) */}
      {!practiceMode && (
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
      )}

      {/* Normal (grid) view */}
      {!practiceMode && (
        <>
          {filteredFlashcards.length === 0 ? (
            <Box sx={{ borderRadius: 2, bgcolor: "background.paper", p: 4 }}>
              <Typography>{t("no_flashcards_in_session")}</Typography>
            </Box>
          ) : (
            <Grid container spacing={2}>
              {filteredFlashcards.map((card, idx) => (
                <Grid
                  key={idx}
                  size={{ xs: 12, md: 6, xl: 4 }}
                  sx={{ height: 200 }}
                >
                  <Flashcard
                    question={card.question}
                    answer={card.answer}
                    size="small"
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      )}

      {/* Practice Mode: single card + bottom toolbar */}
      {practiceMode && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          {/* The Card */}
          {practiceCards.length > 0 ? (
            <Box
              sx={{
                width: "100%",
                height: "40vh",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
              }}
            >
              <Flashcard
                question={practiceCards[currentIndex].question}
                answer={practiceCards[currentIndex].answer}
                size="large"
              />
            </Box>
          ) : (
            <Typography>{t("no_flashcards_in_session")}</Typography>
          )}

          {/* Bottom toolbar */}
          <Stack
            direction="row"
            spacing={1}
            divider={<Divider orientation="vertical" flexItem />}
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              p: 0.5,
              border: "0.5px solid grey",
              borderRadius: 2,
            }}
          >
            <Box sx={{ display: "flex", direction: "row" }}>
              {/* Prev arrow */}
              <IconButton
                onClick={handlePrev}
                disabled={practiceCards.length === 0}
              >
                <ArrowLeftIcon fontSize="small" />
              </IconButton>

              {/* "X / Y" */}
              <Typography
                variant="subtitle2"
                sx={{ width: 60, textAlign: "center", m: "auto" }}
              >
                {practiceCards.length > 0
                  ? `${currentIndex + 1} / ${practiceCards.length}`
                  : "0 / 0"}
              </Typography>

              {/* Next arrow */}
              <IconButton
                onClick={handleNext}
                disabled={practiceCards.length === 0}
              >
                <ArrowRightIcon fontSize="small" />
              </IconButton>
            </Box>

            {/* Shuffle */}
            <IconButton
              onClick={handleReshuffle}
              disabled={practiceCards.length === 0}
            >
              <ShuffleRoundedIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Box>
      )}

      <Footer />
    </>
  );
};

export default FlashcardSession;
