/**
 * ThemeContext.jsx
 * 
 * This file provides a theme context for the application that handles both light and dark mode.
 * It automatically detects system preferences and allows manual theme toggling.
 * The context is integrated with Material-UI's theming system.
 */

import { createContext, useContext, useMemo, useState, useEffect } from 'react';
import { ThemeProvider as MUIThemeProvider, CssBaseline } from '@mui/material';
import { getTheme } from '../styles/global';
import PropTypes from 'prop-types';

// Create the theme context
const ThemeContext = createContext();

/**
 * Custom hook to access the theme context
 * @returns {Object} Theme context containing mode and toggle function
 * @throws {Error} If used outside of ThemeProvider
 */
//eslint-disable-next-line
export const useThemeContext = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useThemeContext must be used within a ThemeProvider');
  }
  return context;
};

/**
 * Detects the user's system color scheme preference
 * @returns {string} 'light' or 'dark' based on system preference
 */
const getSystemPreference = () => {
  if (typeof window !== 'undefined' && window.matchMedia) {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  }
  return 'light';
};

/**
 * ThemeProvider component that manages theme state and provides theme context
 * @param {Object} props - Component props
 * @param {ReactNode} props.children - Child components to be wrapped with theme context
 */
export const ThemeProvider = ({ children }) => {
  // Initialize theme mode with system preference
  const [mode, setMode] = useState(getSystemPreference());

  // Listen for system preference changes and update theme accordingly
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = (e) => setMode(e.matches ? 'dark' : 'light');
    
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Toggle between light and dark mode
  const toggleTheme = () => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
  };

  // Memoize theme object to prevent unnecessary recalculations
  const theme = useMemo(() => getTheme(mode), [mode]);

  // Context value containing current mode and toggle function
  const value = {
    mode,
    toggleTheme,
    dispatch: toggleTheme // for backward compatibility
  };

  return (
    <ThemeContext.Provider value={value}>
      <MUIThemeProvider theme={theme}>
        <CssBaseline />
        {children}
      </MUIThemeProvider>
    </ThemeContext.Provider>
  );
};

ThemeProvider.propTypes = {
  children: PropTypes.node.isRequired
}; 