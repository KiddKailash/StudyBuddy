const express = require('express');
const cors = require('cors');
const { getSubtitles } = require('youtube-captions-scraper');

const app = express();
const PORT = 5002;

app.use(cors());
app.use(express.json());

app.get('/transcript', async (req, res) => {
  const videoUrl = req.query.url;

  if (!videoUrl) {
    res.status(400).json({ error: "Missing 'url' query parameter" });
    return;
  }

  const videoId = extractVideoId(videoUrl);

  if (!videoId) {
    res.status(400).json({ error: 'Invalid YouTube URL' });
    return;
  }

  try {
    const transcript = await getSubtitles({
      videoID: videoId,
      lang: 'en', // Specify the language (you can make this dynamic)
    });
    res.json(transcript);
  } catch (error) {
    console.error('Error fetching transcript:', error);
    res.status(500).json({ error: 'Error fetching transcript', details: error.message });
  }
});

function extractVideoId(url) {
  const videoIdMatch = url.match(
    /(?:https?:\/\/)?(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/,
  );
  return videoIdMatch ? videoIdMatch[1] : null;
}

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
