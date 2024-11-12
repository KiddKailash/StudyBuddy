import { useState } from "react";
import PropTypes from "prop-types";

// ================================
// MUI Component Imports
// ================================
import { styled } from "@mui/material/styles";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";

// Container for the flip card with perspective
const FlipCard = styled("div")(({ theme }) => ({
  perspective: 1000,
  width: "100%",
  height: "200px",
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
const FlipCardFace = styled(Card)(({ theme }) => ({
  position: "absolute",
  width: "100%",
  height: "100%",
  backfaceVisibility: "hidden",
  display: "flex",
  flexDirection: "column",
  justifyContent: "center",
  alignItems: "center",
  overflowY: "auto", // Allows vertical scrolling if content overflows
  paddingTop: theme.spacing(1),
  boxSizing: "border-box",
}));

// Front face of the card
const FlipCardFront = styled(FlipCardFace)(({ theme }) => ({
  zIndex: 2,
  transform: "rotateY(0deg)",
}));

// Back face of the card
const FlipCardBack = styled(FlipCardFace)(({ theme }) => ({
  transform: "rotateY(180deg)",
}));

const Flashcard = ({ question, answer }) => {
  const [flipped, setFlipped] = useState(false);

  const handleCardClick = () => {
    setFlipped((prev) => !prev);
  };

  return (
    <FlipCard onClick={handleCardClick}>
      <FlipCardInner flipped={flipped}>
        <FlipCardFront>
          <CardContent>
            <Typography variant="body1" sx={{ color: "grey" }}>
              Question
            </Typography>
            <Typography variant="body1" color="text.primary">
              {question}
            </Typography>
          </CardContent>
        </FlipCardFront>
        <FlipCardBack>
          <CardContent>
            <Typography variant="body1" sx={{ color: "grey" }}>
              Answer
            </Typography>
            <Typography variant="body1" color="text.primary">
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
};

export default Flashcard;
