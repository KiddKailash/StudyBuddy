// const BACKEND_URL = import.meta.env.VITE_BACKEND_URL;
const BACKEND_URL = import.meta.env.VITE_LOCAL_BACKEND_URL;

/**
 * Fetches the transcript for a given YouTube URL via the backend.
 *
 * @param {string} URL - The YouTube video URL.
 * @return {Promise<string>} - Promise resolving to the transcript string.
 */
export async function fetchTranscript(URL) {
  try {
    const response = await fetch(
      `${BACKEND_URL}/transcript?url=${encodeURIComponent(URL)}`
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || 'Failed to fetch transcript from backend');
    }
    return data.transcript;
  } catch (error) {
    console.error('Error fetching transcript:', error);
    throw error; // Rethrow the error to be handled in the frontend
  }
}

/**
 * Generates flashcards from the transcript using OpenAI API.
 *
 * @param {string} transcript - The transcript text.
 * @return {Promise<Array>} - Promise resolving to an array of flashcard objects.
 */
export async function generateFlashcards(transcript) {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not set in the environment variables.');
  }

  const prompt = `
Convert the following transcript into a series of study flashcards in JSON format.
Each flashcard should be an object with "question" and "answer" fields.
Ensure that the flashcards cover the important information in the transcript.

Transcript:
${transcript}

Output format:
[
  {
    "question": "Question 1",
    "answer": "Answer 1"
  },
  {
    "question": "Question 2",
    "answer": "Answer 2"
  },
  ...
]
`;

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1500,
        temperature: 0.7,
        n: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate flashcards');
    }

    const flashcardsText = data.choices[0].message.content.trim();

    // Attempt to parse the response as JSON
    let flashcards;
    try {
      flashcards = JSON.parse(flashcardsText);
    } catch (parseError) {
      console.error('Error parsing flashcards JSON:', parseError);
      throw new Error('Failed to parse flashcards JSON.');
    }

    // Validate that flashcards is an array of objects with question and answer
    if (
      !Array.isArray(flashcards) ||
      !flashcards.every(
        (card) =>
          typeof card === 'object' &&
          typeof card.question === 'string' &&
          typeof card.answer === 'string'
      )
    ) {
      throw new Error('Invalid flashcards format received from OpenAI.');
    }

    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error; // Rethrow to be handled in the frontend
  }
}