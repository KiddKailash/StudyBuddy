import React, { useState, useContext, useEffect } from "react";
import { UserContext } from "../contexts/UserContext";
import { SnackbarContext } from "../contexts/SnackbarContext";
import { useTranslation } from "react-i18next";
import Button from "@mui/material/Button";
import CircularProgress from "@mui/material/CircularProgress";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

const NotionIntegration = () => {
  const [loading, setLoading] = useState(false);
  const [authorized, setAuthorized] = useState(false);
  const [notionContent, setNotionContent] = useState("");
  const [pageId, setPageId] = useState("");
  const { t } = useTranslation();
  const { showSnackbar } = useContext(SnackbarContext);

  // Get user context to interact with the API
  const {
    fetchNotionAuthUrl,
    fetchNotionPageContent,
    isNotionAuthorized
  } = useContext(UserContext);

  useEffect(() => {
    checkAuthorization();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if user is authorized with Notion
  const checkAuthorization = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("user_not_authenticated"));

      const response = await isNotionAuthorized;
      setAuthorized(response.data.authorized);
    } catch (err) {
      console.error("Error checking Notion authorization:", err);
      showSnackbar(
        err.response?.data?.error || t("error_processing_request"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle the Notion authorization process
  const handleAuthorization = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("user_not_authenticated"));

      const response = await fetchNotionAuthUrl(token);
      window.location.href = response.data.url;
    } catch (err) {
      console.error("Error getting Notion authorization URL:", err);
      showSnackbar(
        err.response?.data?.error || t("error_processing_request"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  // Fetch Notion page content by page ID
  const fetchPageContent = async () => {
    if (!pageId.trim()) {
      showSnackbar(t("please_provide_page_id"), "error");
      return;
    }

    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      if (!token) throw new Error(t("user_not_authenticated"));

      const response = await fetchNotionPageContent(token, pageId);
      setNotionContent(response.data.content);
    } catch (err) {
      console.error("Error fetching Notion page content:", err);
      showSnackbar(
        err.response?.data?.error || t("error_processing_request"),
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ mb: 2 }}>
      {authorized ? (
        <Box>
          <Typography variant="body1" sx={{ mb: 2 }}>
            {t("notion_authorized_message")}
          </Typography>
          <Box sx={{ mb: 2 }}>
            <Typography variant="body2" sx={{ mb: 1 }}>
              {t("enter_page_id")}
            </Typography>
            <input
              type="text"
              value={pageId}
              onChange={(e) => setPageId(e.target.value)}
              placeholder={t("notion_page_id_placeholder")}
              style={{ width: "100%", padding: "8px", marginBottom: "8px" }}
            />
            <Button
              variant="outlined"
              color="primary"
              onClick={fetchPageContent}
              fullWidth
              disabled={loading}
            >
              {loading ? (
                <CircularProgress color="inherit" sx={{ m: 2 }} />
              ) : (
                t("fetch_page_content")
              )}
            </Button>
          </Box>
          {notionContent && (
            <Box sx={{ mt: 3 }}>
              <Typography variant="h6">{t("page_content")}</Typography>
              <pre
                style={{
                  background: "#f4f4f4",
                  padding: "10px",
                  borderRadius: "4px",
                  whiteSpace: "pre-wrap",
                }}
              >
                {notionContent}
              </pre>
            </Box>
          )}
        </Box>
      ) : (
        <Box>
          <Button
            variant="outlined"
            fullWidth
            color="primary"
            onClick={handleAuthorization}
            disabled={loading}
          >
            {loading ? (
              <CircularProgress color="inherit" sx={{ m: 2 }} />
            ) : (
              t("authorize_notion")
            )}
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default NotionIntegration;
