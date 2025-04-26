import { useState } from 'react';
import services from '../index';

/**
 * Custom hook for managing user account settings
 */
export function useUserAccount() {
  const [accountUpdateLoading, setAccountUpdateLoading] = useState(false);
  const [accountUpdateError, setAccountUpdateError] = useState(null);

  // Update user account information
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

  // Change password
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

  // Update user preferences
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

  // Cancel subscription
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

  // Request a feature
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