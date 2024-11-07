import { useState } from "react";
import PopAlert from "../components/PopAlert";
import { fetchTranscript, generateFlashcards } from "../utils/fetchTranscript";
import Flashcard from "../components/Flashcard";

// MUI Components
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2"; // Ensure you're using Grid2 as per your setup
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";

const StudySession = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null); // New state to track errors

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
  };

  const handleFetchAndGenerate = async () => {
    if (!youtubeUrl.trim()) {
      PopAlert("Please enter a valid YouTube URL.");
      return;
    }

    setIsLoading(true);
    setFlashcards([]);
    setSubmitted(true); // Set submitted to true when the form is submitted
    setError(null); // Reset previous errors

    try {
      PopAlert("Fetching transcript...");
      const fetchedTranscript = await fetchTranscript(youtubeUrl);

      PopAlert("Generating flashcards...");
      const generatedFlashcards = await generateFlashcards(fetchedTranscript);
      setFlashcards(generatedFlashcards);

      console.log('Generated Flashcards:', generatedFlashcards); // Improved logging

      PopAlert("Flashcards generated successfully!");
    } catch (error) {
      PopAlert(`Error: ${error.message}`);
      console.error("Error:", error);
      setError(error.message || "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setYoutubeUrl("");
    setFlashcards([]);
    setSubmitted(false);
    setError(null);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "stretch", // Allows children to stretch horizontally
        justifyContent: "center", // Centers vertically if needed
        padding: 2,
        width: "100%", // Ensures the Box takes up the full width
        minHeight: "60vh", // Ensures the Box takes up full viewport height
        overflowY: "auto", // Added to enable vertical scrolling
      }}
    >
      {isLoading ? (
        // Loading State: Show only CircularProgress centered
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexGrow: 1, // Allows the loader to take up available space
          }}
        >
          <CircularProgress size={60} />
        </Box>
      ) : !submitted ? (
        // Initial State: Show input field and button
        <Box
          sx={{
            width: "100%",
            maxWidth: 600, // Optional: Limit the maximum width for better aesthetics
            margin: "0 auto", // Center the box horizontally
            textAlign: "center",
          }}
        >

          <TextField
            label="YouTube URL"
            variant="outlined"
            value={youtubeUrl}
            onChange={handleUrlChange}
            placeholder="https://www.youtube.com/watch?v=example"
            fullWidth
            sx={{ mb: 2 }}
          />
          <Button
            variant="contained"
            onClick={handleFetchAndGenerate}
            disabled={isLoading}
            fullWidth
            sx={{ height: 56 }}
          >
            Create Flashcards
          </Button>
        </Box>
      ) : (
        // After Submission: Show flashcards or error message
        <Box
          sx={{
            width: "100%",
            mt: 4,
            maxWidth: 20000, // Optional: Limit the maximum width for better aesthetics
            margin: "0 auto",
            textAlign: "center",
          }}
        >
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <Button variant="outlined" onClick={handleReset}>
              New Flashcards
            </Button>
          </Box>
          {error ? (
            <Typography variant="body1" color="error">
              {error}
            </Typography>
          ) : flashcards.length === 0 ? (
            <Typography variant="body1">
              No flashcards generated. Please try again.
            </Typography>
          ) : (
            <Grid
              container
              spacing={2}
              sx={{
                width: "100%",
              }}
            >
              {flashcards.map((card, index) => (
                <Grid
                  key={index}
                  size={{xs:12, sm:6, md:4, lg:3 }}
                  // Adjust breakpoints as needed
                >
                  <Flashcard
                    question={card.question}
                    answer={card.answer}
                  />
                </Grid>
              ))}
            </Grid>
          )}
        </Box>
      )}
    </Box>
  );
};

export default StudySession;
