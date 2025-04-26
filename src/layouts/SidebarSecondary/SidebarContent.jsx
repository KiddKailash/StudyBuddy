import React, { useContext, useState, useEffect, useRef } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PropTypes from "prop-types";

// Contexts
import { UserContext } from "../../contexts/User";

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

// Local Components
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import MoveDialog from "./MoveDialog";
import ResourceTypeMenu from "../../components/ResourceTypeMenu";
import UploadFile from "../../components/UploadFile";
import UploadResource from "../../pages/UploadResource";

// MUI Icons
import HomeRoundedIcon from "@mui/icons-material/HomeRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import FileUploadRoundedIcon from "@mui/icons-material/FileUploadRounded";

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
const SidebarContent = ({ isExpanded, mobileMode }) => {
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

  // Filter resources by the current folder
  // Need to handle different folderID formats: undefined, "null", actual ID
  const isNullFolder = folderID === "null" || folderID === undefined;

  const filteredFlashcards = isNullFolder
    ? flashcardSessions.filter((s) => !s.folderID || s.folderID === "null")
    : flashcardSessions.filter((s) => s.folderID === folderID);

  const filteredMcqs = isNullFolder
    ? multipleChoiceQuizzes.filter((q) => !q.folderID || q.folderID === "null")
    : multipleChoiceQuizzes.filter((q) => q.folderID === folderID);

  const filteredSummaries = isNullFolder
    ? summaries.filter((s) => !s.folderID || s.folderID === "null")
    : summaries.filter((s) => s.folderID === folderID);

  const filteredAiChats = isNullFolder
    ? aiChats.filter((c) => !c.folderID || c.folderID === "null")
    : aiChats.filter((c) => c.folderID === folderID);

  // For debugging
  console.log("folderID:", folderID);
  console.log("Total flashcards:", flashcardSessions.length);
  console.log("Filtered flashcards:", filteredFlashcards.length);

  // Guard: show loader if resources aren't loaded yet
  if (!flashcardSessions || !multipleChoiceQuizzes || !summaries || !aiChats) {
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
  const handleMoveConfirm = () => {
    const newFolderId = selectedFolderId === "null" ? null : selectedFolderId;

    try {
      switch (selectedItemType) {
        case "flashcard":
          assignSessionToFolder(selectedItem, newFolderId);
          break;
        case "quiz":
          assignQuizToFolder(selectedItem, newFolderId);
          break;
        case "summary":
          assignSummaryToFolder(selectedItem, newFolderId);
          break;
        case "chat":
          assignAiChatToFolder(selectedItem, newFolderId);
          break;
        default:
          break;
      }
      
      // If the item is being moved out of the current folder,
      // navigate to the corresponding new folder
      if (folderID !== newFolderId && folderID !== "null") {
        const folderId = newFolderId || "null";
        
        // Navigate to the appropriate page based on the item type
        switch (selectedItemType) {
          case "flashcard":
            navigate(`/${folderId}/flashcards/${selectedItem}`);
            break;
          case "quiz":
            navigate(`/${folderId}/mcq/${selectedItem}`);
            break;
          case "summary":
            navigate(`/${folderId}/summary/${selectedItem}`);
            break;
          case "chat":
            navigate(`/${folderId}/chat/${selectedItem}`);
            break;
          default:
            // Just navigate to the folder if we don't know the type
            navigate(`/${folderId}`);
            break;
        }
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
            onClick={() => handleNavigate(`/${folderID}/create`)}
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
              isActive={activePath === `/${folderID}/flashcards/${s.id}`}
              onClick={() => handleNavigate(`/${folderID}/flashcards/${s.id}`)}
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
              isActive={activePath === `/${folderID}/mcq/${q.id}`}
              onClick={() => handleNavigate(`/${folderID}/mcq/${q.id}`)}
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
              isActive={activePath === `/${folderID}/summary/${summary.id}`}
              onClick={() =>
                handleNavigate(`/${folderID}/summary/${summary.id}`)
              }
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
              isActive={activePath === `/${folderID}/chat/${chat.id}`}
              onClick={() => handleNavigate(`/${folderID}/chat/${chat.id}`)}
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

      {/* Upload File Dialog */}
      <UploadFile
        open={uploadDialogOpen}
        onClose={handleCloseUploadDialog}
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
  mobileMode: PropTypes.bool,
};

SidebarContent.defaultProps = {
  isExpanded: true,
  mobileMode: false,
};

export default SidebarContent;
