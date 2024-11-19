import React from 'react';
import { useNavigate } from 'react-router-dom';

// MUI Component Imports
import Typography from "@mui/material/Typography";
import Container from "@mui/material/Container";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";

const Cancel = () => {
  const navigate = useNavigate();

  return (
    <Container maxWidth="sm" sx={{ mt: 10, textAlign: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Payment Canceled
        </Typography>
        <Typography variant="body1">
          Your payment was canceled. If this was a mistake, please try again.
        </Typography>
        <Box sx={{ mt: 4 }}>
          <Button variant="contained" color="primary" onClick={() => navigate('/')}>
            Go to Home
          </Button>
        </Box>
      </Box>
    </Container>
  );
};

export default Cancel;
