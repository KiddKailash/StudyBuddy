/**
 * User Service Module
 * 
 * Provides functionality for managing user account information, including:
 * - Updating user profile information
 * - Changing passwords
 * - Managing user preferences
 * - Subscription management
 * - Feature requests
 */

import axios from "axios";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";

const BACKEND = getBackendUrl();

/**
 * Update user account information
 * 
 * @param {Object} payload - User data to update (name, email, etc.)
 * @returns {Object} - Updated user object
 */
export const updateAccountInfo = async (payload) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.put(`${BACKEND}/api/users/update`, payload, { headers });
    return response.data.user;
  } catch (error) {
    console.error("updateAccountInfo error:", error);
    throw error;
  }
};

/**
 * Change user password
 * 
 * @param {Object} payload - Contains currentPassword and newPassword
 * @returns {boolean} - True if password change was successful
 */
export const changePassword = async (payload) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.put(`${BACKEND}/api/users/change-password`, payload, { headers });
    return true;
  } catch (error) {
    console.error("changePassword error:", error);
    throw error;
  }
};

/**
 * Update user preferences
 * 
 * @param {Object} payload - Preference settings to update
 * @returns {Object} - Updated user object with new preferences
 */
export const updatePreferences = async (payload) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.put(
      `${BACKEND}/api/users/preferences`,
      payload,
      { headers }
    );
    
    return response.data.user;
  } catch (error) {
    console.error("updatePreferences error:", error);
    throw error;
  }
};

/**
 * Cancel user's subscription
 * 
 * @returns {Object} - Updated user object with subscription status changed
 */
export const cancelSubscription = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    // First, request subscription cancellation
    await axios.post(
      `${BACKEND}/api/checkout/cancel-subscription`,
      {},
      { headers }
    );
    
    // Then fetch the updated user data to confirm changes
    const updatedUserResponse = await axios.get(`${BACKEND}/api/auth/me`, { headers });
    return updatedUserResponse.data.user;
  } catch (error) {
    console.error("cancelSubscription error:", error);
    throw error;
  }
};

/**
 * Submit feature requests from users
 * 
 * @param {Array|string} features - Feature request(s) to submit
 * @returns {Object} - Server response confirming request receipt
 */
export const requestFeature = async (features) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.post(
      `${BACKEND}/api/feature-request`,
      { features },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error("requestFeature error:", error);
    throw error;
  }
};

export default {
  updateAccountInfo,
  changePassword,
  updatePreferences,
  cancelSubscription,
  requestFeature
}; 