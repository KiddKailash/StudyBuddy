import React, { useState, useContext, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SessionItem from "./SessionItem";

// Context Imports
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";

// MUI Component Imports
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// MUI Icon Imports
import AddRoundedIcon from "@mui/icons-material/AddRounded";
import DeleteRoundedIcon from "@mui/icons-material/DeleteRounded";
import EditRoundedIcon from "@mui/icons-material/EditRounded";

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
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const isMenuOpen = Boolean(menuAnchorEl);

  const [dialogState, setDialogState] = useState({
    type: null, // 'delete' or 'rename'
    open: false,
    sessionId: null,
  });

  const [newSessionName, setNewSessionName] = useState("");

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
    backgroundColor: isActive
      ? theme.palette.action.selected
      : "transparent",
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
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  /**
   * Closes the dropdown menu.
   */
  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
  };

  /**
   * Opens a dialog based on the action type ('delete' or 'rename').
   *
   * @param {string} type - The type of dialog to open.
   */
  const handleDialogOpen = (type) => {
    setDialogState({
      type,
      open: true,
      sessionId: selectedSessionId,
    });
    handleMenuClose();
  };

  /**
   * Closes the dialog.
   */
  const handleDialogClose = () => {
    setDialogState({
      type: null,
      open: false,
      sessionId: null,
    });
    setNewSessionName("");
  };

  /**
   * Handles the deletion of a study session.
   */
  const handleDeleteSession = async () => {
    const { sessionId } = dialogState;
    if (!sessionId) return;

    try {
      await deleteFlashcardSession(sessionId);
      showSnackbar("Study session deleted successfully.", "success");
      navigate("/");
    } catch (error) {
      console.error("Error deleting study session:", error);
      showSnackbar(
        `Error deleting study session: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      );
    } finally {
      handleDialogClose();
    }
  };

  /**
   * Handles the renaming of a study session.
   */
  const handleRenameSession = async () => {
    const { sessionId } = dialogState;
    if (!sessionId || !newSessionName.trim()) {
      showSnackbar("Please enter a valid session name.", "error");
      return;
    }

    try {
      await updateFlashcardSessionName(sessionId, newSessionName.trim());
      showSnackbar("Study session renamed successfully.", "success");
    } catch (error) {
      console.error("Error renaming study session:", error);
      showSnackbar(
        `Error renaming study session: ${
          error.response?.data?.error || error.message
        }`,
        "error"
      );
    } finally {
      handleDialogClose();
    }
  };

  /**
   * useEffect hook to handle flashcardError by showing a Snackbar.
   */
  useEffect(() => {
    if (flashcardError) {
      showSnackbar(`Error loading study sessions: ${flashcardError}`, "error");
    }
  }, [flashcardError, showSnackbar]);

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      {/* Add Toolbar to offset content below AppBar */}
      <Toolbar />
      <List component="nav">
        {loadingSessions ? (
          <ListItem sx={{ justifyContent: "center" }}>
            <CircularProgress color="inherit" />
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
            {flashcardSessions.length > 0 &&
              flashcardSessions.map((session) => {
                const isActive = session.id === activeSessionId;
                return (
                  <SessionItem
                    key={session.id}
                    session={session}
                    isActive={isActive}
                    handleMenuOpen={handleMenuOpen}
                    commonButtonStyles={commonButtonStyles}
                  />
                );
              })}
          </>
        )}
      </List>

      {/* Dropdown Menu */}
      <Menu
        anchorEl={menuAnchorEl}
        open={isMenuOpen}
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
        <MenuItem onClick={() => handleDialogOpen("delete")}>
          <DeleteRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Delete
        </MenuItem>
        <MenuItem onClick={() => handleDialogOpen("rename")}>
          <EditRoundedIcon fontSize="small" sx={{ mr: 1 }} />
          Rename
        </MenuItem>
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogState.open}
        onClose={handleDialogClose}
        aria-labelledby="confirm-dialog-title"
        sx={{ textAlign: "center" }}
      >
        <DialogTitle id="confirm-dialog-title">
          {dialogState.type === "delete"
            ? "Delete Study Session"
            : "Rename Study Session"}
        </DialogTitle>
        <DialogContent>
          <DialogContentText>
            {dialogState.type === "delete"
              ? "Are you sure you want to delete this study session? This action cannot be undone."
              : "Enter the new name for the study session."}
          </DialogContentText>
          {dialogState.type === "rename" && (
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
          )}
        </DialogContent>
        <DialogActions
          sx={{
            justifyContent: "center",
          }}
        >
          <Button onClick={handleDialogClose} color="primary">
            Cancel
          </Button>
          <Button
            onClick={
              dialogState.type === "delete"
                ? handleDeleteSession
                : handleRenameSession
            }
            color={dialogState.type === "delete" ? "error" : "primary"}
          >
            {dialogState.type === "delete" ? "Delete" : "Rename"}
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
