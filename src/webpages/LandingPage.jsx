import { useState } from "react";
import PageTitle from "../components/PageTitle";
import PopAlert from "../components/PopAlert";
import { fetchTranscript, generateFlashcards } from "../utils/fetchTranscript";
import Flashcard from "../components/Flashcard";

// MUI Components
import Button from "@mui/material/Button";
import Grid from "@mui/material/Grid2";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";

/**
 * LandingPage component for displaying the YouTube URL input and flashcards.
 */
const LandingPage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

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

    try {
      PopAlert("Fetching transcript...");
      const fetchedTranscript = await fetchTranscript(youtubeUrl);

      PopAlert("Generating flashcards...");
      const generatedFlashcards = await generateFlashcards(fetchedTranscript);
      setFlashcards(generatedFlashcards);

      PopAlert("Flashcards generated successfully!");
    } catch (error) {
      PopAlert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Grid container spacing={4}>
        <Grid size={12}>
          <PageTitle title="Enter YouTube URL" />
        </Grid>

        <Grid size={12}>
          {/* YouTube URL Input Field */}
          <TextField
            label="Enter YouTube URL"
            variant="outlined"
            value={youtubeUrl}
            onChange={handleUrlChange}
            sx={{ mt: 2 }}
            placeholder="https://www.youtube.com/watch?v=example"
          />
        </Grid>

        <Grid size={12}>
          <Button
            variant="contained"
            sx={{ mt: 4, alignSelf: "flex-start" }}
            onClick={handleFetchAndGenerate}
            disabled={isLoading}
          >
            {isLoading ? (
              <CircularProgress size={24} color="inherit" />
            ) : (
              "Fetch Transcript & Generate Flashcards"
            )}
          </Button>
        </Grid>
      </Grid>

      <Grid container spacing={4} sx={{mt: 4}}>
        {/* Display Flashcards */}
        {flashcards.length > 0 && (
          <>
            {flashcards.map((card, index) => (
              <Grid size={4} key={index}>
                <Flashcard question={card.question} answer={card.answer} />
              </Grid>
            ))}
          </>
        )}
      </Grid>
    </>
  );
};

export default LandingPage;
