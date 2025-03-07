import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// MUI
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";

// Local Imports
import { UserContext } from "../../contexts/UserContext";
import RequestFeature from "../../components/RequestFeature/RequestFeature";
import LanguageSwitcherIMG from "../../components/LanguageSwitcher";
import AvatarMenu from "./AvatarMenu";

const SidebarPrimary = () => {
  const navigate = useNavigate();
  const { folders, createFolder, fetchFolders } = useContext(UserContext);

  const [open, setOpen] = useState(false);
  const [folderName, setFolderName] = useState("");

  // Handlers
  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    setFolderName("");
  };

  // Create the folder, then refresh the list
  const handleCreateFolderSubmit = async () => {
    await createFolder(folderName);
    await fetchFolders();
    handleClose();
  };

  const handleOpenGoProModal = () => console.log("Open Go Pro modal");

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
        sx={{ height: "100%" }}
      >
        {/* Home Icon */}
        <Tooltip title="Home" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/create")}
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

        {/* "No Folder" item:
          - Not in the DB, so we just hard-code an additional FolderIcon
          - Direct the user to '/null/home' 
        */}
        <Tooltip title="No Folder" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/null/create")}
            sx={{
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <FolderIcon />
          </IconButton>
        </Tooltip>
        {/* Folders List */}
        {folders?.map((folder) => (
          <Tooltip key={folder.id} title={folder.folderName} placement="right">
            <IconButton
              size="large"
              onClick={() => navigate(`/${folder.id}/create`)}
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
            onClick={handleOpen}
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

        {/* Request Feature */}
        <Tooltip title="Request Feature" placement="right">
          <Box>
            <RequestFeature />
          </Box>
        </Tooltip>

        {/* Language Switcher */}
        <Tooltip title="Language" placement="right">
          <Box>
            <LanguageSwitcherIMG size="small"/>
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

        <Box sx={{ height: 70 }} />

        {/* Account (Avatar menu) */}
        <AvatarMenu />
      </Stack>

      {/* Create Folder Dialog */}
      <Dialog open={open} onClose={handleClose}>
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            onChange={(e) => setFolderName(e.target.value)}
            value={folderName}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleClose}>
            Close
          </Button>
          <Button variant="contained" onClick={handleCreateFolderSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default SidebarPrimary;
