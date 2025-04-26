import axios from "axios";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";

const BACKEND = getBackendUrl();

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

export const cancelSubscription = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.post(
      `${BACKEND}/api/checkout/cancel-subscription`,
      {},
      { headers }
    );
    
    const updatedUserResponse = await axios.get(`${BACKEND}/api/auth/me`, { headers });
    return updatedUserResponse.data.user;
  } catch (error) {
    console.error("cancelSubscription error:", error);
    throw error;
  }
};

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