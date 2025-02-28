import { useState } from "react";
import PropTypes from "prop-types";

// MUI Component Imports
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

// Import the useTranslation hook
import { useTranslation } from "react-i18next";

// Container for the flip card with perspective
const FlipCard = styled("div")(() => ({
  perspective: 1000,
  width: "100%",
  height: "100%",
  cursor: "pointer",
  position: "relative",
}));

// Inner container that handles the flip animation
const FlipCardInner = styled("div")(({ flipped }) => ({
  position: "relative",
  width: "100%",
  height: "100%",
  transition: "transform 0.6s",
  transformStyle: "preserve-3d",
  transform: flipped ? "rotateY(180deg)" : "rotateY(0deg)",
}));

// Common styles for both faces
const FlipCardFace = styled(Card)(() => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  overflowY: "auto", // Allows vertical scrolling if content overflows
  boxSizing: "-box",
}));

// Front face of the card
const FlipCardFront = styled(FlipCardFace)(() => ({
  zIndex: 2,
  transform: "rotateY(0deg)",
  backgroundColor: "background.paper",
}));

// Back face of the card
const FlipCardBack = styled(FlipCardFace)(() => ({
  transform: "rotateY(180deg)",
}));

const Flashcard = ({ question, answer, size }) => {
  const [flipped, setFlipped] = useState(false);

  // Initialize the translation function
  const { t } = useTranslation();

  const handleCardClick = () => {
    setFlipped((prev) => !prev);
  };

  return (
    <FlipCard onClick={handleCardClick}>
      <FlipCardInner flipped={flipped}>
        <FlipCardFront>
          <CardContent sx={{ px: "15%", py: "auto", m: "auto" }}>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: size === "large" ? "1.2rem" : "1rem",
              }}
            >
              {t("question")}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: size === "large" ? "1.3rem" : "1rem" }}
            >
              {question}
            </Typography>
          </CardContent>
        </FlipCardFront>
        <FlipCardBack>
          <CardContent sx={{ px: "15%", py: "auto", m: "auto" }}>
            <Typography
              variant="body1"
              sx={{
                color: "text.secondary",
                fontSize: size === "large" ? "1.2rem" : "1rem",
              }}
            >
              {t("answer")}
            </Typography>
            <Typography
              variant="body1"
              sx={{ fontSize: size === "large" ? "1.3rem" : "1rem" }}
            >
              {answer}
            </Typography>
          </CardContent>
        </FlipCardBack>
      </FlipCardInner>
    </FlipCard>
  );
};

Flashcard.propTypes = {
  question: PropTypes.string.isRequired,
  answer: PropTypes.string.isRequired,
  size: PropTypes.string,
};

export default Flashcard;
