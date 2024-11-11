import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import axios from 'axios';
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useParams } from 'react-router-dom';
import FlashCard from '../components/FlashCard';

const FlashcardSession = () => {
  const { id } = useParams(); // Study session ID from URL
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  /**
   * Fetches the flashcard session details from the backend.
   */
  const fetchSession = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('User is not authenticated.');
      }

      const response = await axios.get(
        `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/flashcards/${id}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setSession(response.data);
    } catch (err) {
      console.error('Error fetching session:', err);
      setError(
        err.response?.data?.error ||
          err.message ||
          'An error occurred while fetching the session.'
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  return (
    <Container maxWidth="md" sx={{ mt: 5, mb: 5 }}>
      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : error ? (
        <Alert severity="error">{error}</Alert>
      ) : session ? (
        <>
          <Typography variant="h4" gutterBottom>
            {session.StudySession}
          </Typography>
          <Typography variant="subtitle1" gutterBottom>
            Created At: {new Date(session.CreatedDate).toLocaleString()}
          </Typography>

          <Typography variant="h5" gutterBottom sx={{ mt: 4 }}>
            Flashcards
          </Typography>
          {session.FlashcardsJSON.length === 0 ? (
            <Typography>No flashcards in this session.</Typography>
          ) : (
            session.FlashcardsJSON.map((card, index) => (
              <FlashCard
                key={index}
                question={card.question}
                answer={card.answer}
              />
            ))
          )}
        </>
      ) : (
        <Typography>No session data available.</Typography>
      )}
    </Container>
  );
};

FlashcardSession.propTypes = {};

export default FlashcardSession;
