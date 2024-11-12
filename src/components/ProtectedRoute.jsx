import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';
import { UserContext } from '../contexts/UserContext';

/**
 * A wrapper for protected routes that redirects to the login page if not authenticated.
 *
 * @param {Object} props - Component props.
 * @param {React.ReactNode} props.children - The component to render if authenticated.
 * @returns {React.ReactNode} - The rendered component or a redirect.
 */
const ProtectedRoute = ({ children }) => {
  const { isLoggedIn } = useContext(UserContext);

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
