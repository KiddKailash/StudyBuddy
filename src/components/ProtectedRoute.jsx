// src/components/ProtectedRoute.jsx
import React from "react";
import { Navigate } from "react-router-dom";
import PropTypes from "prop-types";

/**
 * ProtectedRoute component restricts access to authenticated users.
 *
 * @param {Object} props - Component props.
 * @param {boolean} props.isLoggedIn - Current login state.
 * @param {React.ReactNode} props.children - Child components.
 * @return {JSX.Element} - The rendered component or a redirect.
 */
const ProtectedRoute = ({ isLoggedIn, children }) => {
  if (!isLoggedIn) {
    return <Navigate to="/" replace />;
  }
  return children;
};

ProtectedRoute.propTypes = {
  isLoggedIn: PropTypes.bool.isRequired,
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
