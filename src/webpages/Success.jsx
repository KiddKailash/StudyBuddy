import React, { useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { UserContext } from "../contexts/UserContext";
import axios from 'axios';
import { Typography, Container, Box, Button } from '@mui/material';

const Success = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { setUser } = useContext(UserContext);

  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');

    const fetchSession = async () => {
      if (!sessionId) return;

      try {
        // Optionally, verify the session on the backend or fetch updated user data
        // For simplicity, we'll assume the backend updates the user's subscription via webhooks

        // Refresh user data
        const token = localStorage.getItem("token");
        if (!token) throw new Error("User is not authenticated.");

        const response = await axios.get(
          `${import.meta.env.VITE_LOCAL_BACKEND_URL}/api/auth/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        setUser(response.data.user);
      } catch (error) {
        console.error('Error fetching user data after checkout:', error);
      }
    };

    fetchSession();
  }, [location.search, setUser]);

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Thank You for Your Purchase!
        </Typography>
        <Typography variant="body1">
          Your subscription has been successfully upgraded.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Go to Dashboard
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Success;
