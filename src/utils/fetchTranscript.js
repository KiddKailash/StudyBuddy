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
 * @return {Promise<Array<{question: string, answer: string}>>} - Array of flashcards.
 */
export async function generateFlashcards(transcript) {
  const OPENAI_API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    throw new Error('OpenAI API key is not set in the environment variables.');
  }

  const systemMessage = {
    role: 'system',
    content: 'You are an assistant that generates study flashcards from a given transcript. Provide only the JSON array of flashcards without any additional text or markdown.',
  };

  const userPrompt = `
Convert the following transcript into a series of study flashcards in JSON format.
Each flashcard should be an object with "question" and "answer" fields.
Ensure that the flashcards cover the important information in the transcript.

Transcript:
${transcript}

Please provide the flashcards in the following JSON format without any additional text or markdown:
[
  {
    "question": "Question 1",
    "answer": "Answer 1"
  },
  {
    "question": "Question 2",
    "answer": "Answer 2"
  }
]
  `;

  const userMessage = {
    role: 'user',
    content: userPrompt.trim(),
  };

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-3.5-turbo', // or 'gpt-3.5-turbo'
        messages: [systemMessage, userMessage],
        max_tokens: 3000,
        temperature: 0.7,
        n: 1,
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error?.message || 'Failed to generate flashcards');
    }

    const flashcardsText = data.choices[0].message.content.trim();

    // Sanitize the response by removing any markdown code blocks
    const codeBlockRegex = /```json\s*([\s\S]*?)\s*```/;
    const match = flashcardsText.match(codeBlockRegex);
    let jsonString = flashcardsText;

    if (match && match[1]) {
      jsonString = match[1].trim();
    }

    // Attempt to parse the JSON
    let flashcards;
    try {
      flashcards = JSON.parse(jsonString);
    } catch (parseError) {
      console.error('Error parsing flashcards JSON:', parseError);
      console.error('Flashcards Text:', flashcardsText);
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

    console.log('Flashcards:', flashcards);
    return flashcards;
  } catch (error) {
    console.error('Error generating flashcards:', error);
    throw error; // Rethrow to be handled in the frontend
  }
}
