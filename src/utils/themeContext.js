import { createContext, useContext } from 'react';

/**
 * ThemeContext is a React context that holds the current theme state and dispatch function.
 *
 * @type {React.Context}
 */
export const ThemeContext = createContext();

/**
 * Custom hook to access the current theme context.
 *
 * @return {object} - The current theme context value, including the theme mode and dispatch function.
 */
export const useThemeContext = () => useContext(ThemeContext);
