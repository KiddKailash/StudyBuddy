import { Link } from "react-router-dom";
// import StoryPathImg from "../assets/icon.png";
import PageTitle from "../components/PageTitle";
import PopAlert from "../components/PopAlert";

// ================================
// MUI Component Imports
// ================================
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import Grid from "@mui/material/Grid2";

/**
 * LandingPage component for displaying the welcome message and navigation options.
 *
 * @return {JSX.Element} The landing page section with a welcome message, tour types, and navigation button.
 */
const LandingPage = () => {
  return (
    <Grid container columnSpacing={24} alignContent="center">
      {/* Left Section: Welcome text and navigation button */}
      <Grid
        size={{ xs: 12, md: 6 }}
        sx={{
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
        }}
      >
        <PageTitle
          title="Welcome to StoryPath"
          subtitle="Create engaging tours, hunts, and adventures!"
        />
        {/* <Typography variant="h2" gutterBottom>
          Welcome to StoryPath
        </Typography>

        <Typography variant="h5" gutterBottom>
          Create engaging tours, hunts, and adventures!
        </Typography>
        <Divider sx={{ my: 2 }} /> */}
        <List>
          <ListItem>• Museum Tours</ListItem>
          <ListItem>• Campus Tours</ListItem>
          <ListItem>• Treasure Hunts</ListItem>
          <ListItem>• And more!</ListItem>
        </List>
          <Button
            variant="contained"
            sx={{ mt: 4 }}
            component={Link}
            to="/Projects"
            onClick={PopAlert("Manage projects from this page")}
          >
            Manage Projects
          </Button>
      </Grid>

      {/* Right Section: Image */}
      <Grid size={{ xs: 0, md: 6 }}>
        {/* <Box
          component="img"
          sx={{
            width: "100%",
            height: "auto",
            borderRadius: 2,
          }}
          alt="Tours, Hunts, and Adventures"
          src={StoryPathImg}
        /> */}
      </Grid>
    </Grid>
  );
};

export default LandingPage;
