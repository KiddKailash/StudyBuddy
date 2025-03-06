import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Divider, Tooltip, IconButton } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import HelpIcon from "@mui/icons-material/Help";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { UserContext } from "../../contexts/UserContext";
import RequestFeature from "../../components/RequestFeature/RequestFeature";

const SidebarPrimary = () => {
  const navigate = useNavigate();
  const { folders } = useContext(UserContext);

  // Placeholder handlers
  const handleOpenChat = () => console.log("Open support chat");
  const handleOpenAccountModal = () => console.log("Open account modal");
  const handleOpenGoProModal = () => console.log("Open Go Pro modal");
  const handleCreateFolder = () => console.log("Create new folder");

  return (
    <Stack
      direction="column"
      alignItems="center"
      spacing={2}
      sx={{ py: 2, height: "100%" }}
    >
      {/* Home Icon */}
      <Tooltip title="Home" placement="right">
        <IconButton
          onClick={() => navigate("/create-resource")}
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <HomeIcon />
        </IconButton>
      </Tooltip>

      <Divider sx={{ width: "50%" }} />

      {/* Folders List */}
      {folders?.map((folder) => (
        <Tooltip key={folder.id} title={folder.folderName} placement="right">
          <IconButton
            onClick={() => navigate(`/${folder.id}/home`)}
            sx={{
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <FolderIcon />
          </IconButton>
        </Tooltip>
      ))}

      {/* Create Folder */}
      <Tooltip title="Create Folder" placement="right">
        <IconButton
          onClick={handleCreateFolder}
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <AddIcon />
        </IconButton>
      </Tooltip>

      {/* Space Between */}
      <div style={{ flexGrow: 1 }} />

      {/* Support */}
      <Tooltip title="Support" placement="right">
        <IconButton
          onClick={handleOpenChat}
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <HelpIcon />
        </IconButton>
      </Tooltip>

      {/* Account */}
      <Tooltip title="Account" placement="right">
        <IconButton
          onClick={handleOpenAccountModal}
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <AccountCircleIcon />
        </IconButton>
      </Tooltip>

      <Tooltip title="Request Feature" placement="right">
        <RequestFeature />
      </Tooltip>

      {/* Go Pro */}
      <Tooltip title="Go Pro" placement="right">
        <IconButton
          onClick={handleOpenGoProModal}
          sx={{
            "&:hover": {
              color: "primary.main",
            },
          }}
        >
          <WorkspacePremiumIcon />
        </IconButton>
      </Tooltip>
    </Stack>
  );
};

export default SidebarPrimary;
