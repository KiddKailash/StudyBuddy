// fetchTranscript.js

/**
 * Fetches the transcript for a given YouTube URL via the backend.
 *
 * @param {string} URL - The YouTube video URL.
 * @return {Promise<Array>} - Promise resolving to the transcript array.
 */
export async function fetchTranscript(URL) {
  try {
    const response = await fetch(
      `http://localhost:5002/transcript?url=${encodeURIComponent(URL)}`,
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch transcript from backend');
    }
    return data;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error; // Rethrow the error to be handled in the frontend
  }
}
