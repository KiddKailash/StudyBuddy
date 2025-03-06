import React from "react";
import { Link } from "react-router-dom";
import PropTypes from "prop-types";

// MUI
import Box from "@mui/material/Box";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/Box";
import ListItemIcon from "@mui/material/ListItemIcon";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Avatar from "@mui/material/Avatar";
import useMediaQuery from "@mui/material/useMediaQuery";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";

// MUI Icons
import AddRoundedIcon from '@mui/icons-material/AddRounded';

import useSidebar from "./sidebarUtils";
import SessionItem from "./SessionItem";
import DropdownMenu from "./DropdownMenu";
import ConfirmationDialog from "./ConfirmationDialog";
import RequestFeature from "../../components/RequestFeature/RequestFeature";

/**
 * Renders sidebar content:
 *  - Branding
 *  - "Create Session" button (icon + text)
 *  - Flashcards / Summaries / Quizzes / etc. sections
 *  - Each session mapped out with SessionItem
 * 
 * If 'isExpanded' is false, we only show icons + tooltips (except for the <Typography> headings).
 */
const SidebarContent = ({ isExpanded }) => {
  const {
    theme,
    t,
    location,
    flashcardSessions,
    localSessions,
    loadingSessions,
    multipleChoiceQuizzes,
    summaries,
    aiChats,
    isCreateSessionActive,
    menuAnchorEl,
    dialogState,
    newSessionName,
    setNewSessionName,
    handleMenuOpen,
    handleMenuClose,
    handleDialogOpen,
    handleDialogClose,
    handleConfirmAction,
  } = useSidebar();

  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // Conditionally render Icon + text, or just Icon (with tooltip), for an item
  const renderItemWithIcon = (IconComponent, text, toLink, selected) => {
    return (
      <ListItem disablePadding>
        <ListItemButton
          component={Link}
          to={toLink}
          selected={selected}
          sx={(themeParam) => ({
            mr: 1,
            ml: 1,
            borderRadius: 3,
            backgroundColor: selected
              ? themeParam.palette.action.selected
              : "transparent",
            "&.Mui-selected": {
              backgroundColor: themeParam.palette.action.selected,
            },
            "&:hover": {
              backgroundColor: themeParam.palette.action.selected,
            },
            color: "text.primary",
            display: "flex",
            alignItems: "center",
            gap: 1, // space between icon & text if expanded
          })}
        >
          {/* If collapsed => just icon w/ tooltip; if expanded => icon + text */}
          {isExpanded ? (
            <>
              <IconComponent />
              <Typography variant="body1" sx={{ fontWeight: 600 }}>
                {text}
              </Typography>
            </>
          ) : (
            <Tooltip title={text} placement="right">
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <IconComponent />
              </Box>
            </Tooltip>
          )}
        </ListItemButton>
      </ListItem>
    );
  };

  const drawerContent = (
    <List component="nav">
      {/* Show spinner if loading */}
      {loadingSessions ? (
        <ListItem sx={{ justifyContent: "center" }}>
          <CircularProgress color="inherit" />
        </ListItem>
      ) : (
        <>
          {/* 1) Branding (Avatar + "StudyBuddy.ai") */}
          <ListItem key="StudyBuddy">
            <ListItemIcon>
              <Avatar src="/assets/flashcards.png" alt="Study Buddy Icon" />
            </ListItemIcon>
            {/* The brand text is <Typography>; we do NOT hide or tooltip it. */}
            <Typography
              variant="h6"
              sx={{ fontWeight: 600, color: theme.palette.primary.main }}
            >
              StudyBuddy.ai
            </Typography>
          </ListItem>

          {/* 2) Create Session Button (icon + text if expanded, else icon + tooltip) */}
          {renderItemWithIcon(
            AddRoundedIcon,
            t("create_study_session"),
            "/create-resource",
            isCreateSessionActive
          )}

          {/* FLASHCARDS SECTION Heading (typography, unaltered) */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("flashcards")}
            </Typography>
            <Divider />
          </ListItem>

          <Box sx={{ mb: 2 }}>
            {/* Mapped flashcard sessions */}
            {flashcardSessions.map((session) => {
              const isActive = location.pathname === `/flashcards/${session.id}`;
              return (
                <SessionItem
                  key={session.id}
                  session={session}
                  resourceType="flashcard"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/flashcards/${session.id}`}
                  isExpanded={isExpanded} // pass to SessionItem
                />
              );
            })}
            {/* Mapped local sessions */}
            {localSessions.map((session) => {
              const isActive =
                location.pathname === `/flashcards-local/${session.id}`;
              return (
                <SessionItem
                  key={session.id}
                  session={session}
                  resourceType="flashcard"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/flashcards-local/${session.id}`}
                  isExpanded={isExpanded}
                />
              );
            })}
          </Box>

          {/* MULTIPLE CHOICE QUIZZES SECTION (typography heading) */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("multiple_choice_quizzes")}
            </Typography>
          </ListItem>
          <Box sx={{ mb: 2 }}>
            {multipleChoiceQuizzes.map((quiz) => {
              const isActive = location.pathname === `/mcq/${quiz.id}`;
              return (
                <SessionItem
                  key={quiz.id}
                  session={quiz}
                  resourceType="quiz"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/mcq/${quiz.id}`}
                  isExpanded={isExpanded}
                />
              );
            })}
          </Box>

          {/* SUMMARIES SECTION (typography heading) */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("summaries")}
            </Typography>
          </ListItem>
          <Box sx={{ mb: 2 }}>
            {summaries.map((summary) => {
              const isActive = location.pathname === `/summary/${summary.id}`;
              return (
                <SessionItem
                  key={summary.id}
                  session={summary}
                  resourceType="summary"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/summary/${summary.id}`}
                  isExpanded={isExpanded}
                />
              );
            })}
          </Box>

          {/* AI CHATS SECTION (typography heading) */}
          <ListItem>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              {t("ai_chats")}
            </Typography>
          </ListItem>
          <Box sx={{ mb: 6 }}>
            {aiChats.map((chat) => {
              const isActive = location.pathname === `/chat/${chat.id}`;
              return (
                <SessionItem
                  key={chat.id}
                  session={chat}
                  resourceType="chat"
                  isActive={isActive}
                  handleMenuOpen={handleMenuOpen}
                  routePath={`/chat/${chat.id}`}
                  isExpanded={isExpanded}
                />
              );
            })}
          </Box>
        </>
      )}
    </List>
  );

  return (
    <Box sx={{ width: "100%" }}>
      {drawerContent}

      {/* Additional features */}
      <DropdownMenu
        anchorEl={menuAnchorEl}
        isOpen={Boolean(menuAnchorEl)}
        onClose={handleMenuClose}
        onDeleteClick={() => handleDialogOpen("delete")}
        onRenameClick={() => handleDialogOpen("rename")}
        t={t}
      />
      <ConfirmationDialog
        open={dialogState.open}
        type={dialogState.type}
        onClose={handleDialogClose}
        onConfirm={handleConfirmAction}
        newSessionName={newSessionName}
        setNewSessionName={setNewSessionName}
        t={t}
      />
    </Box>
  );
};

SidebarContent.propTypes = {
  isExpanded: PropTypes.bool.isRequired,
}

export default SidebarContent;
