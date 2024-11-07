// src/webpages/LandingPage.jsx
import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import PopAlert from '../components/PopAlert';
import { fetchTranscript, generateFlashcards } from '../utils/fetchTranscript';

// MUI Components
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import CircularProgress from '@mui/material/CircularProgress';
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Divider from '@mui/material/Divider';

/**
 * LandingPage component for displaying the YouTube URL input and transcript.
 */
const LandingPage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState('');
  const [flashcards, setFlashcards] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
  };

  const handleFetchAndGenerate = async () => {
    if (!youtubeUrl.trim()) {
      PopAlert('Please enter a valid YouTube URL.');
      return;
    }

    setIsLoading(true);
    setFlashcards([]);
    setTranscript('');

    try {
      PopAlert('Fetching transcript...');
      const fetchedTranscript = await fetchTranscript(youtubeUrl);
      setTranscript(fetchedTranscript);

      PopAlert('Generating flashcards...');
      const generatedFlashcards = await generateFlashcards(fetchedTranscript);
      setFlashcards(generatedFlashcards);

      PopAlert('Flashcards generated successfully!');
    } catch (error) {
      PopAlert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid
      container
      spacing={3}
      alignContent="center"
      justifyContent="center"
      sx={{ minHeight: '100vh', padding: 2 }}
    >
      <Grid size={12}>
        <Box
          sx={{
            textAlign: 'left',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
          }}
        >
          <PageTitle title="Enter YouTube URL" />

          {/* YouTube URL Input Field */}
          <TextField
            label="Enter YouTube URL"
            variant="outlined"
            value={youtubeUrl}
            onChange={handleUrlChange}
            fullWidth
            sx={{ mt: 2 }}
            placeholder="https://www.youtube.com/watch?v=example"
          />

          <Button
            variant="contained"
            sx={{ mt: 4, alignSelf: 'flex-start' }}
            onClick={handleFetchAndGenerate}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Fetch Transcript & Generate Flashcards'}
          </Button>

          {/* Display Flashcards */}
          {flashcards.length > 0 && (
            <Box sx={{ mt: 4 }}>
              <Typography variant="h5" gutterBottom>
                Study Flashcards:
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {flashcards.map((card, index) => (
                <Card key={index} sx={{ mb: 2 }}>
                  <CardContent>
                    <Typography variant="h6" color="text.primary">
                      Q{index + 1}: {card.question}
                    </Typography>
                    <Typography variant="body1" color="text.secondary">
                      A: {card.answer}
                    </Typography>
                  </CardContent>
                </Card>
              ))}
            </Box>
          )}
        </Box>
      </Grid>
    </Grid>
  );
};

export default LandingPage;
