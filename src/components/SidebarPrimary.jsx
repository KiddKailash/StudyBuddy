import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

// MUI
import Stack from "@mui/material/Stack";
import Divider from "@mui/material/Divider";
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Box from "@mui/material/Box";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

const SidebarPrimary = () => {
  const navigate = useNavigate();
  const { getFolders } = useContext(UserContext);

  // Placeholder handlers for demonstration:
  const handleOpenChat = () => {
    console.log("Open support chat");
    // e.g., setState to open your support chat widget
  };

  const handleOpenAccountModal = () => {
    console.log("Open account modal");
    // e.g., setState to open an Account modal
  };

  const handleOpenGoProModal = () => {
    console.log("Open Go Pro modal");
    // e.g., setState to open your Go Pro/Upgrade modal
  };

  const handleCreateFolder = () => {
    console.log("Create new folder");
    // e.g., navigate to a create folder page or open a 'create folder' dialog
  };

  return (
    <Stack direction="column" alignItems="center" spacing={2} sx={{ py: 2 }}>
      {/* Home Icon */}
      <Tooltip title="Home">
        <IconButton onClick={() => navigate("/create-resource")}>
          <HomeIcon />
        </IconButton>
      </Tooltip>

      <Divider sx={{ width: "80%" }} />

      {/* Folders List */}
      {getFolders()?.map((folder) => (
        <Tooltip key={folder.id} title={folder.studySession}>
          <IconButton onClick={() => navigate(`/${folder.id}/home`)}>
            <FolderIcon />
          </IconButton>
        </Tooltip>
      ))}

      {/* Create Folder */}
      <Tooltip title="Create Folder">
        <IconButton onClick={handleCreateFolder}>
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Space Between */}
      <Box flexGrow={1} />

      {/* Support */}
      <Tooltip title="Support">
        <IconButton onClick={handleOpenChat}>
          <HelpIcon />
        </IconButton>
      </Tooltip>

      {/* Account */}
      <Tooltip title="Account">
        <IconButton onClick={handleOpenAccountModal}>
          <AccountCircleIcon />
        </IconButton>
      </Tooltip>

      {/* Go Pro */}
      <Tooltip title="Go Pro">
        <IconButton onClick={handleOpenGoProModal}>
          <WorkspacePremiumIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default SidebarPrimary;
