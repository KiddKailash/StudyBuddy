// src/components/Sidebar.jsx
import React, { useState, useContext } from "react";
import { useLocation, Link } from "react-router-dom";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import PropTypes from "prop-types";

// MUI Component Imports
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar"; // Import Toolbar for spacing
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import IconButton from "@mui/material/IconButton";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

// MUI Icon Imports
import MoreVertRoundedIcon from "@mui/icons-material/MoreVertRounded";
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

// Context Imports
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext"; // Import SnackbarContext
import { useNavigate } from "react-router-dom";

/**
 * Sidebar component that displays study sessions and handles session operations.
 *
 * @param {object} props - Component props.
 * @param {boolean} props.mobileOpen - Indicates if the mobile drawer is open.
 * @param {function} props.handleDrawerToggle - Function to toggle the drawer.
 * @param {string} props.drawerWidth - Width of the drawer.
 * @param {string} props.menubarHeight - Height of the menu bar.
 * @returns {JSX.Element} The Sidebar component.
 */
const Sidebar = ({
  mobileOpen,
  handleDrawerToggle,
  drawerWidth,
  menubarHeight,
}) => {
  const theme = useTheme();
  const location = useLocation();
  const navigate = useNavigate();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const {
    flashcardSessions,
    loadingSessions,
    flashcardError,
    deleteFlashcardSession,
    updateFlashcardSessionName,
  } = useContext(UserContext);

  // Access the Snackbar context
  const { showSnackbar } = useContext(SnackbarContext);

  // State Variables for Menu and Dialogs
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const menuOpen = Boolean(anchorEl);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [renameDialogOpen, setRenameDialogOpen] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");

  const [hoveredSessionId, setHoveredSessionId] = useState(null);
  const [sessionToDelete, setSessionToDelete] = useState(null);
  const [sessionToRename, setSessionToRename] = useState(null);

  // Function to extract session ID from the current path
  const getActiveSessionId = () => {
    const match = location.pathname.match(/^\/flashcards\/([a-fA-F0-9]{24})$/);
    return match ? match[1] : null;
  };

  const activeSessionId = getActiveSessionId();
  const isCreateSessionActive = location.pathname === "/";

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
    event.stopPropagation();
    event.preventDefault();
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
    handleMenuClose();
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
    handleMenuClose();
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
    if (!sessionToDelete) return;

    try {
      await deleteFlashcardSession(sessionToDelete);
      showSnackbar("Study session deleted successfully.", "success"); // Use context
      navigate("/");
    } catch (error) {
      console.error("Error deleting study session:", error);
      showSnackbar(
        `Error deleting study session: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      ); // Use context
    } finally {
      handleDeleteDialogClose();
    }
  };

  /**
   * Handles the renaming of a study session.
   */
  const handleRenameSession = async () => {
    if (!sessionToRename || !newSessionName.trim()) {
      showSnackbar("Please enter a valid session name.", "error"); // Use context
      return;
    }

    try {
      await updateFlashcardSessionName(sessionToRename, newSessionName.trim());
      showSnackbar("Study session renamed successfully.", "success"); // Use context
    } catch (error) {
      console.error("Error renaming study session:", error);
      showSnackbar(
        `Error renaming study session: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      ); // Use context
    } finally {
      handleRenameDialogClose();
    }
  };

  // Remove local Snackbar state and handlers
  // const [snackbarOpen, setSnackbarOpen] = useState(false);
  // const [snackbarMessage, setSnackbarMessage] = useState("");
  // const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  /**
   * Handles the closure of the Snackbar.
   *
   * @param {Event} event - The close event.
   * @param {string} reason - The reason for closing.
   */
  // const handleSnackbarClose = (event, reason) => {
  //   if (reason === "clickaway") {
  //     return;
  //   }
  //   setSnackbarOpen(false);
  // };

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      {/* Add Toolbar to offset content below AppBar */}
      <Toolbar />
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
            <ListItem disablePadding key="create-session">
              <ListItemButton
                component={Link}
                to={`/`}
                selected={isCreateSessionActive}
                sx={(theme) => commonButtonStyles(theme, isCreateSessionActive)}
                onClick={isMobile ? handleDrawerToggle : undefined} // Close drawer on mobile
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
            {flashcardSessions.length === 0
              ? null
              : flashcardSessions.map((session) => {
                  const isActive = session.id === activeSessionId;
                  const isHovered = session.id === hoveredSessionId;
                  const showOptions = isActive || isHovered;

                  return (
                    <ListItem
                      disablePadding
                      key={session.id}
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
                    >
                      <ListItemButton
                        component={Link}
                        to={`/flashcards/${session.id}`}
                        selected={isActive}
                        sx={(theme) => commonButtonStyles(theme, isActive)}
                        onClick={isMobile ? handleDrawerToggle : undefined} // Close drawer on mobile
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
            justifyContent: "center",
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
            justifyContent: "center",
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
    </Box>
  );

  return (
    <Box
      component="nav"
      sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
    >
      {/* Mobile Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile.
        }}
        sx={{
          display: { xs: "block", sm: "none" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Desktop Permanent Drawer */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            boxSizing: "border-box",
            width: drawerWidth,
            height: `calc(100% - ${menubarHeight}px)`, // Adjust height
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>
    </Box>
  );
};

Sidebar.propTypes = {
  mobileOpen: PropTypes.bool.isRequired, // Indicates if the mobile drawer is open
  handleDrawerToggle: PropTypes.func.isRequired, // Function to toggle the drawer
  drawerWidth: PropTypes.string.isRequired, // Width of the drawer in pixels
  menubarHeight: PropTypes.string.isRequired, // Height of the menu bar in pixels
};

export default Sidebar;
