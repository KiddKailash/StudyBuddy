import React, { useState, useEffect, useContext } from "react";
import axios from "axios";
import Flashcard from "../components/Flashcard";
import { useParams } from "react-router-dom";
import Footer from "../components/Footer";

// ================================
// MUI Component Imports
// ================================
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Grid from "@mui/material/Grid2";

// Context Import
import { SnackbarContext } from "../contexts/SnackbarContext";

const FlashcardSession = () => {
  const { id } = useParams(); // Study session ID from URL
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

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
          {session.flashcardsJSON.length === 0 ? (
            <Typography>No flashcards in this session.</Typography>
          ) : (
            <Grid container spacing={2}>
              {session.flashcardsJSON.map((card, index) => (
                <Grid key={index} size={{ xs: 12, sm: 6, md: 6, xl: 4 }}>
                  <Flashcard
                    key={index}
                    question={card.question}
                    answer={card.answer}
                  />
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

FlashcardSession.propTypes = {};

export default FlashcardSession;
