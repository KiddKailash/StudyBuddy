// src/components/Sidebar.jsx

import React, { useState, useEffect } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import axios from "axios";

const Sidebar = () => {
  const [flashcards, setFlashcards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  /**
   * Fetches the user's flashcard sessions from the backend.
   */
  const fetchFlashcards = async () => {
    setLoading(true);
    setError("");

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("User is not authenticated.");
      }

      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setFlashcards(response.data.flashcards);
    } catch (err) {
      console.error("Error fetching flashcards:", err);
      setError(
        err.response?.data?.error ||
          err.message ||
          "An error occurred while fetching flashcards."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFlashcards();
  }, []);

  return (
    <List component="nav" sx={{ width: "100%", bgcolor: "background.paper" }}>
      {loading ? (
        <ListItem>
          <ListItemText primary="Loading..." />
        </ListItem>
      ) : error ? (
        <ListItem>
          <ListItemText primary={error} />
        </ListItem>
      ) : flashcards.length === 0 ? (
        <ListItem>
          <Typography variant="subtitle1">New Study Session</Typography>
        </ListItem>
      ) : (
        <>
          {flashcards.map((session) => (
            <React.Fragment key={session.id}>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/flashcards/${session.id}`}
                >
                  <ListItemText primary={session.StudySession} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </>
      )}
    </List>
  );
};

export default Sidebar;
