import React, { useState, useContext } from "react";
import { Link, useLocation } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

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

// Additional Imports for Menu and Icons
import IconButton from "@mui/material/IconButton";
import MoreVertIcon from "@mui/icons-material/MoreVert";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

// Imports for Snackbar
import Snackbar from "@mui/material/Snackbar";
import MuiAlertComponent from "@mui/material/Alert";

// Create Alert component for Snackbar
const AlertSnackbar = React.forwardRef(function Alert(props, ref) {
  return <MuiAlertComponent elevation={6} ref={ref} variant="filled" {...props} />;
});

// Styled Sidebar Container
const SidebarContainer = styled(Box)(({ theme }) => ({
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  overflowY: "auto",
  height: "100%", // Ensure the sidebar takes full height
}));

const Sidebar = () => {
  const {
    flashcardSessions,
    loadingSessions,
    flashcardError,
    deleteFlashcardSession,
  } = useContext(UserContext);
  const location = useLocation();
  const theme = useTheme();

  // Function to extract session ID from the current path
  const getActiveSessionId = () => {
    const match = location.pathname.match(/^\/flashcards\/([a-fA-F0-9]{24})$/);
    return match ? match[1] : null;
  };

  const activeSessionId = getActiveSessionId();

  // State for Menu
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const menuOpen = Boolean(anchorEl);

  // State for Confirmation Dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // State for Snackbar Notifications
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success"); // 'success' or 'error'

  // State for Hover Tracking
  const [hoveredSessionId, setHoveredSessionId] = useState(null); // Track the hovered session

  // New state to track the session to delete
  const [sessionToDelete, setSessionToDelete] = useState(null);

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
  const handleDialogOpen = () => {
    setSessionToDelete(selectedSessionId);
    setDialogOpen(true);
    handleMenuClose(); // Close the menu after setting the session to delete
  };

  /**
   * Closes the confirmation dialog.
   */
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSessionToDelete(null);
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
      setSnackbarMessage(`Error deleting study session: ${error.message}`);
      setSnackbarSeverity("error");
      setSnackbarOpen(true);
    } finally {
      handleDialogClose();
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
        ) : flashcardSessions.length === 0 ? (
          <ListItem>
            <Typography variant="subtitle1" color="text.secondary">
              No Study Sessions Found
            </Typography>
          </ListItem>
        ) : (
          <>
            {flashcardSessions.map((session) => {
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
                      sx={{
                        mr: 1,
                        ml: 1,
                        borderRadius: 3,
                        backgroundColor: isActive
                          ? theme.palette.action.selected
                          : "transparent",
                        "&.Mui-selected": {
                          backgroundColor: theme.palette.action.selected,
                        },
                        "&:hover": {
                          backgroundColor: theme.palette.action.selected,
                        },
                        transition: theme.transitions.create(
                          ["background-color"],
                          {
                            duration: theme.transitions.duration.standard,
                          }
                        ),
                        // Remove text color change on hover
                        color: "inherit",
                        "& .MuiListItemText-root": {
                          color: "inherit",
                        },
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between", // To position text and button
                      }}
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
                          <MoreVertIcon />
                        </IconButton>
                      )}
                    </ListItemButton>
                  </ListItem>
                </React.Fragment>
              );
            })}
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
        <MenuItem onClick={handleDialogOpen}>Delete</MenuItem>
        {/* You can add more menu items here, such as "Edit" */}
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="confirm-delete-dialog"
      >
        <DialogTitle id="confirm-delete-dialog">Delete Study Session</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this study session? This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteSession} color="error">
            Delete
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
