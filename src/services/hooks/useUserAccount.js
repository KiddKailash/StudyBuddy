import { useState } from 'react';
import services from '../_SERVICE_EXPORTS';

/**
 * Custom hook for managing user account settings
 * 
 * This hook provides functionality for user account management including
 * updating account information, changing passwords, setting preferences,
 * managing subscriptions, and requesting features.
 * 
 * @returns {Object} Account management methods and state
 * @property {boolean} accountUpdateLoading - Whether an account update operation is in progress
 * @property {string|null} accountUpdateError - Current error message or null if no error
 * @property {Function} updateAccountInfo - Function to update user account information
 * @property {Function} changePassword - Function to change user password
 * @property {Function} updatePreferences - Function to update user preferences
 * @property {Function} cancelSubscription - Function to cancel a subscription
 * @property {Function} requestFeature - Function to submit feature requests
 */
export function useUserAccount() {
  const [accountUpdateLoading, setAccountUpdateLoading] = useState(false);
  const [accountUpdateError, setAccountUpdateError] = useState(null);

  /**
   * Updates user account information
   * 
   * @param {Object} payload - User information to update
   * @returns {Promise<Object>} Updated user information
   * @throws {Error} If update operation fails
   */
  const updateAccountInfo = async (payload) => {
    setAccountUpdateLoading(true);
    setAccountUpdateError(null);
    try {
      const updatedUser = await services.user.updateAccountInfo(payload);
      setAccountUpdateLoading(false);
      return updatedUser;
    } catch (error) {
      setAccountUpdateError(error.message || "Error updating account info");
      setAccountUpdateLoading(false);
      throw error;
    }
  };

  /**
   * Changes user password
   * 
   * @param {Object} payload - Password change data (old and new password)
   * @returns {Promise<boolean>} True if password change was successful
   * @throws {Error} If password change fails
   */
  const changePassword = async (payload) => {
    setAccountUpdateLoading(true);
    setAccountUpdateError(null);
    try {
      const success = await services.user.changePassword(payload);
      setAccountUpdateLoading(false);
      return success;
    } catch (error) {
      setAccountUpdateError(error.message || "Error changing password");
      setAccountUpdateLoading(false);
      throw error;
    }
  };

  /**
   * Updates user preferences
   * 
   * @param {Object} payload - User preferences to update
   * @returns {Promise<Object>} Updated user information
   * @throws {Error} If preferences update fails
   */
  const updatePreferences = async (payload) => {
    setAccountUpdateLoading(true);
    setAccountUpdateError(null);
    try {
      const updatedUser = await services.user.updatePreferences(payload);
      setAccountUpdateLoading(false);
      return updatedUser;
    } catch (error) {
      setAccountUpdateError(error.message || "Error updating preferences");
      setAccountUpdateLoading(false);
      throw error;
    }
  };

  /**
   * Cancels user subscription
   * 
   * @returns {Promise<Object>} Updated user information
   * @throws {Error} If subscription cancellation fails
   */
  const cancelSubscription = async () => {
    setAccountUpdateLoading(true);
    setAccountUpdateError(null);
    try {
      const updatedUser = await services.user.cancelSubscription();
      setAccountUpdateLoading(false);
      return updatedUser;
    } catch (error) {
      setAccountUpdateError(error.message || "Error cancelling subscription");
      setAccountUpdateLoading(false);
      throw error;
    }
  };

  /**
   * Submits feature requests
   * 
   * @param {Array|string} features - Feature(s) to request
   * @returns {Promise<Object>} Response from feature request submission
   * @throws {Error} If feature request submission fails
   */
  const requestFeature = async (features) => {
    setAccountUpdateLoading(true);
    setAccountUpdateError(null);
    try {
      const response = await services.user.requestFeature(features);
      setAccountUpdateLoading(false);
      return response;
    } catch (error) {
      setAccountUpdateError(error.message || "Error requesting feature");
      setAccountUpdateLoading(false);
      throw error;
    }
  };

  return {
    accountUpdateLoading,
    accountUpdateError,
    updateAccountInfo,
    changePassword,
    updatePreferences,
    cancelSubscription,
    requestFeature
  };
} 