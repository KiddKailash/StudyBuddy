import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../../contexts/UserContext";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";

const AIChatPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);

  // Local state
  const [chat, setChat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");
  const [userMessage, setUserMessage] = useState("");

  useEffect(() => {
    // If the user is not logged in, you can either set an error or do ephemeral logic
    if (!isLoggedIn) {
      setErrorMessage("You must be logged in to view this chat.");
      setLoading(false);
      return;
    }

    const fetchChat = async () => {
      try {
        setLoading(true);
        const localToken = localStorage.getItem("token");
        if (!localToken) {
          setErrorMessage("No access token found. Please log in again.");
          setLoading(false);
          return;
        }

        const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;
        const response = await axios.get(`${BACKEND}/api/aichats/${id}`, {
          headers: { Authorization: `Bearer ${localToken}` },
        });

        // The server might return { chat: {...} } or { data: {...} },
        // depending on your controller. Adjust accordingly:
        // For example: const fetchedChat = response.data.chat;
        const fetchedChat = response.data.chat;
        setChat(fetchedChat);
      } catch (error) {
        console.error("Error fetching AI chat:", error);
        setErrorMessage(
          error.response?.data?.error ||
            "Error fetching chat. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchChat();
  }, [id, isLoggedIn]);

  const handleSend = () => {
    // Optionally call an API to add a new message to this chat
    // e.g. POST /api/aichats/:id/messages
    console.log("Sending message:", userMessage);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  // If there's an error or no chat found
  if (errorMessage || !chat) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" gutterBottom>
          {errorMessage || "Chat not found."}
        </Typography>
        <Typography
          sx={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={() => navigate("/create")}
        >
          Go back home
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Typography variant="h4" gutterBottom>
        AI Chat
      </Typography>
      <Box>
        {chat.messagesJSON?.map((m, idx) => (
          <Box
            key={idx}
            sx={{ my: 1, textAlign: m.role === "user" ? "right" : "left" }}
          >
            <Typography variant="body1">
              <strong>{m.role}:</strong> {m.content}
            </Typography>
          </Box>
        ))}
      </Box>
      {/* Simple input to continue chat (if you handle it) */}
      <Box sx={{ mt: 3 }}>
        <TextField
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          fullWidth
          label="Type your message..."
          multiline
        />
        <Button variant="contained" onClick={handleSend} sx={{ mt: 1 }}>
          Send
        </Button>
      </Box>
    </>
  );
};

export default AIChatPage;
