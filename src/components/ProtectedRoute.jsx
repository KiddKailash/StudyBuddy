import React from 'react';
import { Navigate } from 'react-router-dom';
import PropTypes from 'prop-types';

/**
 * ProtectedRoute component to guard routes that require authentication.
 *
 * @param {Object} props - Props passed to the component.
 * @param {React.ReactNode} props.children - Child components to render.
 * @param {boolean} props.isLoggedIn - Authentication status.
 * @returns {React.ReactNode} - Either the child components or a redirect.
 */
const ProtectedRoute = ({ children, isLoggedIn }) => {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  isLoggedIn: PropTypes.bool.isRequired,
};

export default ProtectedRoute;
