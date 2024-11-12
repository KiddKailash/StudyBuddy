import { useState, useEffect, useRef, useCallback } from "react";

// ================================
// MUI Component Imports
// ================================
import Box from "@mui/material/Box";
import Fab from "@mui/material/Fab";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import { QuestionAnswerRounded } from "@mui/icons-material";

/**
 * Fetches a streamed response from the OpenAI API and processes it token by token.
 *
 * @param {string} apiKey - The OpenAI API key.
 * @param {string} message - The user's message to send to the assistant.
 * @param {function} onResponse - Callback function to handle each token received.
 *
 * @returns {Promise<void>} - Resolves when the streaming is complete.
 */
const fetchStreamedResponse = async (apiKey, message, onResponse) => {
  // Send a request to the OpenAI API for a chat completion with streaming enabled
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: message }],
      stream: true, // Enable streaming
    }),
  });

  // Read the response stream
  const reader = response.body.getReader();
  const decoder = new TextDecoder("utf-8");
  let done = false;

  // Process the stream chunk by chunk
  while (!done) {
    const { value, done: readerDone } = await reader.read();
    done = readerDone;

    // Decode the chunk into a string
    const chunk = decoder.decode(value, { stream: true });
    const lines = chunk.split("\n").filter((line) => line.trim() !== "");

    // Process each line in the chunk
    for (const line of lines) {
      const message = line.replace(/^data: /, "");
      if (message === "[DONE]") {
        done = true; // End of the stream
        break;
      }

      try {
        // Parse the JSON and extract the token
        const json = JSON.parse(message);
        const token = json.choices[0]?.delta?.content || "";
        onResponse(token); // Pass the token to the callback
      } catch (err) {
        console.error("Error parsing stream message", err);
      }
    }
  }
};

/**
 * AskGPT component provides a chat interface with an AI assistant.
 *
 * @returns {JSX.Element} - The rendered AskGPT component.
 */
const GPTchat = () => {
  const [open, setOpen] = useState(false); // Dialog open state
  const [message, setMessage] = useState(""); // User's input message
  const [error, setError] = useState(""); // Error message
  const [loading, setLoading] = useState(false); // Loading state
  const [chatHistory, setChatHistory] = useState([]); // Chat history
  const [streamedResponse, setStreamedResponse] = useState(""); // Current streamed response
  const chatBoxRef = useRef(null); // Reference to the chat box for auto-scrolling

  // Get the OpenAI API key from environment variables using Vite's import.meta.env
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  /**
   * Toggles the open state of the dialog.
   */
  const handleDialogToggle = useCallback(() => setOpen((prev) => !prev), []);

  /**
   * Handles changes in the message input field.
   *
   * @param {object} event - The change event from the input field.
   */
  const handleMessageChange = useCallback(
    (event) => setMessage(event.target.value),
    []
  );

  /**
   * Sends the user's message to the assistant and handles the streamed response.
   */
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    if (!apiKey) {
      setError(
        "OpenAI API key is missing. Please set it in your environment variables."
      );
      return;
    }

    setError("");
    setLoading(true);
    setStreamedResponse("");

    // Append user's message to the chat history
    const userMessage = { sender: "user", content: message };
    setChatHistory((prev) => [...prev, userMessage]);

    // Add a placeholder for the assistant's response
    const tempGptMessage = { sender: "gpt", content: "" };
    setChatHistory((prev) => [...prev, tempGptMessage]);

    try {
      let currentStreamedResponse = "";

      /**
       * Handles each token received from the streamed response.
       *
       * @param {string} token - The next token in the assistant's response.
       */
      const handleToken = (token) => {
        currentStreamedResponse += token;
        setStreamedResponse(currentStreamedResponse);

        // Update the last message in the chat history with the new content
        setChatHistory((prev) =>
          prev.map((msg, index) =>
            index === prev.length - 1
              ? { ...msg, content: currentStreamedResponse }
              : msg
          )
        );
      };

      // Fetch the streamed response from the assistant
      await fetchStreamedResponse(apiKey, message, handleToken);

      // Finalize the assistant's response in the chat history
      setChatHistory((prev) =>
        prev.map((msg, index) =>
          index === prev.length - 1
            ? { ...msg, content: currentStreamedResponse }
            : msg
        )
      );
    } catch (err) {
      setError("Network error. Please try again.");
      console.error("Error in sendMessage:", err);
    } finally {
      setLoading(false);
      setMessage("");
    }
  }, [message, apiKey]);

  /**
   * Handles the Enter key press event to trigger sending the message.
   *
   * @param {object} event - The key press event from the input field.
   */
  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter" && !loading) {
        handleSendMessage();
      }
    },
    [handleSendMessage, loading]
  );

  /**
   * Scrolls the chat box to the bottom whenever the chat history updates.
   */
  useEffect(() => {
    if (chatBoxRef.current) {
      chatBoxRef.current.scrollTop = chatBoxRef.current.scrollHeight;
    }
  }, [chatHistory, streamedResponse]);

  return (
    <Box
      sx={{
        "& > :not(style)": { m: 1 },
        position: "fixed",
        top: 46,
        right: 16,
      }}
    >
      {/* Floating action button to open the chat dialog */}
      <Fab color="primary" aria-label="Open Chat" onClick={handleDialogToggle}>
        <QuestionAnswerRounded />
      </Fab>

      <Dialog open={open} onClose={handleDialogToggle} fullWidth maxWidth="sm">
        <DialogTitle>AI Assistant</DialogTitle>
        <DialogContent>
          {/* Chat history display */}
          <Box
            ref={chatBoxRef}
            sx={{
              display: "flex",
              flexDirection: "column",
              minHeight: "100px",
              maxHeight: "400px",
              overflowY: "auto",
              border: "1px solid lightgray",
              padding: "10px",
              borderRadius: "5px",
            }}
          >
            {/* Iterate over chat history and display messages */}
            {chatHistory.map((chat, index) => (
              <Box
                key={index}
                sx={{
                  display: "flex",
                  justifyContent:
                    chat.sender === "user" ? "flex-start" : "flex-end",
                  marginBottom: "10px",
                }}
              >
                <Box
                  sx={{
                    padding: "8px 12px",
                    borderRadius: "5px",
                    backgroundColor:
                      chat.sender === "user" ? "#e0e0e0" : "#1976d2",
                    color: chat.sender === "user" ? "black" : "white",
                    maxWidth: "70%",
                    wordWrap: "break-word",
                  }}
                >
                  {chat.content}
                </Box>
              </Box>
            ))}

            {/* Display error message if any */}
            {error && (
              <Box sx={{ mt: 2, color: "red" }}>
                <strong>Error:</strong> {error}
              </Box>
            )}
          </Box>

          {/* Input field for user's message */}
          <TextField
            autoFocus
            margin="dense"
            label="Your message"
            fullWidth
            variant="outlined"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ mt: 2 }}
          />

          {/* Loading indicator while fetching response */}
          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogToggle}>Close</Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GPTchat;
