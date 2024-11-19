import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { UserContext } from '../contexts/UserContext';
import CircularProgress from '@mui/material/CircularProgress';
import Box from '@mui/material/Box';

/**
 * A wrapper for protected routes that redirects to the login page if not authenticated.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The component to render if authenticated.
 * @returns {React.ReactNode} - The rendered component or a redirect.
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn, authLoading } = useContext(UserContext);

  if (authLoading) {
    // Show a loading spinner or placeholder while checking authentication
    return (
      <Box
        sx={{
          display: 'flex',
          height: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
