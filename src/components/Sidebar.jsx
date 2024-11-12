import React, { useContext } from "react";
import { Link } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

// ================================
// MUI Component Imports
// ================================
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemText from "@mui/material/ListItemText";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Box from "@mui/material/Box";

const Sidebar = () => {
  const { flashcardSessions, loadingSessions, flashcardError } = useContext(UserContext);

  console.log("Sidebar - flashcardSessions:", flashcardSessions);
  console.log("Sidebar - loadingSessions:", loadingSessions);
  console.log("Sidebar - flashcardError:", flashcardError);

  return (
    <Box sx={{ width: "240px", bgcolor: "background.paper", height: "100vh", overflowY: "auto" }}>
      <List component="nav">
        {loadingSessions ? (
          <ListItem>
            <CircularProgress />
          </ListItem>
        ) : flashcardError ? (
          <ListItem>
            <Alert severity="error">{flashcardError}</Alert>
          </ListItem>
        ) : flashcardSessions.length === 0 ? (
          <ListItem>
            <Typography variant="subtitle1">No Study Sessions Found</Typography>
          </ListItem>
        ) : (
          <>
            {flashcardSessions.map((session) => (
              <React.Fragment key={session.id}>
                <ListItem disablePadding>
                  <ListItemButton component={Link} to={`/flashcards/${session.id}`}>
                    <ListItemText primary={session.studySession} />
                  </ListItemButton>
                </ListItem>
                <Divider />
              </React.Fragment>
            ))}
          </>
        )}
      </List>
    </Box>
  );
};

export default Sidebar;
