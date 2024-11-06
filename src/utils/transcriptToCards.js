// src/components/AiAssist.jsx

import { useState, useCallback } from "react";
import PropTypes from "prop-types";
import { createProject } from "../../story-path/src/api/project-crud-commands";
import { createLocation } from "../../story-path/src/api/location-crud-commands";

// MUI Component Imports
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";
import CircularProgress from "@mui/material/CircularProgress";
import AutoAwesome from "@mui/icons-material/AutoAwesome";

/**
 * Generates JSON data using the OpenAI API based on the provided message.
 *
 * @param {string} apiKey - The OpenAI API key.
 * @param {string} message - The message or user input to generate the JSON data.
 * @param {number|null} projectId - The project ID (optional).
 *
 * @returns {Promise<Object>} - A promise that resolves to the generated JSON response.
 */
const generateJson = async (apiKey, message, projectId = null) => {
  // Prepare the messages array for the OpenAI API request
  const messages = projectId
    ? [
        {
          role: "user",
          content: `Create multiple JSON objects for locations belonging to project ID: {{ const project_id = ${projectId}}} which is a tour created by this user prompt: ${message}, in the format: 
            [
              {
                "project_id": project_id,
                "location_name": "text",
                "location_trigger": "QR Code" OR "Location Entry" OR "Location Entry and QR Code",
                "location_position": "({latitude}, {longitude})",
                "score_points": number,
                "clue": "text",
                "location_content": "WYSIWYG html (<p>, <strong>, etc.)"
              },
              ...
            ]`,
        },
      ]
    : [
        {
          role: "user",
          content: `Create a JSON object for a new ${message} in the format: 
            {
              "title": "text",
              "description": "text",
              "is_published": false,
              "participant_scoring": "number_of_locations_entered" OR "number_of_qr_codes_scanned" OR "not_scored",
              "instructions": "text",
              "initial_clue": "text",
              "homescreen_display": "display_initial_clue" OR "display_all_locations"
            }`,
        },
      ];

  // Make the API request to OpenAI's Chat Completion endpoint
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: messages,
    }),
  });

  // Check for HTTP errors
  if (!response.ok) {
    const errorText = await response.text();
    console.error("OpenAI API Error:", errorText);
    throw new Error(`OpenAI API error: ${response.status}`);
  }

  // Parse the response data
  const responseData = await response.json();
  const jsonContent = responseData?.choices?.[0]?.message?.content;

  // Throw an error if JSON content is not available
  if (!jsonContent) throw new Error("Failed to generate JSON.");

  // Parse and return the JSON content
  try {
    return JSON.parse(jsonContent);
  } catch (parseError) {
    console.error("JSON Parsing Error:", parseError);
    throw new Error("Invalid JSON format received from AI.");
  }
};

/**
 * Handles the creation of a project and its associated locations using AI-generated data.
 *
 * @param {string} message - The user input to generate the project and locations.
 * @param {string} apiKey - The OpenAI API key.
 * @param {function} onJsonResponse - Callback function to invoke after creation.
 *
 * @returns {Promise<void>} - A promise that resolves when the operation is complete.
 */
const handleProjectAndLocationCreation = async (
  message,
  apiKey,
  onJsonResponse
) => {
  // Generate project data using AI
  const projectData = await generateJson(apiKey, message);
  console.log("Generated Project JSON:", projectData);

  // Create the project
  const createdProject = await createProject(projectData);
  console.log("API Response from createProject:", createdProject);

  const project = Array.isArray(createdProject)
    ? createdProject[0]
    : createdProject;
  const projectId = project?.id;

  console.log("Created Project:", project);

  // Ensure the project ID is available
  if (!projectId) throw new Error("Failed to retrieve project ID.");

  // Generate locations data using AI
  const locationsData = await generateJson(apiKey, message, projectId);
  console.log("Generated Locations JSON:", locationsData);

  // Validate locationsData is an array
  if (!Array.isArray(locationsData)) {
    throw new Error("Locations data is not an array.");
  }

  // Create each location
  for (const locationData of locationsData) {
    const createdLocation = await createLocation(locationData);
    console.log("Created Location:", createdLocation);
  }

  // Invoke the callback if provided
  onJsonResponse?.();
};

/**
 * AiAssist component that provides an interface for AI-assisted project and location creation.
 *
 * @param {function} onJsonResponse - Callback function to invoke after successful creation.
 *
 * @returns {JSX.Element} - The rendered AiAssist component.
 */
const AiAssist = ({ onJsonResponse }) => {
  // State variables for dialog visibility, message input, error message, and loading status
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Get the OpenAI API key from environment variables using Vite's import.meta.env
  const apiKey = import.meta.env.VITE_OPENAI_API_KEY;

  /**
   * Toggles the open state of the dialog.
   */
  const handleDialogToggle = useCallback(() => setOpen((prev) => !prev), []);

  /**
   * Handles changes in the message input field.
   *
   * @param {object} event - The change event from the input field.
   */
  const handleMessageChange = useCallback(
    (event) => setMessage(event.target.value),
    []
  );

  /**
   * Handles the send action when the user submits a message.
   */
  const handleSendMessage = useCallback(async () => {
    if (!message.trim()) {
      setError("Message cannot be empty.");
      return;
    }

    if (!apiKey) {
      setError(
        "OpenAI API key is missing. Please set it in your environment variables."
      );
      return;
    }

    setError("");
    setLoading(true);

    try {
      await handleProjectAndLocationCreation(message, apiKey, onJsonResponse);
      // Optionally, close the dialog upon successful creation
      setOpen(false);
      setMessage("");
    } catch (err) {
      setError(err.message || "Network error. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [message, apiKey, onJsonResponse]);

  /**
   * Handles the Enter key press event to trigger sending the message.
   *
   * @param {object} event - The key press event from the input field.
   */
  const handleKeyPress = useCallback(
    (event) => {
      if (event.key === "Enter" && !loading) {
        handleSendMessage();
      }
    },
    [handleSendMessage, loading]
  );

  return (
    <Box>
      <Button variant="contained" onClick={handleDialogToggle}>
        <AutoAwesome sx={{ marginRight: 1 }} />
        AI Assist
      </Button>

      <Dialog open={open} onClose={handleDialogToggle} fullWidth maxWidth="sm">
        <DialogTitle>AI Project Creator</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Enter a project concept or idea"
            fullWidth
            variant="outlined"
            value={message}
            onChange={handleMessageChange}
            onKeyPress={handleKeyPress}
            disabled={loading}
            sx={{ mt: 2 }}
          />

          {loading && (
            <Box sx={{ display: "flex", justifyContent: "center", mt: 2 }}>
              <CircularProgress size={24} />
            </Box>
          )}

          {error && (
            <Box sx={{ mt: 2, color: "red" }}>
              <strong>Error:</strong> {error}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogToggle} disabled={loading}>
            Close
          </Button>
          <Button
            onClick={handleSendMessage}
            variant="contained"
            color="primary"
            disabled={loading}
          >
            Send
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

AiAssist.propTypes = {
  onJsonResponse: PropTypes.func.isRequired, // Validate that onJsonResponse is a function and required
};

export default AiAssist;
