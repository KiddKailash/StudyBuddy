import React, { useContext } from "react";
import {
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Divider,
  Typography,
} from "@mui/material";
import { Link } from "react-router-dom";
import { FlashcardContext } from "../contexts/FlashcardContext";

const Sidebar = () => {
  const { flashcards, loading, error } = useContext(FlashcardContext);

  return (
    <List component="nav" sx={{ width: "100%", bgcolor: "background.paper" }}>
      {loading ? (
        <ListItem>
          <ListItemText primary="Loading..." />
        </ListItem>
      ) : error ? (
        <ListItem>
          <ListItemText primary={error} />
        </ListItem>
      ) : flashcards.length === 0 ? (
        <ListItem>
          <Typography variant="subtitle1">No Study Sessions Found</Typography>
        </ListItem>
      ) : (
        <>
          {flashcards.map((session) => (
            <React.Fragment key={session.id}>
              <ListItem disablePadding>
                <ListItemButton
                  component={Link}
                  to={`/flashcards/${session.id}`}
                >
                  <ListItemText primary={session.StudySession} />
                </ListItemButton>
              </ListItem>
              <Divider />
            </React.Fragment>
          ))}
        </>
      )}
    </List>
  );
};

export default Sidebar;
