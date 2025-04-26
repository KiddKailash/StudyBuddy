import axios from "axios";
import {
  getAuthHeaders,
  getBackendUrl,
  hasEndpointFailed,
  recordEndpointError,
  getToken,
} from "./apiUtils";

const BACKEND = getBackendUrl();

export const fetchUploads = async () => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return [];

    console.log("Fetching uploads...");
    const resp = await axios.get(`${BACKEND}/api/uploads`, { headers });

    // Extract uploads from the response, handling different possible structures
    const uploaded = resp.data.uploads || resp.data.data || [];

    return uploaded;
  } catch (error) {
    console.error("fetchUploads error:", error);
    return []; // Return empty array on error
  }
};

export const uploadDocumentTranscript = async (
  selectedFile,
  folderID = null
) => {
  const formData = new FormData();
  formData.append("file", selectedFile);

  // Only append folderID if it's not null
  if (folderID !== null) {
    formData.append("folderID", folderID);
  }

  // Log the FormData contents
  console.log("FormData contents:");
  for (let [key, value] of formData.entries()) {
    console.log(key, value);
  }

  console.log("Uploading file with folderID:", folderID);

  // Get only the Authorization header for file uploads
  const token = getToken();
  const headers = {
    Authorization: token ? `Bearer ${token}` : "",
  };

  if (!headers.Authorization) {
    // ephemeral
    const resp = await axios.post(`${BACKEND}/api/upload-public`, formData);
    return { id: "", transcript: resp.data.transcript };
  } else {
    const resp = await axios.post(`${BACKEND}/api/uploads`, formData, {
      headers,
    });
    return resp.data.upload;
  }
};

export const createUploadFromText = async (
  transcriptText,
  fileName = "Text Input"
) => {
  const headers = getAuthHeaders();

  if (!headers.Authorization) {
    // ephemeral
    return { id: "", transcript: transcriptText, fileName };
  } else {
    const resp = await axios.post(
      `${BACKEND}/api/uploads/from-text`,
      { transcript: transcriptText, fileName },
      { headers }
    );
    return resp.data.upload;
  }
};

export const getWebsiteTranscript = async (websiteUrl) => {
  const headers = getAuthHeaders();

  if (!headers.Authorization) {
    // ephemeral
    const resp = await axios.get(`${BACKEND}/api/website-transcript-public`, {
      params: { url: websiteUrl.trim() },
    });
    return resp.data.transcript;
  } else {
    const resp = await axios.get(`${BACKEND}/api/website-transcript`, {
      params: { url: websiteUrl.trim() },
      headers,
    });
    return resp.data.transcript;
  }
};

export const deleteUpload = async (upload_id) => {
  try {
    const headers = getAuthHeaders();
    if (!headers.Authorization) return false;

    // Array of possible delete endpoint paths to try
    const endpointPaths = [
      `/api/uploads/${upload_id}`, // Plural (standard REST)
      `/api/upload/${upload_id}`, // Singular
      `/uploads/${upload_id}`, // Without /api prefix (plural)
      `/upload/${upload_id}`, // Without /api prefix (singular)
    ];

    let success = false;

    // Try each endpoint until one works
    for (const path of endpointPaths) {
      // Skip if we already know this endpoint fails
      if (hasEndpointFailed(`${BACKEND}${path}`)) continue;

      try {
        console.log(`Trying delete endpoint: ${BACKEND}${path}`);
        await axios.delete(`${BACKEND}${path}`, { headers });
        success = true;
        console.log(`Success with delete endpoint: ${BACKEND}${path}`);
        break; // Exit the loop if successful
      } catch (error) {
        console.error(`Failed with delete endpoint ${path}:`, error);
        recordEndpointError(`${BACKEND}${path}`);
        // Continue trying other endpoints
      }
    }

    return success;
  } catch (error) {
    console.error("deleteUpload error:", error);
    return false;
  }
};

export default {
  fetchUploads,
  uploadDocumentTranscript,
  createUploadFromText,
  getWebsiteTranscript,
  deleteUpload,
};
