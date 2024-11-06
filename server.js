const express = require('express');
const cors = require('cors');
const { YoutubeTranscript } = require('youtube-transcript');

const app = express();
const PORT = process.env.PORT || 5002;

// Configure CORS to allow requests from any origin (for development)
// **Important:** Replace '*' with your frontend URL in production for security
app.use(
  cors({
    origin: 'http://localhost:5173/',
  }),
);

// Middleware to parse JSON requests
app.use(express.json());

// Optional: Test route to verify server and network connectivity
app.get('/test-connection', (req, res) => {
  const https = require('https');
  https
    .get('https://www.youtube.com', (response) => {
      res.status(200).send('Able to access YouTube');
    })
    .on('error', (e) => {
      console.error('Error accessing YouTube:', e);
      res.status(500).send('Unable to access YouTube');
    });
});

// Main endpoint to fetch transcript
app.get('/transcript', async (req, res) => {
  const videoUrl = req.query.url;

  console.log(`Received request for URL: ${videoUrl}`);

  if (!videoUrl) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  const videoId = extractVideoId(videoUrl);

  console.log(`Extracted Video ID: ${videoId}`);

  if (!videoId) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    console.log(`Fetching transcript for Video ID: ${videoId}`);
    const transcript = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Fetched transcript successfully for Video ID: ${videoId}`);
    res.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);

    // Handle specific errors
    if (error.message.includes('Could not retrieve transcript')) {
      res.status(404).json({
        error: 'Transcript not found',
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Error fetching transcript',
        details: error.message,
        // stack: error.stack, // Uncomment for debugging; remove in production
      });
    }
  }
});

// Improved function to extract video ID from various YouTube URL formats
function extractVideoId(url) {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    } else if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com'
    ) {
      return urlObj.searchParams.get('v');
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null;
  }
}

// Start the server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
