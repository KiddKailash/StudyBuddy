import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { UserProvider } from "../../contexts/User";

// Local Components
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import MoveDialog from "./MoveDialog";
import ResourceTypeMenu from "../../components/ResourceTypeMenu";
import UploadResource from "../../pages/UploadResource";

// MUI
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import Button from "@mui/material/Button";

// MUI Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";

// Translation utility (simplified for this example)
const t = (key) => {
  const translations = {
    delete: "Delete",
    rename: "Rename",
    move: "Move",
    cancel: "Cancel",
    delete_study_session: "Delete Study Session",
    rename_study_session: "Rename Study Session",
    move_study_session: "Move Study Session",
    delete_confirmation: "Are you sure you want to delete this study session?",
    rename_prompt: "Enter a new name for this study session",
    move_prompt: "Select a folder to move this study session to",
    new_session_name: "New session name",
    select_folder: "Select folder",
    unfoldered: "Unfoldered",
  };
  return translations[key] || key;
};

/**
 * SidebarContent component that displays the folder's study resources
 */
const SidebarContent = ({ isExpanded = true, mobileMode = false }) => {
  const navigate = useNavigate();
  const { folderID } = useParams();
  const location = useLocation();

  const activePath = location.pathname;

  const {
    isLoggedIn,
    flashcardSessions = [],
    multipleChoiceQuizzes = [],
    summaries = [],
    aiChats = [],
    folders = [],
    fetchUploads,
    updateFlashcardSessionName,
    renameQuiz,
    renameSummary,
    renameAiChat,
    deleteFlashcardSession,
    deleteQuiz,
    deleteSummary,
    deleteAiChat,
    assignSessionToFolder,
    assignQuizToFolder,
    assignSummaryToFolder,
    assignAiChatToFolder,
    getResourcesByFolder,
    dataLoading
  } = useContext(UserContext);

  // State for dropdown menu
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);
  const [selectedItemType, setSelectedItemType] = useState("");

  // State for dialogs
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [confirmDialogType, setConfirmDialogType] = useState("");
  const [newSessionName, setNewSessionName] = useState("");
  const [moveDialogOpen, setMoveDialogOpen] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState("");

  // State for resource type menu
  const [resourceMenuAnchorEl, setResourceMenuAnchorEl] = useState(null);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [selectedResourceType, setSelectedResourceType] = useState(null);
  const [resourceDialogOpen, setResourceDialogOpen] = useState(false);

  // Add ref to track if uploads are already fetched
  const uploadsFetchedRef = useRef(false);

  // Fetch uploads when needed (when opening resource dialog)
  useEffect(() => {
    if (resourceDialogOpen && isLoggedIn && !uploadsFetchedRef.current) {
      console.log('SidebarContent: Fetching uploads once');
      fetchUploads()
        .then(() => {
          uploadsFetchedRef.current = true;
        })
        .catch(err => {
          console.error('Failed to fetch uploads in SidebarContent:', err);
        });
    }
    
    // Reset the flag when dialog closes
    if (!resourceDialogOpen) {
      uploadsFetchedRef.current = false;
    }
  }, [resourceDialogOpen, isLoggedIn, fetchUploads]);

  // Get current folder information
  const isNullFolder = folderID === "null" || folderID === undefined;
  const normalizedFolderID = isNullFolder ? "null" : folderID;
  
  // Get folder resources from the already organized data in context
  const folderResources = getResourcesByFolder(normalizedFolderID);
  
  // Resources for this folder
  const filteredFlashcards = folderResources.flashcards || [];
  const filteredMcqs = folderResources.quizzes || [];
  const filteredSummaries = folderResources.summaries || [];
  const filteredAiChats = folderResources.chats || [];

  // Guard: show loader if resources aren't loaded yet
  if (dataLoading) {
    return (
      <Box sx={{ p: 2, textAlign: "center" }}>
        <CircularProgress size={24} />
      </Box>
    );
  }

  // Handle navigation with mobile mode awareness
  const handleNavigate = (path) => {
    navigate(path);
    // If in mobile mode, close drawer by clicking outside
    if (mobileMode) {
      document.body.click();
    }
  };

  // Helper to get correct path with proper folder context
  const getResourcePath = (resourceType, resourceId, resourceFolderID) => {
    // Use the resource's own folderID rather than the current folderID
    // This ensures we navigate to the correct folder context
    const contextFolderID = resourceFolderID || "null";
    
    switch(resourceType) {
      case "flashcard":
        return `/${contextFolderID}/flashcards/${resourceId}`;
      case "quiz":
        return `/${contextFolderID}/mcq/${resourceId}`;
      case "summary":
        return `/${contextFolderID}/summary/${resourceId}`;
      case "chat":
        return `/${contextFolderID}/chat/${resourceId}`;
      default:
        return `/${contextFolderID}`;
    }
  };

  // Handle opening the menu
  const handleMenuOpen = (event, itemId, itemType) => {
    event.stopPropagation();
    setMenuAnchorEl(event.currentTarget);
    setSelectedItem(itemId);
    setSelectedItemType(itemType);
  };

  // Handle closing the menu
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  // Handle opening the delete confirmation dialog
  const handleDeleteClick = () => {
    handleMenuClose();
    setConfirmDialogType("delete");
    setConfirmDialogOpen(true);
  };

  // Handle opening the rename dialog
  const handleRenameClick = () => {
    handleMenuClose();
    
    // Set initial name based on selected item
    let initialName = "";
    switch (selectedItemType) {
      case "flashcard":
        initialName = flashcardSessions.find(s => s.id === selectedItem)?.studySession || "";
        break;
      case "quiz":
        initialName = multipleChoiceQuizzes.find(q => q.id === selectedItem)?.studySession || "";
        break;
      case "summary":
        initialName = summaries.find(s => s.id === selectedItem)?.studySession || "";
        break;
      case "chat":
        initialName = aiChats.find(c => c.id === selectedItem)?.studySession || "";
        break;
      default:
        break;
    }
    
    setNewSessionName(initialName);
    setConfirmDialogType("rename");
    setConfirmDialogOpen(true);
  };

  // Handle opening the move dialog
  const handleMoveClick = () => {
    handleMenuClose();
    
    // Set initial folder ID based on selected item
    let initialFolderId = "";
    switch (selectedItemType) {
      case "flashcard":
        initialFolderId = flashcardSessions.find(s => s.id === selectedItem)?.folderID || "null";
        break;
      case "quiz":
        initialFolderId = multipleChoiceQuizzes.find(q => q.id === selectedItem)?.folderID || "null";
        break;
      case "summary":
        initialFolderId = summaries.find(s => s.id === selectedItem)?.folderID || "null";
        break;
      case "chat":
        initialFolderId = aiChats.find(c => c.id === selectedItem)?.folderID || "null";
        break;
      default:
        initialFolderId = "null";
        break;
    }
    
    setSelectedFolderId(initialFolderId);
    setMoveDialogOpen(true);
  };

  // Handle confirming the delete action
  const handleDeleteConfirm = () => {
    switch (selectedItemType) {
      case "flashcard":
        deleteFlashcardSession(selectedItem);
        break;
      case "quiz":
        deleteQuiz(selectedItem);
        break;
      case "summary":
        deleteSummary(selectedItem);
        break;
      case "chat":
        deleteAiChat(selectedItem);
        break;
      default:
        break;
    }
    setConfirmDialogOpen(false);
  };

  // Handle confirming the rename action
  const handleRenameConfirm = () => {
    if (!newSessionName.trim()) {
      setConfirmDialogOpen(false);
      return;
    }

    switch (selectedItemType) {
      case "flashcard":
        updateFlashcardSessionName(selectedItem, newSessionName);
        break;
      case "quiz":
        renameQuiz(selectedItem, newSessionName);
        break;
      case "summary":
        renameSummary(selectedItem, newSessionName);
        break;
      case "chat":
        renameAiChat(selectedItem, newSessionName);
        break;
      default:
        break;
    }
    setConfirmDialogOpen(false);
  };

  // Handle confirming the move action
  const handleMoveConfirm = async () => {
    const newFolderId = selectedFolderId === "null" ? null : selectedFolderId;

    try {
      // Wait for the database update to complete before proceeding
      switch (selectedItemType) {
        case "flashcard":
          await assignSessionToFolder(selectedItem, newFolderId);
          break;
        case "quiz":
          await assignQuizToFolder(selectedItem, newFolderId);
          break;
        case "summary":
          await assignSummaryToFolder(selectedItem, newFolderId);
          break;
        case "chat":
          await assignAiChatToFolder(selectedItem, newFolderId);
          break;
        default:
          break;
      }
      
      // If the item is being moved out of the current folder,
      // navigate to the corresponding new folder
      if (folderID !== newFolderId && folderID !== "null") {
        const folderId = newFolderId || "null";
        // Use our helper function to generate the correct path
        const newPath = getResourcePath(selectedItemType, selectedItem, folderId);
        navigate(newPath);
      }
      
      setMoveDialogOpen(false);
    } catch (error) {
      console.error("Error moving item to folder:", error);
      setMoveDialogOpen(false);
    }
  };

  // Handle opening the resource type menu
  const handleResourceMenuOpen = (event) => {
    setResourceMenuAnchorEl(event.currentTarget);
  };

  // Handle closing the resource type menu
  const handleResourceMenuClose = () => {
    setResourceMenuAnchorEl(null);
  };

  // Handle selecting a resource type from the menu
  const handleResourceTypeSelect = (resourceType) => {
    setSelectedResourceType(resourceType);
    setResourceDialogOpen(true);
  };

  // Handle opening upload dialog
  const handleOpenUploadDialog = () => {
    setUploadDialogOpen(true);
  };

  // Handle closing upload dialog
  const handleCloseUploadDialog = () => {
    setUploadDialogOpen(false);
  };
  
  // Handle closing resource dialog
  const handleResourceDialogClose = () => {
    setResourceDialogOpen(false);
    setSelectedResourceType(null);
  };

  return (
    <Box sx={{ width: "100%", p: 2 }}>
      {/* Top Action Buttons */}
      <Stack 
        direction="row" 
        spacing={1} 
        sx={{ 
          mb: 2, 
        }}
      >
        <Tooltip title="Home">
          <IconButton 
            size="medium"
            onClick={() => handleNavigate("/create-resource")}
            sx={{ 
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "action.hover",
              }
            }}
          >
            <HomeRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Create Study Resource">
          <IconButton 
            size="medium"
            onClick={handleResourceMenuOpen}
            sx={{ 
              borderRadius: 2,
              "&:hover": {
                backgroundColor: "action.hover",
              }
            }}
          >
            <AddRoundedIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        
      
      </Stack>
      
      <Divider sx={{ mb: 2 }} />
      
      <List component="nav">
        <Stack direction="column" spacing={0.4}>
          {/* Study Resources */}
          {isExpanded && (
            <Typography
              variant="overline"
              sx={{ fontWeight: 700, color: "text.secondary", mb: 1 }}
            >
              Study Resources
            </Typography>
          )}

          {/* No resources message */}
          {filteredFlashcards.length === 0 &&
            filteredMcqs.length === 0 &&
            filteredSummaries.length === 0 &&
            filteredAiChats.length === 0 &&
            isExpanded && (
              <ListItem>
                <ListItemText
                  primary={
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary", fontStyle: "italic" }}
                    >
                      No study resources yet
                    </Typography>
                  }
                />
              </ListItem>
            )}

          {/* Flashcards */}
          {filteredFlashcards.length > 0 && (
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              Flashcards
            </Typography>
          )}
          {filteredFlashcards.map((s) => (
            <SessionItem
              key={s.id}
              session={s}
              resourceType="flashcard"
              isActive={activePath === getResourcePath("flashcard", s.id, s.folderID)}
              onClick={() => handleNavigate(getResourcePath("flashcard", s.id, s.folderID))}
              isExpanded={isExpanded}
              handleMenuOpen={handleMenuOpen}
            />
          ))}

          {/* Multiple choice quizzes */}
          {filteredMcqs.length > 0 && (
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              Practice Quizzes
            </Typography>
          )}
          {filteredMcqs.map((q) => (
            <SessionItem
              key={q.id}
              session={q}
              resourceType="quiz"
              isActive={activePath === getResourcePath("quiz", q.id, q.folderID)}
              onClick={() => handleNavigate(getResourcePath("quiz", q.id, q.folderID))}
              isExpanded={isExpanded}
              handleMenuOpen={handleMenuOpen}
            />
          ))}

          {/* Summaries */}
          {filteredSummaries.length > 0 && (
            <Typography variant="overline" sx={{ color: "text.secondary" }}>
              Summaries
            </Typography>
          )}
          {filteredSummaries.map((summary) => (
            <SessionItem
              key={summary.id}
              session={summary}
              resourceType="summary"
              isActive={activePath === getResourcePath("summary", summary.id, summary.folderID)}
              onClick={() => handleNavigate(getResourcePath("summary", summary.id, summary.folderID))}
              isExpanded={isExpanded}
              handleMenuOpen={handleMenuOpen}
            />
          ))}

          {/* AI Chats */}
          {filteredAiChats.map((chat) => (
            <SessionItem
              key={chat.id}
              session={chat}
              resourceType="chat"
              isActive={activePath === getResourcePath("chat", chat.id, chat.folderID)}
              onClick={() => handleNavigate(getResourcePath("chat", chat.id, chat.folderID))}
              isExpanded={isExpanded}
              handleMenuOpen={handleMenuOpen}
            />
          ))}
        </Stack>
      </List>

      {/* Dropdown Menu */}
      <DropdownMenu
        anchorEl={menuAnchorEl}
        isOpen={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onDeleteClick={handleDeleteClick}
        onRenameClick={handleRenameClick}
        onMoveClick={handleMoveClick}
        t={t}
      />

      {/* Confirmation Dialog for Delete/Rename */}
      <ConfirmationDialog
        open={confirmDialogOpen}
        type={confirmDialogType}
        onClose={() => setConfirmDialogOpen(false)}
        onConfirm={
          confirmDialogType === "delete"
            ? handleDeleteConfirm
            : handleRenameConfirm
        }
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        t={t}
      />

      {/* Move Dialog */}
      <MoveDialog
        open={moveDialogOpen}
        onClose={() => setMoveDialogOpen(false)}
        onConfirm={handleMoveConfirm}
        folders={folders}
        selectedFolderId={selectedFolderId}
        setSelectedFolderId={setSelectedFolderId}
        t={t}
      />

      {/* Resource Type Menu */}
      <ResourceTypeMenu
        anchorEl={resourceMenuAnchorEl}
        open={Boolean(resourceMenuAnchorEl)}
        onClose={handleResourceMenuClose}
        onSelect={handleResourceTypeSelect}
        folderID={folderID}
      />


      {/* Resource Dialog */}
      <Dialog
        open={resourceDialogOpen}
        onClose={handleResourceDialogClose}
        maxWidth="sm"
        fullWidth
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 2,
          },
        }}
      >
        <Box sx={{ p: 2 }}>
          <DialogContent>
            {selectedResourceType && (
              <UploadResource 
                resourceType={selectedResourceType} 
                folderID={folderID} 
              />
            )}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleResourceDialogClose} color="error">
              Cancel
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

SidebarContent.propTypes = {
  isExpanded: PropTypes.bool,
  mobileMode: PropTypes.bool
};

export default SidebarContent;
