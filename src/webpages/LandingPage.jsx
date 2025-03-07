import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { UserContext } from "../contexts/UserContext";

// Components
import ReviewCard from "../components/ReviewCard";
import MenuBar from "../components/MenuBar/MenuBar";

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
  const { t } = useTranslation();

  useEffect(() => {
    // Reset user context whenever this page loads
    resetUserContext();
  }, [resetUserContext]);

  // Pull array of reviews from translations
  const reviews = t("reviews", { returnObjects: true });

  return (
    <>
      {/* Hero Section */}
      <Container maxWidth="lg">
        <MenuBar />
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
              {t("hero.title")}
            </Typography>
            <Typography variant="h6" color="textSecondary" gutterBottom>
              {t("hero.subtitle")}
            </Typography>

            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={() => navigate("/login?mode=create")}
              sx={{ mt: 1 }}
            >
              {t("hero.getStarted")}
            </Button>
          </Box>
        </Stack>

        <Box sx={{ pt: 6 }}>
          <Typography
            variant="body1"
            sx={{ color: "text.secondary", textAlign: "center", mb: 1 }}
          >
            {t("tagline")}
          </Typography>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={3}
            sx={{
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

      <Box
        maxWidth="md"
        sx={{
          borderRadius: 2,
          margin: "auto",
          boxShadow: 20,
          width: "100%",
          overflow: "hidden",
          display: "flex",
          justifyContent: "center",
        }}
      >
        <video
          src="/assets/demo.mov"
          autoPlay
          loop
          muted
          playsInline
          style={{ width: "100%", display: "block", m: 0, p: 0 }}
        />
      </Box>

      {/* Anywhere, Anytime, from Anything */}
      <Container maxWidth="lg" sx={{ p: 4, borderRadius: 2 }}>
        <Typography variant="h6" color="primary.main">
          {t("section.reviseTitle")}
        </Typography>
        <Typography variant="h4" sx={{ fontWeight: 700 }} gutterBottom>
          {t("section.anywhereTitle")}
        </Typography>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={4}
          sx={{ mt: 4 }}
        >
          {/* Feature 1: Create Q&A Flashcards */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Avatar sx={{ bgcolor: "primary.light", mb: 1 }}>
              <BookIcon />
            </Avatar>
            <Typography variant="h6">
              {t("features.createFlashcards.title")}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {t("features.createFlashcards.description")}
            </Typography>
          </Box>

          {/* Feature 2: Mock Exams */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Avatar sx={{ bgcolor: "primary.light", mb: 1 }}>
              <LightbulbIcon />
            </Avatar>
            <Typography variant="h6">
              {t("features.mockExams.title")}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {t("features.mockExams.description")}
            </Typography>
          </Box>

          {/* Feature 3: Summarise Content */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: { xs: "center", sm: "flex-start" },
              textAlign: { xs: "center", sm: "left" },
            }}
          >
            <Avatar sx={{ bgcolor: "primary.light", mb: 1 }}>
              <TrendingUpIcon />
            </Avatar>
            <Typography variant="h6">
              {t("features.summariseContent.title")}
            </Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 0.5 }}>
              {t("features.summariseContent.description")}
            </Typography>
          </Box>
        </Stack>
      </Container>

      {/* Reviews Section */}
      <Box sx={{ py: 8 }}>
        <Container maxWidth="lg">
          <Typography
            variant="h4"
            align="center"
            sx={{ fontWeight: 700, color: "primary.main" }}
          >
            {t("reviewsTitle")}
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
