import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { Stack, Divider, Tooltip, IconButton, Box } from "@mui/material";
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

import { UserContext } from "../../contexts/UserContext";
import RequestFeature from "../../components/RequestFeature/RequestFeature";
import LanguageSwitcherIMG from "../../components/LanguageSwitcher";
import AvatarMenu from "./AvatarMenu";

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
          size="large"
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
            size="large"
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
          size="large"
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

      {/* Language Switcher 
          Wrap in <span> or <Box> so Tooltip can attach its ref properly. */}
      <Tooltip title="Language" placement="right">
        <Box>
          <LanguageSwitcherIMG />
        </Box>
      </Tooltip>

      {/* Request Feature: also wrap with a span or div */}
      <Tooltip title="Request Feature" placement="right">
        <Box>
          <RequestFeature />
        </Box>
      </Tooltip>

      {/* Go Pro */}
      <Tooltip title="Go Pro" placement="right">
        <IconButton
          size="large"
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

      <Box sx={{height: 50}} />

      {/* Account (Avatar menu) */}
      <AvatarMenu />
    </Stack>
  );
};

export default SidebarPrimary;
