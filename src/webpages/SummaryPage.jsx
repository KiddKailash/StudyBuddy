import React, { useContext, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { UserContext } from "../contexts/UserContext";

// MUI
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const SummaryPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isLoggedIn } = useContext(UserContext);

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
      try {
        setLoading(true);
        const localToken = localStorage.getItem("token");
        if (!localToken) {
          setErrorMessage("No access token found. Please log in again.");
          setLoading(false);
          return;
        }

        const BACKEND = import.meta.env.VITE_DIGITAL_OCEAN_URI;
        const response = await axios.get(`${BACKEND}/api/summaries/${id}`, {
          headers: { Authorization: `Bearer ${localToken}` },
        });

        // The server might return { summary: {...} }, e.g.:
        // const fetchedSummary = response.data.summary;
        // Adjust to your actual response shape:
        const fetchedSummary = response.data.data;
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
  }, [id, isLoggedIn]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          height: "80%",
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
    <>
      <Typography variant="h4" gutterBottom>
        Summary
      </Typography>
      <Typography sx={{ mt: 2 }}>{summary.summary}</Typography>
    </>
  );
};

export default SummaryPage;
