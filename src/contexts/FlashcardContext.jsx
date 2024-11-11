import React, { createContext, useState, useEffect } from "react";
import PropTypes from "prop-types"; // Import PropTypes
import axios from "axios";

// Create the Context
export const FlashcardContext = createContext();

// Create the Provider Component
export const FlashcardProvider = ({ children }) => {
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

  /**
   * Adds a new flashcard session to the context.
   */
  const addFlashcard = (newFlashcard) => {
    setFlashcards((prevFlashcards) => [newFlashcard, ...prevFlashcards]);
  };

  useEffect(() => {
    fetchFlashcards();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Fetch once on mount

  return (
    <FlashcardContext.Provider
      value={{ flashcards, loading, error, fetchFlashcards, addFlashcard }}
    >
      {children}
    </FlashcardContext.Provider>
  );
};

// PropTypes Validation
FlashcardProvider.propTypes = {
  children: PropTypes.node.isRequired,
};
