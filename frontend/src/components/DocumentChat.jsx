import React, { useState, useRef, useEffect } from "react";

// MUI Components
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import IconButton from "@mui/material/IconButton";
import Paper from "@mui/material/Paper";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Chip from "@mui/material/Chip";
import Alert from "@mui/material/Alert";

// MUI Icons
import SendIcon from "@mui/icons-material/Send";
import PersonIcon from "@mui/icons-material/Person";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import { queryDocument } from "../services/summaryService";

/**
 * DocumentChat component provides a chat interface for querying documents
 * 
 * @param {Object} props - Component props
 * @param {string} props.summaryId - ID of the summary to query its underlying document
 * @param {string} props.documentTitle - Title of the document being queried
 */
const DocumentChat = ({ summaryId, documentTitle }) => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Handle sending a message
  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || isLoading) return;

    const userMessage = inputValue.trim();
    setInputValue("");
    setError("");

    // Add user message to chat
    const newUserMessage = {
      id: Date.now(),
      type: "user",
      content: userMessage,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      // Query the document
      const response = await queryDocument(summaryId, userMessage);
      
      // Add AI response to chat
      const aiMessage = {
        id: Date.now() + 1,
        type: "assistant",
        content: response.answer,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error("Error querying document:", error);
      setError("Failed to get response. Please try again.");
      
      // Add error message to chat
      const errorMessage = {
        id: Date.now() + 1,
        type: "error",
        content: "Sorry, I couldn't process your question. Please try again.",
        timestamp: new Date(),
      };
      
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press
  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage(e);
    }
  };

  return (
    <Box
      sx={{
        height: "400px",
        display: "flex",
        flexDirection: "column",
        border: "1px solid",
        borderColor: "divider",
        borderRadius: 2,
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 2,
          borderBottom: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Typography variant="h6" sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <SmartToyIcon color="primary" />
          Ask questions about your document
        </Typography>
        {documentTitle && (
          <Chip
            label={documentTitle}
            size="small"
            variant="outlined"
            sx={{ mt: 1 }}
          />
        )}
      </Box>

      {/* Messages Area */}
      <Box
        sx={{
          flex: 1,
          overflowY: "auto",
          p: 1,
          bgcolor: "background.default",
        }}
      >
        {messages.length === 0 && (
          <Box
            sx={{
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "column",
              textAlign: "center",
              color: "text.secondary",
              p: 2,
            }}
          >
            <SmartToyIcon sx={{ fontSize: 48, mb: 2, opacity: 0.5 }} />
            <Typography variant="body2">
              Start a conversation about your document!
            </Typography>
            <Typography variant="caption" sx={{ mt: 1 }}>
              Ask questions like "What are the main points?" or "Summarize the conclusion"
            </Typography>
          </Box>
        )}

        {messages.map((message) => (
          <Box
            key={message.id}
            sx={{
              display: "flex",
              mb: 2,
              alignItems: "flex-start",
              gap: 1,
            }}
          >
            {/* Avatar */}
            <Box
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: message.type === "user" ? "primary.main" : 
                         message.type === "error" ? "error.main" : "secondary.main",
                color: "white",
              }}
            >
              {message.type === "user" ? (
                <PersonIcon sx={{ fontSize: 18 }} />
              ) : (
                <SmartToyIcon sx={{ fontSize: 18 }} />
              )}
            </Box>

            {/* Message Content */}
            <Paper
              sx={{
                p: 2,
                maxWidth: "85%",
                bgcolor: message.type === "user" ? "primary.light" : 
                         message.type === "error" ? "error.light" : "background.paper",
                color: message.type === "user" ? "primary.contrastText" : "text.primary",
              }}
            >
              <Typography variant="body2" sx={{ whiteSpace: "pre-wrap" }}>
                {message.content}
              </Typography>
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 1,
                  opacity: 0.7,
                }}
              >
                {message.timestamp.toLocaleTimeString()}
              </Typography>
            </Paper>
          </Box>
        ))}

        {/* Loading indicator */}
        {isLoading && (
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              gap: 1,
              mb: 2,
            }}
          >
            <Box
              sx={{
                minWidth: 32,
                height: 32,
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                bgcolor: "secondary.main",
                color: "white",
              }}
            >
              <SmartToyIcon sx={{ fontSize: 18 }} />
            </Box>
            <Paper sx={{ p: 2 }}>
              <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <CircularProgress size={16} />
                <Typography variant="body2" color="text.secondary">
                  Thinking...
                </Typography>
              </Box>
            </Paper>
          </Box>
        )}

        <div ref={messagesEndRef} />
      </Box>

      {/* Error Alert */}
      {error && (
        <Alert severity="error" sx={{ m: 1 }} onClose={() => setError("")}>
          {error}
        </Alert>
      )}

      {/* Input Area */}
      <Box
        component="form"
        onSubmit={handleSendMessage}
        sx={{
          p: 2,
          borderTop: "1px solid",
          borderColor: "divider",
          bgcolor: "background.paper",
        }}
      >
        <Box sx={{ display: "flex", gap: 1 }}>
          <TextField
            fullWidth
            multiline
            maxRows={3}
            placeholder="Ask a question about your document..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            disabled={isLoading}
            size="small"
            sx={{
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
              },
            }}
          />
          <IconButton
            type="submit"
            disabled={!inputValue.trim() || isLoading}
            color="primary"
            sx={{
              minWidth: 48,
              height: 48,
              borderRadius: 3,
            }}
          >
            <SendIcon />
          </IconButton>
        </Box>
      </Box>
    </Box>
  );
};

export default DocumentChat; 