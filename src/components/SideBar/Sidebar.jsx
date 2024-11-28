import React, { useState, useContext, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import SessionItem from "./SessionItem";

// Context Imports
import { UserContext } from "../../contexts/UserContext";
import { SnackbarContext } from "../../contexts/SnackbarContext";

// MUI Component Imports
import Box from "@mui/material/Box";
import Drawer from "@mui/material/Drawer";
import Toolbar from "@mui/material/Toolbar";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import CircularProgress from "@mui/material/CircularProgress";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

// MUI Icon Imports
import AddRoundedIcon from "@mui/icons-material/AddRounded";

// Import jsPDF
import jsPDF from "jspdf";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

// Import the newly created components
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";

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

  const { t } = useTranslation();

  const {
    flashcardSessions,
    loadingSessions,
    flashcardError,
    deleteFlashcardSession,
    updateFlashcardSessionName,
    getFlashcardSessionById,
  } = useContext(UserContext);

  const { showSnackbar } = useContext(SnackbarContext);

  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [selectedSessionId, setSelectedSessionId] = useState(null);

  const [dialogState, setDialogState] = useState({
    type: null,
    open: false,
    sessionId: null,
  });

  const [newSessionName, setNewSessionName] = useState("");

  const getActiveSessionId = () => {
    const match = location.pathname.match(/^\/flashcards\/([a-fA-F0-9]{24})$/);
    return match ? match[1] : null;
  };

  const activeSessionId = getActiveSessionId();
  const isCreateSessionActive = location.pathname === "/";

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
    color: "text.primary",
    "& .MuiListItemText-root": {
      color: "text.primary",
    },
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  });

  const handleMenuOpen = (event, sessionId) => {
    event.stopPropagation();
    event.preventDefault();
    setMenuAnchorEl(event.currentTarget);
    setSelectedSessionId(sessionId);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setSelectedSessionId(null);
  };

  const handleDialogOpen = (type) => {
    setDialogState({
      type,
      open: true,
      sessionId: selectedSessionId,
    });
    handleMenuClose();
  };

  const handleDialogClose = () => {
    setDialogState({
      type: null,
      open: false,
      sessionId: null,
    });
    setNewSessionName("");
  };

  const handleDeleteSession = async () => {
    const { sessionId } = dialogState;
    if (!sessionId) return;

    try {
      await deleteFlashcardSession(sessionId);
      showSnackbar(t("study_session_deleted_success"), "success");
      navigate("/");
    } catch (error) {
      console.error("Error deleting study session:", error);
      showSnackbar(
        t("error_deleting_study_session", {
          error: error.response?.data?.error || error.message,
        }),
        "error"
      );
    } finally {
      handleDialogClose();
    }
  };

  const handleRenameSession = async () => {
    const { sessionId } = dialogState;
    if (!sessionId || !newSessionName.trim()) {
      showSnackbar(t("please_enter_valid_session_name"), "error");
      return;
    }

    try {
      await updateFlashcardSessionName(sessionId, newSessionName.trim());
      showSnackbar(t("study_session_renamed_success"), "success");
    } catch (error) {
      console.error("Error renaming study session:", error);
      showSnackbar(
        t("error_renaming_study_session", {
          error: error.response?.data?.error || error.message,
        }),
        "error"
      );
    } finally {
      handleDialogClose();
    }
  };

  const handlePrintSession = async () => {
    const sessionId = selectedSessionId;
    if (!sessionId) return;

    try {
      const session = await getFlashcardSessionById(sessionId);
      if (!session) {
        showSnackbar(t("failed_to_retrieve_session"), "error");
        return;
      }

      const flashcards = session.flashcardsJSON;

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const pageHeight = doc.internal.pageSize.getHeight();

      const cardWidth = pageWidth / 2 - 20;
      const cardHeight = pageHeight / 4 - 20;

      const xOffset = 10;
      const yOffset = 10;
      const xSpacing = 10;
      const ySpacing = 10;

      const cardsPerRow = 2;
      const cardsPerColumn = 4;
      const cardsPerPage = cardsPerRow * cardsPerColumn;

      for (
        let pageIndex = 0;
        pageIndex < Math.ceil(flashcards.length / cardsPerPage);
        pageIndex++
      ) {
        if (pageIndex !== 0) {
          doc.addPage();
        }

        for (let cardIndex = 0; cardIndex < cardsPerPage; cardIndex++) {
          const index = pageIndex * cardsPerPage + cardIndex;
          if (index >= flashcards.length) break;
          const card = flashcards[index];

          const row = Math.floor(cardIndex / cardsPerRow);
          const col = cardIndex % cardsPerRow;

          const x = xOffset + col * (cardWidth + xSpacing);
          const y = yOffset + row * (cardHeight + ySpacing);

          doc.rect(x, y, cardWidth, cardHeight);

          doc.setFontSize(12);
          doc.text(card.question || "", x + 5, y + 10, {
            maxWidth: cardWidth - 10,
          });
        }
      }

      for (
        let pageIndex = 0;
        pageIndex < Math.ceil(flashcards.length / cardsPerPage);
        pageIndex++
      ) {
        doc.addPage();

        for (let cardIndex = 0; cardIndex < cardsPerPage; cardIndex++) {
          const index = pageIndex * cardsPerPage + cardIndex;
          if (index >= flashcards.length) break;
          const card = flashcards[index];

          const row = Math.floor(cardIndex / cardsPerRow);
          const col = cardIndex % cardsPerRow;

          const x = xOffset + col * (cardWidth + xSpacing);
          const y = yOffset + row * (cardHeight + ySpacing);

          doc.rect(x, y, cardWidth, cardHeight);

          doc.setFontSize(12);
          doc.text(card.answer || "", x + 5, y + 10, {
            maxWidth: cardWidth - 10,
          });
        }
      }

      doc.save(`${session.studySession}.pdf`);
    } catch (error) {
      console.error("Error printing session:", error);
      showSnackbar(
        t("error_printing_session", {
          error: error.response?.data?.error || error.message,
        }),
        "error"
      );
    }
  };

  useEffect(() => {
    if (flashcardError) {
      showSnackbar(
        t("error_loading_study_sessions", { error: flashcardError }),
        "error"
      );
    }
  }, [flashcardError, showSnackbar, t]);

  const drawerContent = (
    <Box sx={{ width: drawerWidth }}>
      <Toolbar />
      <List component="nav">
        {loadingSessions ? (
          <ListItem sx={{ justifyContent: "center" }}>
            <CircularProgress color="inherit" />
          </ListItem>
        ) : (
          <>
            <ListItem disablePadding key="create-session">
              <ListItemButton
                component={Link}
                to="/"
                selected={isCreateSessionActive}
                sx={(theme) => commonButtonStyles(theme, isCreateSessionActive)}
                onClick={isMobile ? handleDrawerToggle : undefined}
              >
                <ListItemText
                  primary={t("create_study_session")}
                  primaryTypographyProps={{
                    variant: "subtitle2",
                  }}
                />
                <AddRoundedIcon
                  sx={{ color: theme.palette.text.secondary }}
                />
              </ListItemButton>
            </ListItem>

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

      <DropdownMenu
        anchorEl={menuAnchorEl}
        isOpen={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onDeleteClick={() => handleDialogOpen("delete")}
        onRenameClick={() => handleDialogOpen("rename")}
        onPrintClick={handlePrintSession}
        t={t}
      />

      <ConfirmationDialog
        open={dialogState.open}
        type={dialogState.type}
        onClose={handleDialogClose}
        onConfirm={
          dialogState.type === "delete"
            ? handleDeleteSession
            : handleRenameSession
        }
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        t={t}
      />
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
          keepMounted: true,
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
            width: drawerWidth,
            height: `calc(100% - ${menubarHeight}px)`,
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
  mobileOpen: PropTypes.bool.isRequired,
  handleDrawerToggle: PropTypes.func.isRequired,
  drawerWidth: PropTypes.string.isRequired,
  menubarHeight: PropTypes.string.isRequired,
};

export default Sidebar;
