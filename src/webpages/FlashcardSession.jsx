import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Flashcard from "../components/Flashcard";
import { useParams, Link } from "react-router-dom";
import Footer from "../components/Footer";
import { UserContext } from "../contexts/UserContext";
import { redirectToStripeCheckout } from "../utils/redirectToStripeCheckout";

// MUI Component Imports
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";
import Button from "@mui/material/Button";

// Context Import
import { SnackbarContext } from "../contexts/SnackbarContext";

const FlashcardSession = () => {
  const { id } = useParams(); // Study session ID from URL
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false); // New state for generating flashcards
  const { user } = useContext(UserContext); // Access user object
  const accountType = user?.accountType || "free"; // Default to 'free'

  // Access the Snackbar context
  const { showSnackbar } = useContext(SnackbarContext);

  /**
   * Fetches the flashcard session details from the backend.
   */
  const fetchSession = async () => {
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(response.data);
    } catch (err) {
      console.error("Error fetching session:", err);
      showSnackbar(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching the session.",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  /**
   * Handles generating additional flashcards.
   */
  const handleGenerateMoreFlashcards = async () => {
    if (accountType === "free") {
      showSnackbar(
        "Generating more flashcards is a premium feature. Upgrade to access this feature.",
        "info"
      );
      return;
    }

    setGenerating(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      // Call the backend API to generate additional flashcards
      const response = await axios.post(
        `${
          import.meta.env.VITE_LOCAL_BACKEND_URL
        }/api/flashcards/${id}/generate-additional-flashcards`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      showSnackbar("Additional flashcards generated successfully.", "success");

      // Fetch the updated session data
      await fetchSession();
    } catch (err) {
      console.error("Error generating additional flashcards:", err);
      showSnackbar(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while generating additional flashcards.",
        "error"
      );
    } finally {
      setGenerating(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Container sx={{ mt: 2, mb: 2 }}>
      {loading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : session ? (
        <>
          <Box
            sx={{
              display: "flex",
              mb: 2,
              justifyContent: "left",
              textAlign: "left",
            }}
          >
            <Button
              variant="outlined"
              onClick={handleGenerateMoreFlashcards}
              disabled={generating}
            >
              {generating
                ? "Generating..."
                : accountType === "free"
                ? "+10 More Flashcards"
                : "+10 More Flashcards"}
            </Button>

            {accountType === "free" && (
              <>
                <Box sx={{ marginLeft: 2}}>
                  <Typography variant="body1" color="textSecondary">
                    Want to generate more flashcards?
                  </Typography>
                  <Typography>
                    <Link
                      onClick={() =>
                        redirectToStripeCheckout("paid", showSnackbar)
                      }
                    >
                      Upgrade your account
                    </Link>{" "}
                    to unlock this feature.
                  </Typography>
                </Box>
              </>
            )}
          </Box>

          {session.flashcardsJSON.length === 0 ? (
            <Typography>No flashcards in this session.</Typography>
          ) : (
            <Grid container spacing={2}>
              {session.flashcardsJSON.map((card, index) => (
                <Grid size={{ xs: 12, sm: 6, md: 6, xl: 4 }} key={index}>
                  <Flashcard question={card.question} answer={card.answer} />
                </Grid>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <Typography>No session data available.</Typography>
      )}
      <Footer />
    </Container>
  );
};

export default FlashcardSession;
