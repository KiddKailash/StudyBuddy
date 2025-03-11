import React from "react";
import PropTypes from "prop-types";

// MUI
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import styled from "@mui/material/styles/styled";

// Container that holds the scrolling text and gradients
const TickerContainer = styled(Box)(() => ({
  position: "fixed",
  overflow: "hidden",
  width: "100%",
  backgroundColor: "background.default",
}));

// The scrolling text itself, using a CSS keyframes animation
const TickerContent = styled(Box)(() => ({
  display: "inline-block",
  whiteSpace: "nowrap",
  animation: "marquee 90s linear infinite",
  // Define the marquee keyframes on the component's root
  "@keyframes marquee": {
    "0%": { transform: "translateX(50%)" },
    "100%": { transform: "translateX(-50%)" },
  },
}));

// Left and right overlay gradients that fade the text in/out
const FadeOverlayLeft = styled(Box)(() => ({
  position: "relative",
  left: 0,
  top: 0,
  bottom: 0,
  width: "60px",
  background: `linear-gradient(to right, "background.default" 0%, transparent 100%)`,
  pointerEvents: "none",
}));

const FadeOverlayRight = styled(Box)(() => ({
  position: "relative",
  right: 0,
  top: 0,
  bottom: 0,
  width: "60px",
  background: `linear-gradient(to left, "background.default" 0%, transparent 100%)`,
  pointerEvents: "none",
}));

const SidewaysScrollingText = ({ items }) => {
  return (
    <TickerContainer>
      <TickerContent>
        {items.map((text, idx) => (
          <Typography
            variant="body2"
            component="span"
            color="text.secondary"
            sx={{ mr: 5 }}
            key={idx}
          >
            {text}
          </Typography>
        ))}
      </TickerContent>
      <FadeOverlayLeft />
      <FadeOverlayRight />
    </TickerContainer>
  );
};

// PropTypes validation
SidewaysScrollingText.propTypes = {
  items: PropTypes.arrayOf(PropTypes.string).isRequired,
};

export default SidewaysScrollingText;
