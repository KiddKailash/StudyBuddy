import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

// Assets
import HeroImage from "/assets/branded-images/student.svg";
import Stanford from "/assets/universities/stanford.png";
import Harvard from "/assets/universities/harvard.png";
import Columbia from "/assets/universities/columbia.png";
import NYU from "/assets/universities/nyu.png";
import Penn from "/assets/universities/penn.png";
import USC from "/assets/universities/usc.png";

// MUI components
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid2";
import Divider from "@mui/material/Divider";
import Avatar from "@mui/material/Avatar";

// Icons
import BookIcon from "@mui/icons-material/Book";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";

// Helper for logo mask styling
const getLogoMaskStyle = (src, ratio) => ({
  height: "clamp(20px, 2vw, 40px)",
  aspectRatio: ratio,
  backgroundColor: "text.secondary",
  maskImage: `url(${src})`,
  maskSize: "contain",
  maskRepeat: "no-repeat",
  WebkitMaskImage: `url(${src})`,
  WebkitMaskSize: "contain",
  WebkitMaskRepeat: "no-repeat",
});

// Logo data arrays
const logosRow1 = [
  { src: Stanford, ratio: "1263 / 266" },
  { src: Harvard, ratio: "1238 / 311" },
  { src: NYU, ratio: "320 / 109" },
];
const logosRow2 = [
  { src: USC, ratio: "365 / 81" },
  { src: Columbia, ratio: "628 / 94" },
  { src: Penn, ratio: "1423 / 467" },
];

const LandingPage = () => {
  const navigate = useNavigate();
  const { resetUserContext } = useContext(UserContext);

  // Use an effect to avoid updating context while rendering
  useEffect(() => {
    resetUserContext();
  }, [resetUserContext]);

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 }, px: 4 }}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box
            sx={{
              height: { xs: 250, md: 400 },
              textAlign: { xs: "center", md: "right" },
            }}
          >
            <img
              src={HeroImage}
              alt="Hero"
              style={{ maxWidth: "100%", height: "100%" }}
            />
          </Box>

          <Box
            sx={{
              textAlign: { xs: "center", md: "left" },
              py: { xs: 0, md: 14 },
            }}
          >
            <Typography
              variant="h2"
              sx={{ fontWeight: 700, color: "primary.main" }}
            >
              Study S.M.A.R.T
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              <b>S</b>tudy <b>M</b>aterials, by <b>A</b>I, for <b>R</b>evision
              and <b>T</b>utelage
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/login?mode=create")}
              sx={{ mt: 1 }}
            >
              Get Started
            </Button>
          </Box>
        </Stack>

        <Box sx={{ pt: 6 }}>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", textAlign: "center", mb: 1 }}
          >
            Trusted by 350,000+ students at
          </Typography>

          <Stack
            direction={{ xs: "column", md: "row" }}
            spacing={4}
            sx={{
              mb: 2,
              justifyContent: "center",
              alignItems: "center",
              borderRadius: 2,
              p: 2,
            }}
          >
            <Stack direction="row" spacing={4}>
              {logosRow1.map(({ src, ratio }, index) => (
                <Box key={index} sx={getLogoMaskStyle(src, ratio)} />
              ))}
            </Stack>
            <Stack direction="row" spacing={4}>
              {logosRow2.map(({ src, ratio }, index) => (
                <Box key={index} sx={getLogoMaskStyle(src, ratio)} />
              ))}
            </Stack>
          </Stack>
        </Box>
      </Container>

      {/* Anywhere, Anytime, from Anything. */}
      <Container
        maxWidth="lg"
        sx={{ p: 4, bgcolor: "background.paper", borderRadius: 2 }}
      >
        <Typography variant="h5" color="primary.light">
          Study Material
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          Anywhere, Anytime, from Anything.
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          sx={{ mt: 4 }}
        >
          {/* Create Q&A Flashcards */}
          <Box sx={{ textAlign: "left" }}>
            <Avatar sx={{ bgcolor: "primary.light", mr: 2 }}>
              <BookIcon />
            </Avatar>

            <Typography variant="h6" gutterBottom sx={{ mt: 0.5 }}>
              Create Q&A Flashcards
            </Typography>

            <Typography variant="body2" color="textSecondary">
              Upload any resource - video, website, document, or transcript -
              and create flashcards for revision.
            </Typography>

            <Button variant="outlined" sx={{ mt: 1 }}>
              Learn more
            </Button>
          </Box>

          {/* Mock Exams */}
          <Box sx={{ textAlign: "left" }}>
            <Avatar sx={{ bgcolor: "primary.light" }}>
              <LightbulbIcon />
            </Avatar>
            <Typography variant="h6" gutterBottom sx={{ mt: 0.5 }}>
              Mock Exams
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Test you knowledge before the real exam with our mock exams.
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Learn more
            </Button>
          </Box>

          {/* Summarize Content */}
          <Box sx={{ textAlign: "left" }}>
            <Avatar sx={{ bgcolor: "primary.light" }}>
              <TrendingUpIcon />
            </Avatar>
            <Typography variant="h6" gutterBottom sx={{ mt: 0.5 }}>
              Summarise Content
            </Typography>
            <Typography variant="body2" color="textSecondary">
              Great for students looking to ace their exams, or experts looking
              to keep up with cutting-edge research.
            </Typography>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Learn more
            </Button>
          </Box>
        </Stack>
      </Container>
    </>
  );
};

export default LandingPage;
