import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { UserContext } from "../contexts/UserContext";

// Components
import ReviewCard from "../components/ReviewCard";

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
import Masonry from "@mui/lab/Masonry";

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

  const reviews = [
    {
      name: "Sene",
      country: "United States",
      rating: 5,
      text: "I saw it on TikTok and decided to give it a try. In less than 20 minutes, I knew it was the best study AI tool I’d ever seen.",
    },
    {
      name: "Arwa",
      country: "Canada",
      rating: 5,
      text: "I absolutely love using it because it integrates directly with materials from my courses. It really simplifies my study process!",
    },
    {
      name: "Tim",
      country: "United States",
      rating: 4,
      text: "College was a tough transition for me. This tool has been a big help, though I wish the flashcard feature was a bit more customizable. 10/10 recommend trying it out!",
    },
    {
      name: "Lucia",
      country: "Spain",
      rating: 5,
      text: "I must say it is significantly better than ChatGPT 🤭. The answers were more accurate, and the summarization tool saved me hours of revision.",
    },
    {
      name: "Asriel",
      country: "France",
      rating: 5,
      text: "So easy to use. It’s like having a personal tutor available 24/7.",
    },
    {
      name: "Raj",
      country: "India",
      rating: 5,
      text: "I've been using it for a while now, and it's been a game-changer for my exam prep. The quiz builder is fantastic!",
    },
    {
      name: "Katie",
      country: "United Kingdom",
      rating: 4,
      text: "Great tool for breaking down complex topics. I wish the mobile app was a little faster, but overall, I’m really impressed.",
    },
    {
      name: "Noah",
      country: "Germany",
      rating: 5,
      text: "The video summarization feature is brilliant. It turns an hour-long lecture into concise notes!",
    },
    {
      name: "Emily",
      country: "New Zealand",
      rating: 4,
      text: "Really helpful for note-taking. Sometimes the summaries miss minor details, but it's still worth it for the time saved.",
    },
  ];

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
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{
              my: 2,
              justifyContent: "center",
              alignItems: "center",
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
        <Typography variant="h6" color="primary.main">
          Revise, cram, test yourself with study materials
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
          <Box
            sx={{
              display: "flex", // Makes children stack vertically
              flexDirection: "column", // Stack items top to bottom
              alignItems: { xs: "center", sm: "flex-start" }, // Center items horizontally
              justifyContent: { xs: "center", sm: "left" }, // Center items vertically (if height allows)
              textAlign: { xs: "center", sm: "left" }, // Center text inside each child
            }}
          >
            <Avatar sx={{ bgcolor: "primary.light", mr: 2 }}>
              <BookIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                Create Q&A Flashcards
              </Typography>

              <Typography variant="body2" color="textSecondary">
                Upload any resource - video, website, document, or transcript -
                and create flashcards for revision.
              </Typography>
            </Box>

            <Button variant="outlined" sx={{ mt: 1 }}>
              Learn more
            </Button>
          </Box>

          {/* Mock Exams */}
          <Box
            sx={{
              display: "flex", // Makes children stack vertically
              flexDirection: "column", // Stack items top to bottom
              alignItems: { xs: "center", sm: "flex-start" }, // Center items horizontally
              justifyContent: { xs: "center", sm: "left" }, // Center items vertically (if height allows)
              textAlign: { xs: "center", sm: "left" }, // Center text inside each child
            }}
          >
            <Avatar sx={{ bgcolor: "primary.light" }}>
              <LightbulbIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                Mock Exams
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Test you knowledge before the real exam with our mock exams.
              </Typography>
            </Box>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Learn more
            </Button>
          </Box>

          {/* Summarize Content */}
          <Box
            sx={{
              display: "flex", // Makes children stack vertically
              flexDirection: "column", // Stack items top to bottom
              alignItems: { xs: "center", sm: "flex-start" }, // Center items horizontally
              justifyContent: { xs: "center", sm: "left" }, // Center items vertically (if height allows)
              textAlign: { xs: "center", sm: "left" }, // Center text inside each child
            }}
          >
            {" "}
            <Avatar sx={{ bgcolor: "primary.light" }}>
              <TrendingUpIcon />
            </Avatar>
            <Box>
              <Typography variant="h6" sx={{ mt: 0.5 }}>
                Summarise Key Content
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Great for students looking to ace their exams, or experts
                looking to keep up with cutting-edge research.
              </Typography>
            </Box>
            <Button variant="outlined" sx={{ mt: 1 }}>
              Learn more
            </Button>
          </Box>
        </Stack>
      </Container>

      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            What Students Say
          </Typography>
          <Masonry columns={{ xs: 1, sm: 2, md: 3 }} spacing={2} sx={{ mt: 1 }}>
            {reviews.map((review, index) => (
              <ReviewCard
                key={index}
                name={review.name}
                country={review.country}
                rating={review.rating}
                text={review.text}
              />
            ))}
          </Masonry>
        </Container>
      </Box>
    </>
  );
};

export default LandingPage;
