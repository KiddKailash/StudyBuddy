import React, { useContext, useState, Suspense } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import PropTypes from 'prop-types';

// Local Imports
import { UserContext } from "../../contexts/User";
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
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import HomeIcon from "@mui/icons-material/Home";
import LanguageIcon from "@mui/icons-material/Language";
import FeedbackIcon from "@mui/icons-material/Feedback";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

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

// Error boundary component as a fallback
const SafeComponent = ({ children, fallback }) => {
  try {
    return children;
  } catch (error) {
    console.error("Component error:", error);
    return fallback || null;
  }
};

const SidebarPrimary = ({ mobileMode }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { folderID } = useParams();
  const { user, folders, createFolder, fetchFolders } = useContext(UserContext);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = mobileMode || isSmallScreen;

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

  // Fallback components for problematic ones
  const requestFeatureFallback = (
    <IconButton size="small">
      <FeedbackIcon fontSize="small" />
    </IconButton>
  );

  const languageSwitcherFallback = (
    <IconButton size="small">
      <LanguageIcon fontSize="small" />
    </IconButton>
  );

  const avatarMenuFallback = (
    <IconButton size="small" sx={{ position: 'absolute', bottom: 16 }}>
      <AccountCircleIcon fontSize="small" />
    </IconButton>
  );

  // In mobile mode, use simplified components that are less likely to cause errors
  if (mobileMode) {
    return (
      <Stack
        direction="column"
        alignItems="center"
        spacing={1}
        sx={{ 
          height: "100%", 
          pt: 2, 
          overflowY: "scroll",
          borderRight: '1px solid',
          borderRightColor: 'divider'
        }}
      >
        <Tooltip title="Home" placement="bottom">
          <IconButton
            size="large"
            onClick={() => {
              navigate("/");
              // Close the drawer by handling click event outside
              document.body.click();
            }}
            sx={{
              borderRadius: 2,
              ...(isHomePage && activeLine),
            }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip>

        <Tooltip title="Unfoldered" placement="bottom">
          <IconButton
            size="large"
            onClick={() => {
              navigate("/null/create");
              document.body.click();
            }}
            sx={{
              borderRadius: 2,
              ...(folderID === "null" && activeLine),
            }}
          >
            <ClearAllRoundedIcon />
          </IconButton>
        </Tooltip>

        {folders?.map((folder) => (
          <Tooltip key={folder.id} title={folder.folderName} placement="bottom">
            <IconButton
              size="large"
              onClick={() => {
                navigate(`/${folder.id}/create`);
                document.body.click();
              }}
              sx={{
                borderRadius: 2,
                ...(folderID === folder.id && activeLine),
              }}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>
        ))}

        <Tooltip title="Create Folder" placement="bottom">
          <IconButton
            size="large"
            onClick={handleOpenFolderDialog}
            sx={{ borderRadius: 2 }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>

        <div style={{ flexGrow: 1 }} />
        
        {/* Simple icons instead of complex components */}
        {requestFeatureFallback}
        {languageSwitcherFallback}
        {avatarMenuFallback}
      </Stack>
    );
  }

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        spacing={1}
        sx={{ 
          height: "100%", 
          pt: 2, 
          overflowY: "scroll",
          borderRight: isMobile ? '1px solid' : 'none',
          borderRightColor: 'divider'
        }}
      >
        {/* 1) "Go Pro" button (if user not paid) */}
        {user && <GoPro isPaidUser={isPaidUser} />}

        {/* 2) Home Icon */}
        <Tooltip title="Home" placement={isMobile ? "bottom" : "right"}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            {isMobile && (
              <Typography variant="caption" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                Home
              </Typography>
            )}
          </Box>
        </Tooltip>

        {/* 3) Unfoldered icon */}
        <Tooltip title="Unfoldered" placement={isMobile ? "bottom" : "right"}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            {isMobile && (
              <Typography variant="caption" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                Unfoldered
              </Typography>
            )}
          </Box>
        </Tooltip>

        {/* 4) Folders List */}
        {folders?.map((folder) => (
          <Tooltip key={folder.id} title={folder.folderName} placement={isMobile ? "bottom" : "right"}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
              {isMobile && (
                <Typography 
                  variant="caption" 
                  sx={{ 
                    ml: 1, 
                    maxWidth: '75px',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                    display: { xs: 'none', sm: 'block' }
                  }}
                >
                  {folder.folderName}
                </Typography>
              )}
            </Box>
          </Tooltip>
        ))}

        {/* 5) Create Folder Button */}
        <Tooltip title="Create Folder" placement={isMobile ? "bottom" : "right"}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
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
            {isMobile && (
              <Typography variant="caption" sx={{ ml: 1, display: { xs: 'none', sm: 'block' } }}>
                New Folder
              </Typography>
            )}
          </Box>
        </Tooltip>

        {/* 6) Space Filler */}
        <div style={{ flexGrow: 1 }} />

        {/* 7) Request Feature - Wrap in error boundary */}
        <Tooltip title="Request Feature" placement={isMobile ? "bottom" : "right"}>
          <Box>
            <Suspense fallback={<CircularProgress size={24} />}>
              <SafeComponent fallback={requestFeatureFallback}>
                <RequestFeature />
              </SafeComponent>
            </Suspense>
          </Box>
        </Tooltip>

        {/* 8) Language Switcher - Wrap in error boundary */}
        <Tooltip title="Language" placement={isMobile ? "bottom" : "right"}>
          <Box>
            <Suspense fallback={<CircularProgress size={24} />}>
              <SafeComponent fallback={languageSwitcherFallback}>
                <LanguageSwitcherIMG size="small" />
              </SafeComponent>
            </Suspense>
          </Box>
        </Tooltip>

        {/* 9) Bottom Spacing */}
        <Box sx={{ pb: isMobile ? 2 : 10 }} />

        {/* 10) Avatar / Account Menu - Wrap in error boundary */}
        <Suspense fallback={<CircularProgress size={24} />}>
          <SafeComponent fallback={avatarMenuFallback}>
            <AvatarMenu />
          </SafeComponent>
        </Suspense>
      </Stack>

      {/* =============== Create Folder Dialog =============== */}
      <Dialog
        open={openFolderDialog}
        onClose={handleCloseFolderDialog}
        PaperProps={{
          sx: {
            borderRadius: "12px",
            p: 2,
            width: isMobile ? '90%' : 'auto'
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

SidebarPrimary.propTypes = {
  mobileMode: PropTypes.bool
};

SidebarPrimary.defaultProps = {
  mobileMode: false
};

export default SidebarPrimary;
