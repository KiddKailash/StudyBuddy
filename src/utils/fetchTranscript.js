import axios from 'axios';

/**
 * Fetches the transcript for a given YouTube URL via the backend.
 *
 * @param {string} URL - The YouTube video URL.
 * @return {Promise<string>} - Promise resolving to the transcript string.
 */
export async function fetchTranscript(URL) {
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  try {
    const response = await axios.get(`${BACKEND}/api/transcript`, {
      params: { url: URL },
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}

/**
 * Generates flashcards using OpenAI via the backend.
 *
 * @param {string} transcript - The transcript text.
 * @return {Promise<Array<{question: string, answer: string}>>} - Array of flashcards.
 */
export async function generateFlashcards(transcript) {
  const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;

  const token = localStorage.getItem('token'); // Retrieve token from localStorage

  if (!token) {
    throw new Error('User is not authenticated.');
  }

  try {
    const response = await axios.post(
      `${BACKEND}/api/openai/generate-flashcards`,
      { transcript },
      {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      }
    );

    return response.data.flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error.response?.data || error.message);
    throw error.response?.data || error;
  }
}
