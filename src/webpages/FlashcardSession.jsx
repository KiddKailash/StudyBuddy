import React, { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import Flashcard from "../components/Flashcard";

// ================================
// MUI Component Imports
// ================================
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Grid from "@mui/material/Grid2";

const FlashcardSession = () => {
  const { id } = useParams(); // Study session ID from URL
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Fetches the flashcard session details from the backend.
   */
  const fetchSession = async () => {
    setLoading(true);
    setError("");

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
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching the session."
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
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : session ? (
        <>
          {session.flashcardsJSON.length === 0 ? (
            <Typography>No flashcards in this session.</Typography>
          ) : (
            <Grid container spacing={2}>
              {session.flashcardsJSON.map((card, index) => (
                <>
                  <Grid key={index} size={{ xs: 12, sm: 6, md: 4, xl: 3 }}>
                    <Flashcard
                      key={index}
                      question={card.question}
                      answer={card.answer}
                    />
                  </Grid>
                </>
              ))}
            </Grid>
          )}
        </>
      ) : (
        <Typography>No session data available.</Typography>
      )}
    </Container>
  );
};

FlashcardSession.propTypes = {};

export default FlashcardSession;
