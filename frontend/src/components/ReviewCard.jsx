import React from "react";
import PropTypes from "prop-types";

// MUI
import Card from '@mui/material/Card';
import CardContent from '@mui/material/CardContent';
import Typography from '@mui/material/Typography';
import Rating from '@mui/material/Rating';

// MUI Icons
import StarIcon from "@mui/icons-material/Star";

const ReviewCard = ({ name, country, rating, text }) => {
  return (
    <Card variant="outlined" sx={{ borderRadius: 2 }}>
      <CardContent sx={{ p: 2, textAlign: "left" }}>
        {/* Stars */}
        <Rating
          name="read-only"
          value={rating}
          readOnly
          precision={0.5}
          icon={
            <StarIcon fontSize="inherit" sx={{ color: "primary.light", opacity: 1 }} />
          }
          emptyIcon={
            <StarIcon fontSize="inherit" sx={{ color: "text: secondary" }} />
          }
        />

        {/* Review text */}
        <Typography variant="body1" sx={{ mt: 1 }}>
          {text}
        </Typography>

        {/* Reviewer info */}
        <Typography variant="caption" color="textSecondary">
          {name} from {country}
        </Typography>
      </CardContent>
    </Card>
  );
};

// PropTypes Validation
ReviewCard.propTypes = {
  name: PropTypes.string.isRequired,      // Ensures 'name' is a required string
  country: PropTypes.string.isRequired,   // Ensures 'country' is a required string
  rating: PropTypes.number.isRequired,    // Ensures 'rating' is a required number
  text: PropTypes.string.isRequired,      // Ensures 'text' is a required string
};

// Default Props (Optional)
ReviewCard.defaultProps = {
  rating: 5,  // Default rating if not provided
};

export default ReviewCard;
