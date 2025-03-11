import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// Local Imports
import { UserContext } from "../../contexts/UserContext";
import RequestFeature from "../../components/RequestFeature/RequestFeature";
import LanguageSwitcherIMG from "../../components/LanguageSwitcher";
import AvatarMenu from "./AvatarMenu";
import GoPro from "./GoPro"; // <--- new import

// MUI Imports
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

// MUI Icons
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";

/**
 * Sidebar that shows:
 *  - GoProButton (if user not paid)
 *  - Home icon
 *  - Folders list
 *  - Create Folder button
 *  - Request Feature
 *  - Language Switcher
 *  - Avatar / Account
 */
const SidebarPrimary = () => {
  const navigate = useNavigate();
  const { user, folders, createFolder, fetchFolders } = useContext(UserContext);

  // Track folder creation
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");

  const isPaidUser = user?.accountType === "paid";

  // Folder creation handlers
  const handleOpenFolderDialog = () => setOpenFolderDialog(true);
  const handleCloseFolderDialog = () => {
    setOpenFolderDialog(false);
    setFolderName("");
  };

  const handleCreateFolderSubmit = async () => {
    await createFolder(folderName);
    await fetchFolders();
    handleCloseFolderDialog();
  };

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
        sx={{ height: "100%", pt: 2 }}
      >
        {/* 
          1) “Go Pro” button, extracted into its own component. 
             If the user is paid, it returns null.
        */}
        <GoPro isPaidUser={isPaidUser} />

        {/* 
          2) Example "No Folder" item
        */}
        <Tooltip title="No Folder" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/null/create")}
            sx={{
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <ClearAllRoundedIcon />
          </IconButton>
        </Tooltip>

        {/* 
          3) Folders List
        */}
        {folders?.map((folder) => (
          <Tooltip key={folder.id} title={folder.folderName} placement="right">
            <IconButton
              size="large"
              onClick={() => navigate(`/${folder.id}/create`)}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>
        ))}

        {/* 
          4) Create Folder Button 
        */}
        <Tooltip title="Create Folder" placement="right">
          <IconButton
            size="large"
            onClick={handleOpenFolderDialog}
            sx={{
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>

        {/* 
          5) Space Filler 
        */}
        <div style={{ flexGrow: 1 }} />

        {/* 
          6) Request Feature 
        */}
        <Tooltip title="Request Feature" placement="right">
          <Box>
            <RequestFeature />
          </Box>
        </Tooltip>

        {/* 
          7) Language Switcher
        */}
        <Tooltip title="Language" placement="right">
          <Box>
            <LanguageSwitcherIMG size="small" />
          </Box>
        </Tooltip>

        {/* 
          8) Bottom Spacing
        */}
        <Box sx={{ height: 75 }} />

        {/* 
          9) Avatar / Account Menu 
        */}
        <AvatarMenu />
      </Stack>

      {/* =============== Create Folder Dialog =============== */}
      <Dialog open={openFolderDialog} onClose={handleCloseFolderDialog}>
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
          <Button color="error" onClick={handleCloseFolderDialog}>
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
