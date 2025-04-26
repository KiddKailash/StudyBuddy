import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchAllAiChats = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return [];
    
    // Skip if we already know these endpoints fail
    if (hasEndpointFailed('aichats') && hasEndpointFailed('aichat')) {
      console.log('Skipping AI chats fetch - endpoints previously failed');
      return [];
    }
    
    // Try the plural endpoint first, fall back to singular if needed
    try {
      const resp = await axios.get(`${BACKEND}/api/aichats`, { headers });
      // The controller returns { chats: [ {id, ...}, ... ] }
      return resp.data.chats || [];
    } catch (chatError) {
      recordEndpointError('aichats');
      
      // If not already tried, try alternative endpoint
      if (!hasEndpointFailed('aichat')) {
        try {
          const altResp = await axios.get(`${BACKEND}/api/aichat`, { headers });
          return altResp.data.chats || [];
        } catch (altError) {
          recordEndpointError('aichat');
          throw altError;
        }
      } else {
        throw chatError;
      }
    }
  } catch (error) {
    console.error("fetchAllAiChats error:", error);
    return []; // Return empty array on error
  }
};

export const fetchAiChatsByFolder = async (folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");

    const res = await axios.get(`${BACKEND}/api/aichats/folder/${folderID}`, { headers });
    return res.data.chats; // The array of chats
  } catch (error) {
    console.error("fetchAiChatsByFolder error:", error);
    throw error;
  }
};

export const createChat = async (uploadId, userMessage, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const resp = await axios.post(
      `${BACKEND}/api/aichats`,
      { uploadId, userMessage, folderID },
      { headers }
    );
    // The server returns { chat: { id, ... } }
    return resp.data.chat;
  } catch (error) {
    console.error("createChat error:", error);
    throw error;
  }
};

export const deleteAiChat = async (chatId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.delete(`${BACKEND}/api/aichats/${chatId}`, { headers });
    return true;
  } catch (error) {
    console.error("deleteAiChat error:", error);
    return false;
  }
};

export const renameAiChat = async (chatId, newName) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.put(
      `${BACKEND}/api/aichats/${chatId}/rename`,
      { newName },
      { headers }
    );
    
    return true;
  } catch (error) {
    console.error("renameAiChat error:", error);
    return false;
  }
};

export const assignAiChatToFolder = async (chatId, folderID) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    // Make API call to the backend endpoint
    const response = await axios.put(
      `${BACKEND}/api/aichats/${chatId}/assign-folder`,
      { folderID },
      { headers }
    );
    
    return response.data;
  } catch (error) {
    console.error("assignAiChatToFolder error:", error);
    throw error;
  }
};

export default {
  fetchAllAiChats,
  fetchAiChatsByFolder,
  createChat,
  deleteAiChat,
  renameAiChat,
  assignAiChatToFolder
}; 