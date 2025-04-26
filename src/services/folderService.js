import axios from "axios";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchFolders = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const resp = await axios.get(`${BACKEND}/api/folders`, { headers });
    return resp.data.folders || [];
  } catch (error) {
    console.error("fetchFolders error:", error);
    return [];
  }
};

export const getFolders = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.get(`${BACKEND}/api/folders`, { headers });
    return response.data.data;
  } catch (error) {
    console.error("getFolders error:", error);
    return [];
  }
};

export const createFolder = async (folderName) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    const response = await axios.post(
      `${BACKEND}/api/folders`,
      { folderName },
      { headers }
    );
    
    return response.data.folder;
  } catch (error) {
    console.error("createFolder error:", error);
    throw error;
  }
};

export const renameFolder = async (folderId, newName) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.put(
      `${BACKEND}/api/folders/${folderId}/rename`,
      { newName },
      { headers }
    );
    
    return true;
  } catch (error) {
    console.error("renameFolder error:", error);
    return false;
  }
};

export const deleteFolder = async (folderId) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) throw new Error("User is not authenticated.");
    
    await axios.delete(
      `${BACKEND}/api/folders/${folderId}`,
      { headers }
    );
    
    return true;
  } catch (error) {
    console.error("deleteFolder error:", error);
    return false;
  }
};

export default {
  fetchFolders,
  getFolders,
  createFolder,
  renameFolder,
  deleteFolder
}; 