/**
 * Folder Service Module
 * 
 * Provides functionality for managing organizational folders, including:
 * - Fetching all folders
 * - Creating new folders
 * - Renaming and deleting folders
 * 
 * Folders are used to organize uploads, flashcards, quizzes, and other content
 * in the application.
 */

import axios from "axios";
import { getAuthHeaders, getBackendUrl } from "./apiUtils";

const BACKEND = getBackendUrl();

/**
 * Fetch all folders for the current user
 * 
 * @returns {Array} - List of folder objects
 */
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

/**
 * Alternative method to fetch folders
 * 
 * @returns {Array} - List of folder objects
 * @deprecated Use fetchFolders instead
 */
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

/**
 * Create a new folder
 * 
 * @param {string} folderName - Name for the new folder
 * @returns {Object} - The created folder object
 */
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

/**
 * Rename an existing folder
 * 
 * @param {string} folderId - ID of the folder to rename
 * @param {string} newName - New name for the folder
 * @returns {boolean} - True if rename was successful
 */
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

/**
 * Delete a folder
 * 
 * @param {string} folderId - ID of the folder to delete
 * @returns {boolean} - True if deletion was successful
 */
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