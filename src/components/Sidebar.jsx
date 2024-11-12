import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";
import { useNavigate } from "react-router-dom";

// MUI Component Imports
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";
import { styled } from "@mui/material/styles";
import { useTheme } from "@mui/material/styles";
import IconButton from "@mui/material/IconButton";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Snackbar from "@mui/material/Snackbar";
import MuiAlertComponent from "@mui/material/Alert";

// MUI Icon Imports
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

// Create Alert component for Snackbar
const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return (
    <MuiAlertComponent elevation={6} ref={ref} variant="filled" {...props} />
  );
});

// Styled Sidebar Container
const SidebarContainer = styled(Box)(({ theme }) => ({
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  overflowY: "auto",
  height: "100%", // Ensure the sidebar takes full height
  padding: theme.spacing(2), // Add some padding
}));

const Sidebar = () => {
  const {
    flashcardSessions,
    loadingSessions,
    flashcardError,
    deleteFlashcardSession,
    updateFlashcardSessionName,
  } = useContext(UserContext);
  const location = useLocation();
  const theme = useTheme();
  const navigate = useNavigate();

  // Function to extract session ID from the current path
  const getActiveSessionId = () => {
    const match = location.pathname.match(/^\/flashcards\/([a-fA-F0-9]{24})$/);
    return match ? match[1] : null;
  };

  const activeSessionId = getActiveSessionId();

  // Determine if the current path is '/'
  const isCreateSessionActive = location.pathname === "/";

  // State for Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // State for Confirmation Dialog (Delete)
  const [dialogOpen, setDialogOpen] = useState(false);

  // State for Rename Dialog
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  // State for Snackbar Notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' or 'error'

  // State for Hover Tracking
  const [hoveredSessionId, setHoveredSessionId] = useState(null); // Track the hovered session

  // New states to track the session to delete or rename
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [sessionToRename, setSessionToRename] = useState(null);

  /**
   * Reusable styles object for buttons
   * @param {object} theme - MUI theme object
   * @param {boolean} isActive - Indicates if the button is active
   * @returns {object} - Styles object
   */
  const commonButtonStyles = (theme, isActive = false) => ({
    mr: 0.5,
    ml: 0.5,
    borderRadius: 3,
    backgroundColor: isActive ? theme.palette.action.selected : "transparent",
    "&.Mui-selected": {
      backgroundColor: theme.palette.action.selected,
    },
    "&:hover": {
      backgroundColor: theme.palette.action.selected,
    },
    transition: theme.transitions.create(["background-color"], {
      duration: theme.transitions.duration.standard,
    }),
    color: "inherit",
    "& .MuiListItemText-root": {
      color: "inherit",
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  /**
   * Opens the dropdown menu for a specific session.
   *
   * @param {Event} event - The click event.
   * @param {string} sessionId - The ID of the session.
   */
  const handleMenuOpen = (event, sessionId) => {
    setAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  /**
   * Closes the dropdown menu.
   */
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSessionId(null);
  };

  /**
   * Opens the confirmation dialog for deletion.
   */
  const handleDeleteDialogOpen = () => {
    setSessionToDelete(selectedSessionId);
    setDialogOpen(true);
    handleMenuClose(); // Close the menu after setting the session to delete
  };

  /**
   * Closes the confirmation dialog.
   */
  const handleDeleteDialogClose = () => {
    setDialogOpen(false);
    setSessionToDelete(null);
  };

  /**
   * Opens the rename dialog.
   */
  const handleRenameDialogOpen = () => {
    setSessionToRename(selectedSessionId);
    setRenameDialogOpen(true);
    handleMenuClose(); // Close the menu after setting the session to rename
  };

  /**
   * Closes the rename dialog.
   */
  const handleRenameDialogClose = () => {
    setRenameDialogOpen(false);
    setSessionToRename(null);
    setNewSessionName("");
  };

  /**
   * Handles the deletion of a study session.
   */
  const handleDeleteSession = async () => {
    console.log(`StudySessionID: ${sessionToDelete}`);
    if (!sessionToDelete) return;

    try {
      await deleteFlashcardSession(sessionToDelete);
      setSnackbarMessage("Study session deleted successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error deleting study session:", error);
      setSnackbarMessage(
        `Error deleting study session: ${
          error.response?.data?.error || error.message
        }`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      navigate("/"); // Navigate to '/' after deletion
      handleDeleteDialogClose();
    }
  };

  /**
   * Handles the renaming of a study session.
   */
  const handleRenameSession = async () => {
    if (!sessionToRename || !newSessionName.trim()) {
      setSnackbarMessage("Please enter a valid session name.");
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
      return;
    }

    try {
      await updateFlashcardSessionName(sessionToRename, newSessionName.trim());
      setSnackbarMessage("Study session renamed successfully.");
      setSnackbarSeverity("success");
      setSnackbarOpen(true);
    } catch (error) {
      console.error("Error renaming study session:", error);
      setSnackbarMessage(
        `Error renaming study session: ${
          error.response?.data?.error || error.message
        }`
      );
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      handleRenameDialogClose();
    }
  };

  /**
   * Handles the closure of the Snackbar.
   *
   * @param {Event} event - The close event.
   * @param {string} reason - The reason for closing.
   */
  const handleSnackbarClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <SidebarContainer>
      <List component="nav">
        {loadingSessions ? (
          <ListItem sx={{ justifyContent: "center" }}>
            <CircularProgress color="inherit" />
          </ListItem>
        ) : flashcardError ? (
          <ListItem>
            <Alert severity="error" sx={{ width: "100%" }}>
              {flashcardError}
            </Alert>
          </ListItem>
        ) : (
          <>
            {/* Create A Study Session Button */}
            <ListItem disablePadding>
              <ListItemButton
                component={Link}
                to={`/`}
                selected={isCreateSessionActive} // Set selected based on current path
                sx={(theme) => commonButtonStyles(theme, isCreateSessionActive)} // Pass isActive to styles
              >
                <ListItemText
                  primary="Create study session"
                  primaryTypographyProps={{
                    variant: "subtitle2",
                  }}
                />
                <AddRoundedIcon
                  sx={{ ml: 1, color: theme.palette.text.secondary }}
                />
              </ListItemButton>
            </ListItem>

            {/* Render Study Sessions */}
            {flashcardSessions.length === 0 ? (
              <ListItem>
                <Typography variant="subtitle1" color="text.secondary">
                </Typography>
              </ListItem>
            ) : (
              flashcardSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                const isHovered = session.id === hoveredSessionId;
                const showOptions = isActive || isHovered;

                return (
                  <React.Fragment key={session.id}>
                    <ListItem
                      disablePadding
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                    >
                      <ListItemButton
                        component={Link}
                        to={`/flashcards/${session.id}`}
                        selected={isActive}
                        sx={(theme) => commonButtonStyles(theme, isActive)}
                      >
                        <ListItemText
                          primary={session.studySession}
                          primaryTypographyProps={{
                            variant: "subtitle2",
                          }}
                        />
                        {/* Three Dots IconButton */}
                        {showOptions && (
                          <IconButton
                            edge="end"
                            aria-label="options"
                            onClick={(e) => handleMenuOpen(e, session.id)}
                            sx={{
                              color: theme.palette.text.secondary,
                            }}
                          >
                            <MoreVertRoundedIcon />
                          </IconButton>
                        )}
                      </ListItemButton>
                    </ListItem>
                  </React.Fragment>
                );
              })
            )}
          </>
        )}
      </List>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
        transformOrigin={{
          vertical: "top",
          horizontal: "right",
        }}
      >
        <MenuItem onClick={handleDeleteDialogOpen}>
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={handleRenameDialogOpen}>
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog for Deletion */}
      <Dialog
        open={dialogOpen}
        onClose={handleDeleteDialogClose}
        aria-labelledby="confirm-delete-dialog"
        sx={{ textAlign: "center" }}
      >
        <DialogContent>
          <DialogTitle>Delete study session</DialogTitle>
          <DialogContentText>
            Are you sure you want to delete this study session?
          </DialogContentText>
          <DialogContentText>This cannot be undone.</DialogContentText>
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center", // Center the buttons horizontally
          }}
        >
          <Button onClick={handleDeleteDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSession} color="error">
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Confirmation Dialog for Renaming */}
      <Dialog
        open={renameDialogOpen}
        onClose={handleRenameDialogClose}
        aria-labelledby="rename-dialog-title"
        sx={{ textAlign: "center" }}
      >
        <DialogTitle id="rename-dialog-title">Rename Study Session</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="New Session Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
          />
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center", // Center the buttons horizontally
          }}
        >
          <Button onClick={handleRenameDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleRenameSession} color="primary">
            Rename
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for Notifications */}
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
      >
        <AlertSnackbar
          onClose={handleSnackbarClose}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </AlertSnackbar>
      </Snackbar>
    </SidebarContainer>
  );
};

export default Sidebar;
