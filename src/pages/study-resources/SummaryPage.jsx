import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";

// Contexts
import { UserContext } from "../../contexts/UserContext";

// Local Imports
import PageWrapper from "../../components/PageWrapper";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const SummaryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn, summaries } = useContext(UserContext);

  // Local state
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (!isLoggedIn) {
      // If not logged in, set an error or handle ephemeral logic
      setErrorMessage("You must be logged in to view this summary.");
      setLoading(false);
      return;
    }

    const fetchSummary = async () => {
      setLoading(true);
      try {
        const fetchedSummary = summaries.map((s) => s.id === id)[0];
        setSummary(fetchedSummary);
      } catch (error) {
        console.error("Error fetching summary:", error);
        setErrorMessage(
          error.response?.data?.error ||
            "Error fetching summary. Please try again."
        );
      } finally {
        setLoading(false);
      }
    };

    fetchSummary();
  }, [id, isLoggedIn, summaries]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "100%",
          width: "100%",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (errorMessage || !summary) {
    return (
      <Box sx={{ p: 2 }}>
        <Typography color="error" gutterBottom>
          {errorMessage || "Summary not found."}
        </Typography>
        <Typography
          sx={{ textDecoration: "underline", cursor: "pointer" }}
          onClick={() => navigate("/create")}
        >
          Go back home
        </Typography>
      </Box>
    );
  }

  return (
    <PageWrapper>
      <Typography variant="h4" gutterBottom>
        Summary
      </Typography>
      <Typography sx={{ mt: 2 }}>{summary.summary}</Typography>
    </PageWrapper>
  );
};

export default SummaryPage;
