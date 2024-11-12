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
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";

const SidebarContainer = styled(Box)(({ theme }) => ({
  bgcolor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  overflowY: "auto",
  height: "100%",
}));

const Sidebar = () => {
  const { flashcardSessions, loadingSessions, flashcardError, deleteFlashcardSession } =
    useContext(UserContext);
  const location = useLocation();
  const theme = useTheme();

  // Function to extract session ID from the current path
  const getActiveSessionId = () => {
    const match = location.pathname.match(/^\/flashcards\/([a-fA-F0-9]{24})$/);
    return match ? match[1] : null;
  };

  const activeSessionId = getActiveSessionId();

  // State for Menu and hover
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);
  const [hoveredSessionId, setHoveredSessionId] = useState(null); // Track the hovered item
  const menuOpen = Boolean(anchorEl);

  // State for Confirmation Dialog
  const [dialogOpen, setDialogOpen] = useState(false);

  // Handle Menu Open
  const handleMenuOpen = (event, sessionId) => {
    setAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  // Handle Menu Close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedSessionId(null);
  };

  // Handle Dialog Open
  const handleDialogOpen = () => {
    setDialogOpen(true);
    handleMenuClose();
  };

  // Handle Dialog Close
  const handleDialogClose = () => {
    setDialogOpen(false);
    setSelectedSessionId(null);
  };

  // Handle Deletion of Study Session
  const handleDeleteSession = async () => {
    if (selectedSessionId) {
      await deleteFlashcardSession(selectedSessionId);
    }
    handleDialogClose();
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
              return (
                <React.Fragment key={session.id}>
                  <ListItem disablePadding>
                    <ListItemButton
                      component={Link}
                      to={`/flashcards/${session.id}`}
                      selected={isActive}
                      onMouseEnter={() => setHoveredSessionId(session.id)}
                      onMouseLeave={() => setHoveredSessionId(null)}
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
                      }}
                    >
                      <ListItemText
                        primary={session.studySession}
                        primaryTypographyProps={{
                          variant: "subtitle2",
                        }}
                      />
                      {(isActive || hoveredSessionId === session.id) && (
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
      </Menu>

      {/* Confirmation Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="confirm-delete-dialog"
      >
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
    </SidebarContainer>
  );
};

export default Sidebar;
