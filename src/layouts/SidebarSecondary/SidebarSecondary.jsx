import React, { useState, useContext, Suspense } from "react";
import { useParams } from "react-router-dom";
import PropTypes from 'prop-types';

// Contexts
import { UserContext } from "../../contexts/User";

// Local Imports
import SidebarContent from "./SidebarContent";

// MUI
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";

// Error safe component wrapper
const SafeComponent = ({ children, fallback }) => {
  try {
    return children;
  } catch (error) {
    console.error("Component error:", error);
    return fallback || null;
  }
};

const SidebarSecondary = ({ mobileMode }) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const FULL_WIDTH = 260;
  const COLLAPSED_WIDTH = 72;
  const { folderID } = useParams();
  const { folders } = useContext(UserContext);
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('sm'));
  const isMobile = mobileMode || isSmallScreen;

  // Find the current folder (if any)
  const folder = folders.find((f) => f.id === folderID);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  // On mobile, always show expanded when in drawer
  const actualWidth = isMobile ? FULL_WIDTH : (isExpanded ? FULL_WIDTH : COLLAPSED_WIDTH);

  // Simplified version for mobile drawer to prevent errors
  if (mobileMode) {
    return (
      <Box
        sx={{
          width: FULL_WIDTH,
          minWidth: FULL_WIDTH,
          overflowY: "auto",
          flex: 1,
        }}
      >
        <Stack
          direction="row"
          spacing={2}
          sx={{ px: 2, pt: 3.5, display: "flex", alignItems: "center" }}
        >
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {folder ? folder.folderName : "Unfoldered"}
          </Typography>
        </Stack>

        <Suspense fallback={<CircularProgress size={24} />}>
          <SafeComponent fallback={<Box p={2}>Loading content...</Box>}>
            <SidebarContent isExpanded={true} mobileMode={true} />
          </SafeComponent>
        </Suspense>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        width: actualWidth,
        minWidth: actualWidth,
        transition: "width 0s ease-in-out",
        borderRight: isMobile ? 0 : 2,
        borderRightColor: "background.paper",
        overflowY: "auto",
        flex: isMobile ? 1 : "none",
      }}
    >
      {/* Top header: expand/collapse button and folder name (only when expanded) */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ px: 2, pt: 3.5, display: "flex", alignItems: "center" }}
      >
        {!isMobile && (
          <IconButton
            onClick={toggleExpand}
            size="small"
            sx={{
              borderRadius: 2,
            }}
          >
            {isExpanded ? (
              <UnfoldLessIcon
                fontSize="small"
                sx={{ transform: "rotate(45deg)" }}
              />
            ) : (
              <UnfoldMoreIcon
                fontSize="small"
                sx={{ transform: "rotate(45deg)" }}
              />
            )}
          </IconButton>
        )}
        {(isExpanded || isMobile) && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {folder ? folder.folderName : "Unfoldered"}
          </Typography>
        )}
      </Stack>

      {/* Sidebar content containing the new study resource button and the study resources */}
      <SidebarContent isExpanded={isExpanded || isMobile} />
    </Box>
  );
};

SidebarSecondary.propTypes = {
  mobileMode: PropTypes.bool
};

SidebarSecondary.defaultProps = {
  mobileMode: false
};

export default SidebarSecondary;
