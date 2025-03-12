import React, { useContext, useState } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";

// Local Imports
import { UserContext } from "../../contexts/UserContext";
import RequestFeature from "../../components/RequestFeature/RequestFeature";
import LanguageSwitcherIMG from "../../components/LanguageSwitcher";
import AvatarMenu from "./AvatarMenu";
import GoPro from "./GoPro";

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
import HomeIcon from "@mui/icons-material/Home";

/**
 * Helper style object that returns the pseudo-element
 * to draw a 2px line offset from the right edge.
 */
const activeLine = {
  position: "relative",
  "&::before": {
    content: '""',
    borderRadius: 1,
    position: "absolute",
    right: -15,
    top: "4px",
    bottom: "4px",
    width: "2px",
    backgroundColor: (theme) => theme.palette.primary.dark,
  },
};

const SidebarPrimary = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { folderID } = useParams();
  const { user, folders, createFolder, fetchFolders } = useContext(UserContext);

  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");

  const isPaidUser = user?.accountType === "paid";
  const isHomePage = location.pathname === "/";

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
        spacing={1}
        sx={{ height: "100%", pt: 2, overflowY: "scroll" }}
      >
        {/* 1) “Go Pro” button (if user not paid) */}
        {user && <GoPro isPaidUser={isPaidUser} />}

        {/* 2) Home Icon */}
        <Tooltip title="Home" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/")}
            sx={{
              borderRadius: 2,
              ...(isHomePage && activeLine),
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <HomeIcon sx={{ borderRadius: 2 }} />
          </IconButton>
        </Tooltip>

        {/* 3) Unfoldered icon */}
        <Tooltip title="Unfoldered" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/null/create")}
            sx={{
              borderRadius: 2,
              ...(folderID === "null" && activeLine),
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <ClearAllRoundedIcon />
          </IconButton>
        </Tooltip>

        {/* 4) Folders List */}
        {folders?.map((folder) => (
          <Tooltip key={folder.id} title={folder.folderName} placement="right">
            <IconButton
              size="large"
              onClick={() => navigate(`/${folder.id}/create`)}
              sx={{
                borderRadius: 2,
                ...(folderID === folder.id && activeLine),
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>
        ))}

        {/* 5) Create Folder Button */}
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

        {/* 6) Space Filler */}
        <div style={{ flexGrow: 1 }} />

        {/* 7) Request Feature */}
        <Tooltip title="Request Feature" placement="right">
          <Box>
            <RequestFeature />
          </Box>
        </Tooltip>

        {/* 8) Language Switcher */}
        <Tooltip title="Language" placement="right">
          <Box>
            <LanguageSwitcherIMG size="small" />
          </Box>
        </Tooltip>

        {/* 9) Bottom Spacing */}
        <Box sx={{ pb: 10 }} />

        {/* 10) Avatar / Account Menu */}
        <AvatarMenu />
      </Stack>

      {/* =============== Create Folder Dialog =============== */}
      <Dialog
        open={openFolderDialog}
        onClose={handleCloseFolderDialog}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 2,
          },
        }}
      >
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
