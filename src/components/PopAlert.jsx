import * as React from 'react';
import PropTypes from 'prop-types'; // Import PropTypes
import Alert from '@mui/material/Alert';
import CheckIcon from '@mui/icons-material/Check';

export default function PopAlert({ message, severity = "info" }) {
  return (
    <Alert icon={<CheckIcon fontSize="inherit" />} severity={severity}>
      {message}
    </Alert>
  );
}

// Prop types validation
PopAlert.propTypes = {
  message: PropTypes.string.isRequired, // message is required and should be a string
  severity: PropTypes.oneOf(["error", "warning", "info", "success"]), // severity should be one of these values
};