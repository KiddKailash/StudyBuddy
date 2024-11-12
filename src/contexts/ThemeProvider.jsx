import React, { useReducer, useMemo, createContext, useContext } from 'react';
import PropTypes from 'prop-types';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import GlobalStyles from '@mui/material/GlobalStyles';
import Button from '@mui/material/Button';

/**
 * ThemeContext is a React context that holds the current theme mode and a dispatch function to toggle it.
 */
const ThemeContext = createContext();
 
/**
 * Custom hook to access the ThemeContext.
 *
 * @return {object} - Contains the current theme mode and the dispatch function.
 */
const useThemeContext = () => useContext(ThemeContext);

/**
 * Reducer function to toggle the theme mode between 'light' and 'dark'.
 *
 * @param {string} state - The current theme mode.
 * @return {string} - The next theme mode.
 */
const themeReducer = (state) => (state === 'light' ? 'dark' : 'light');

/**
 * SetTheme component provides theming context and applies the selected theme.
 *
 * @param {object} props - The component props.
 * @param {React.ReactNode} props.children - The child components to render within the theme.
 * @return {JSX.Element} - The MuiThemeProvider wrapped component with theme context.
 */
function SetTheme({ children }) {
  // useReducer hook to manage the theme mode state
  const [mode, dispatch] = useReducer(themeReducer, 'light');

  // Memoize the theme object to prevent unnecessary recalculations
  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode,
          // Conditional palette settings based on the current mode
          ...(mode === 'light'
            ? {
                background: {
                  default: '#f5f5f5',
                  paper: '#f5f5f5',
                },
                text: {
                  primary: '#000000',
                },
              }
            : {
                background: {
                  default: '#292929',
                  paper: '#121212',
                },
                text: {
                  primary: '#ffffff',
                },
              }),
        },
        transitions: {
          duration: {
            standard: 300,
          },
          easing: {
            ease: 'ease',
          },
          // Custom transition for background and text color
          backgroundAndText: 'background-color 0.1s ease, color 0.1s ease',
        },
        spacing: 8,
      }),
    [mode]
  );

  return (
    // Provide the theme mode and dispatch function via Context
    <ThemeContext.Provider value={{ dispatch, mode }}>
      {/* Apply the theme to child components */}
      <MuiThemeProvider theme={theme}>
        {/* Normalize CSS and apply baseline styles */}
        <CssBaseline />
        {/* Apply global transitions */}
        <GlobalStyles
          styles={{
            '*': {
              transition: 'background-color 0.1s ease, color 0.1s ease',
            },
            'html, body': {
              height: '100%',
            },
            '#root': {
              height: '100%',
            },
          }}
        />
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
}

SetTheme.propTypes = {
  children: PropTypes.node.isRequired,
};

/**
 * ThemeToggleButton component allows users to toggle between light and dark themes.
 *
 * @return {JSX.Element} - The button component to toggle the theme mode.
 */
function ThemeToggleButton() {
  // Access the theme context to get the current mode and dispatch function
  const { dispatch, mode } = useThemeContext();

  return (
    <Button
      onClick={dispatch} // Toggle the theme mode when clicked

      sx={{
        color: (theme) => theme.palette.text.primary,
        backgroundColor: (theme) => theme.palette.background.default,
        '&:hover': {
          backgroundColor: (theme) => theme.palette.action.hover,
        },
        transition: (theme) => theme.transitions.backgroundAndText,
      }}
      variant="text"
    >
      {/* Display the opposite mode as the button label */}
      {mode === 'light' ? 'Dark' : 'Light'} Mode
    </Button>
  );
}

export { ThemeToggleButton };
export default SetTheme;
