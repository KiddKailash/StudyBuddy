import axios from "axios";
import { getAuthHeaders, getBackendUrl, hasEndpointFailed, recordEndpointError } from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchAllAiChats = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) {
      console.log("chatService: No auth token available");
      return [];
    }
    
    console.log("chatService: Fetching all AI chats from API");
    
    try {
      const resp = await axios.get(`${BACKEND}/api/chats`, { headers });
      console.log("chatService: Chats response received", resp.status);
      
      const chatsData = resp.data.chats || resp.data.data || [];
      console.log("chatService: Raw chats data", {
        hasChatsField: !!resp.data.chats,
        hasDataField: !!resp.data.data,
        resultLength: chatsData.length,
        responseKeys: Object.keys(resp.data)
      });
      
      // Check for duplicate IDs
      const ids = chatsData.map(c => c.id);
      const uniqueIds = new Set(ids);
      if (ids.length !== uniqueIds.size) {
        console.warn('chatService: Duplicate chat IDs detected');
        
        // Return only unique chats
        const uniqueChats = [];
        const seenIds = new Set();
        for (const chat of chatsData) {
          if (!seenIds.has(chat.id)) {
            uniqueChats.push(chat);
            seenIds.add(chat.id);
          }
        }
        console.log(`chatService: Removed ${chatsData.length - uniqueChats.length} duplicate chats`);
        return uniqueChats;
      }
      
      return chatsData;
    } catch (error) {
      console.error("chatService: fetchAllAiChats request error:", error);
      console.error("chatService: Error status:", error.response?.status);
      console.error("chatService: Error details:", error.response?.data || 'No response data');
      return []; // Return empty array on error
    }
  } catch (error) {
    console.error("chatService: fetchAllAiChats general error:", error);
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