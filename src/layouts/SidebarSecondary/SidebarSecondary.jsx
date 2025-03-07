import React, { useState, useContext } from "react";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import UnfoldMoreIcon from "@mui/icons-material/UnfoldMore";
import UnfoldLessIcon from "@mui/icons-material/UnfoldLess";
import Stack from "@mui/material/Stack";
import SidebarContent from "./SidebarContent";
import { UserContext } from "../../contexts/UserContext";

const SidebarSecondary = () => {
  const [isExpanded, setIsExpanded] = useState(true);
  const FULL_WIDTH = 260;
  const COLLAPSED_WIDTH = 70;
  const { folderID } = useParams();
  const { folders } = useContext(UserContext);

  // Find the current folder (if any)
  const folder = folders.find((f) => f.id === folderID);

  const toggleExpand = () => {
    setIsExpanded((prev) => !prev);
  };

  return (
    <Box
      sx={{
        width: isExpanded ? FULL_WIDTH : COLLAPSED_WIDTH,
        transition: "width 0s ease-in-out",
        borderRight: 2,
        borderRightColor: "background.paper",
        overflowY: "auto",
      }}
    >
      {/* Top header: expand/collapse button and folder name (only when expanded) */}
      <Stack
        direction="row"
        spacing={2}
        sx={{ px: 2, pt: 3, display: "flex", alignItems: "center" }}
      >
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
        {isExpanded && (
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {folder ? folder.folderName : "Unfoldered"}
          </Typography>
        )}
      </Stack>

      {/* Sidebar content containing the new study resource button and the study resources */}
      <SidebarContent isExpanded={isExpanded} />
    </Box>
  );
};

export default SidebarSecondary;
