import React, { useContext } from "react";
import { UserContext } from "../contexts/User";

// MUI Components
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import Backdrop from "@mui/material/Backdrop";

/**
 * GlobalLoader component that shows a full-screen loading overlay
 * when data is being loaded in the User context
 */
const GlobalLoader = () => {
  const { dataLoading } = useContext(UserContext);

  if (!dataLoading) {
    return null;
  }

  return (
    <Backdrop
      sx={{
        color: '#fff',
        zIndex: (theme) => theme.zIndex.modal + 1,
        backgroundColor: 'background.paper',
      }}
      open={dataLoading}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress color="primary" />
      </Box>
    </Backdrop>
  );
};

export default GlobalLoader; 