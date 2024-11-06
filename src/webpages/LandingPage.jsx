import { useState } from 'react';
import PageTitle from '../components/PageTitle';
import PopAlert from '../components/PopAlert';
import { fetchTranscript } from '../utils/fetchTranscript';

// ================================
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid2';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

/**
 * LandingPage component for displaying the YouTube URL input and transcript.
 */
const LandingPage = () => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [transcript, setTranscript] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleUrlChange = (event) => {
    setYoutubeUrl(event.target.value);
  };

  const handleFetchTranscript = async () => {
    setIsLoading(true);
    try {
      PopAlert('Fetching transcript...');
      const transcriptData = await fetchTranscript(youtubeUrl);
      if (transcriptData.length === 0) {
        PopAlert('No transcript available for this video.');
      } else {
        setTranscript(transcriptData);
      }
    } catch (error) {
      PopAlert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Grid container spacing={3} alignContent="center">
      <Grid
        sx={{
          textAlign: 'left',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
        }}
      >
        <PageTitle title="Enter URL" />

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
          sx={{ mt: 4 }}
          onClick={handleFetchTranscript}
          disabled={isLoading}
        >
          {isLoading ? 'Loading...' : 'Fetch Transcript'}
        </Button>

        {/* Display Transcript */}
        {transcript.length > 0 && (
          <Box sx={{ mt: 4 }}>
            <Typography variant="h6">Transcript:</Typography>
            <ul>
              {transcript.map((item, index) => (
                <li key={index}>{item.text}</li>
              ))}
            </ul>
          </Box>
        )}
      </Grid>
    </Grid>
  );
};

export default LandingPage;
