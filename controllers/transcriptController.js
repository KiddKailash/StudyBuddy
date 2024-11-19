const { YoutubeTranscript } = require('youtube-transcript');
const he = require('he');

/**
 * Extracts the video ID from various YouTube URL formats.
 *
 * @param {string} url - The YouTube video URL.
 * @returns {string|null} - The extracted video ID or null if invalid.
 */
const extractVideoId = (url) => {
  try {
    const urlObj = new URL(url);
    if (urlObj.hostname === 'youtu.be') {
      return urlObj.pathname.slice(1);
    } else if (
      urlObj.hostname === 'www.youtube.com' ||
      urlObj.hostname === 'youtube.com' ||
      urlObj.hostname === 'm.youtube.com'
    ) {
      return urlObj.searchParams.get('v');
    } else {
      return null;
    }
  } catch (e) {
    console.error('Error parsing URL:', e);
    return null;
  }
};

/**
 * Fetches the transcript for a given YouTube URL via the backend.
 *
 * @param {Object} req - Express request object.
 * @param {Object} res - Express response object.
 */
exports.fetchTranscript = async (req, res) => {
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
    const transcriptArray = await YoutubeTranscript.fetchTranscript(videoId);
    console.log(`Fetched transcript successfully for Video ID: ${videoId}`);

    const transcriptString = transcriptArray
      .map((entry) => {
        if (entry.text) {
          let cleanedText = entry.text.replace(/\[.*?\]/g, '').trim();
          cleanedText = he.decode(cleanedText);
          cleanedText = he.decode(cleanedText);
          return cleanedText;
        }
        return '';
      })
      .join(' ');

    const cleanedTranscript = transcriptString.replace(/\s{2,}/g, ' ');

    console.log(`Processed transcript for Video ID: ${videoId}`);

    res.json({ transcript: cleanedTranscript });
  } catch (error) {
    console.error('Error fetching transcript:', error);

    if (
      error.message.includes('Transcript is disabled') ||
      error.message.includes('Could not retrieve transcript') ||
      error.message.includes('Could not find captions')
    ) {
      res.status(404).json({
        error: 'Transcript not found',
        details: error.message,
      });
    } else {
      res.status(500).json({
        error: 'Error fetching transcript',
        details: error.message,
      });
    }
  }
};
