import React, { useState } from "react";
import PropTypes from 'prop-types';

import GoProModal from "./GoProModal";

// Mui
import Tooltip from "@mui/material/Tooltip";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Divider from "@mui/material/Divider";

const GoPro = ({ isPaidUser }) => {
  const [openGoProModal, setOpenGoProModal] = useState(false);

  const handleOpenGoProModal = () => {
    setOpenGoProModal(true);
  };

  const handleCloseGoProModal = () => {
    setOpenGoProModal(false);
  };

  // If user is already paid, don't render the button at all
  if (isPaidUser) return null;

  return (
    <>
      <Tooltip title="Go Pro" placement="right">
        <Box
          sx={{
            display: "inline-flex",
            borderRadius: 2,
            p: "2px", // a bit of padding
            background: "linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0)",
            boxShadow: 6,
          }}
        >
          <IconButton
            size="large"
            onClick={handleOpenGoProModal}
            sx={{
              borderRadius: 1,
              width: 40,
              height: 40,
              backgroundColor: "#2f2f2f",
              color: "#fff",
              "&:hover": {
                backgroundColor: "#444",
              },
            }}
          >
            <Typography>👑</Typography>
          </IconButton>
        </Box>
      </Tooltip>

      {/* Optional divider (only shows if not paid) */}
      <Divider sx={{ width: "50%", my: 2 }} />

      {/* The actual modal */}
      <GoProModal open={openGoProModal} onClose={handleCloseGoProModal} />
    </>
  );
};

// PropTypes validation

GoPro.propTypes = {
    isPaidUser: PropTypes.bool
};

GoPro.defaultProps = {
    isPaidUser: false
};

export default GoPro;
