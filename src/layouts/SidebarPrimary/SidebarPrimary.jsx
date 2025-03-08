import React, { useContext, useState } from "react";
import { useNavigate } from "react-router-dom";

// MUI Imports
import Stack from "@mui/material/Stack";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import Box from "@mui/material/Box";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import HomeIcon from "@mui/icons-material/Home";
import FolderIcon from "@mui/icons-material/Folder";
import AddIcon from "@mui/icons-material/Add";
import ClearAllRoundedIcon from "@mui/icons-material/ClearAllRounded";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

// Local Imports
import { UserContext } from "../../contexts/UserContext";
import RequestFeature from "../../components/RequestFeature/RequestFeature";
import LanguageSwitcherIMG from "../../components/LanguageSwitcher";
import AvatarMenu from "./AvatarMenu";
import { CheckoutForm } from "../../webpages/stripe/StripeForm";

/**
 * Sidebar that shows:
 *  - Upgrade button if user is not paid
 *  - Home icon
 *  - Folders list
 *  - Create Folder button
 *  - Request Feature
 *  - Language Switcher
 *  - Avatar / Account
 */
const SidebarPrimary = () => {
  const navigate = useNavigate();
  const { user, folders, createFolder, fetchFolders } = useContext(UserContext);

  // Folder creation dialog
  const [openFolderDialog, setOpenFolderDialog] = useState(false);
  const [folderName, setFolderName] = useState("");

  // "Go Pro" modal logic
  const [openGoProModal, setOpenGoProModal] = useState(false);
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("yearly");

  // We’ll store an accountType that passes into StripeForm
  const [accountType, setAccountType] = useState("paid-yearly");

  const isPaidUser = user?.accountType === "paid";

  // ---- Folder Handlers ----
  const handleOpenFolderDialog = () => setOpenFolderDialog(true);
  const handleCloseFolderDialog = () => {
    setOpenFolderDialog(false);
    setFolderName("");
  };

  const handleCreateFolderSubmit = async () => {
    await createFolder(folderName);
    await fetchFolders();
    handleCloseFolderDialog();
  };

  // ---- Go Pro Handlers ----
  const handleOpenGoProModal = () => {
    // Reset in case they closed it mid-checkout
    setShowCheckoutForm(false);
    setBillingPeriod("yearly");
    setAccountType("paid-yearly");
    setOpenGoProModal(true);
  };

  const handleCloseGoProModal = () => {
    // Close entire modal
    setOpenGoProModal(false);
  };

  const handleBillingPeriodChange = (period) => {
    setBillingPeriod(period);
    setAccountType(`paid-${period}`);
    // e.g. "paid-monthly" or "paid-yearly"
  };

  // “Upgrade Now” transitions to embedded Stripe form
  const handleUpgradeNow = () => {
    // Instead of navigating to '/checkout', we load StripeForm
    setShowCheckoutForm(true);
  };

  return (
    <>
      <Stack
        direction="column"
        alignItems="center"
        spacing={2}
        sx={{ height: "100%", pt: 2 }}
      >
        {/* Go Pro Button if user is not paid */}
        {!isPaidUser && (
          <>
            <Tooltip title="Go Pro" placement="right">
              <Box
                sx={{
                  display: "inline-flex",
                  borderRadius: 2,
                  p: "2px", // space for gradient ring
                  background:
                    "linear-gradient(45deg, #ff0080, #ff8c00, #40e0d0)",
                  boxShadow: 6,
                }}
              >
                <IconButton
                  size="large"
                  onClick={handleOpenGoProModal}
                  sx={{
                    borderRadius: 1,
                    width: 40,
                    height: 40,
                    backgroundColor: "#2f2f2f",
                    color: "#fff",
                    "&:hover": {
                      backgroundColor: "#444",
                    },
                  }}
                >
                  <Typography>👑</Typography>
                </IconButton>
              </Box>
            </Tooltip>
            <Divider sx={{ width: "50%" }} />
          </>
        )}

        {/* Home Icon
        <Tooltip title="Home" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/create")}
            sx={{
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <HomeIcon />
          </IconButton>
        </Tooltip> */}

        {/* Divider if user is paid */}
        {/* {isPaidUser && <Divider sx={{ width: "50%" }} />} */}

        {/* "No Folder" item */}
        <Tooltip title="No Folder" placement="right">
          <IconButton
            size="large"
            onClick={() => navigate("/null/create")}
            sx={{
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <ClearAllRoundedIcon />
          </IconButton>
        </Tooltip>

        {/* Folders List */}
        {folders?.map((folder) => (
          <Tooltip key={folder.id} title={folder.folderName} placement="right">
            <IconButton
              size="large"
              onClick={() => navigate(`/${folder.id}/create`)}
              sx={{
                borderRadius: 2,
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <FolderIcon />
            </IconButton>
          </Tooltip>
        ))}

        {/* Create Folder */}
        <Tooltip title="Create Folder" placement="right">
          <IconButton
            size="large"
            onClick={handleOpenFolderDialog}
            sx={{
              borderRadius: 2,
              "&:hover": {
                color: "primary.main",
              },
            }}
          >
            <AddIcon />
          </IconButton>
        </Tooltip>

        {/* Space Filler */}
        <div style={{ flexGrow: 1 }} />

        {/* Request Feature */}
        <Tooltip title="Request Feature" placement="right">
          <Box>
            <RequestFeature />
          </Box>
        </Tooltip>

        {/* Language Switcher */}
        <Tooltip title="Language" placement="right">
          <Box>
            <LanguageSwitcherIMG size="small" />
          </Box>
        </Tooltip>

        {/* Bottom Spacing */}
        <Box sx={{ height: 75 }} />

        {/* Avatar Menu */}
        <AvatarMenu />
      </Stack>

      {/* =============== Create Folder Dialog =============== */}
      <Dialog open={openFolderDialog} onClose={handleCloseFolderDialog}>
        <DialogTitle>New Folder</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Folder Name"
            type="text"
            onChange={(e) => setFolderName(e.target.value)}
            value={folderName}
            fullWidth
          />
        </DialogContent>
        <DialogActions>
          <Button color="error" onClick={handleCloseFolderDialog}>
            Close
          </Button>
          <Button variant="contained" onClick={handleCreateFolderSubmit}>
            Create
          </Button>
        </DialogActions>
      </Dialog>

      {/* =============== Upgrade / Go Pro Dialog =============== */}
      <Dialog
        open={openGoProModal}
        onClose={handleCloseGoProModal}
        fullWidth
        maxWidth="md"
      >
        {!showCheckoutForm ? (
          <>
            <DialogContent sx={{ p: 0 }}>
              <Stack direction="row" spacing={2}>
                {/* LEFT SIDE */}
                <Box sx={{ bgcolor: "background.default", p: 5, m: 2, flexGrow:1 }}>
                  <Box sx={{ my: 5 }}>
                    <Typography
                      variant="h4"
                      gutterBottom
                      sx={{ fontWeight: 600 }}
                    >
                      Get StudyBuddy 30% cheaper
                    </Typography>
                    <Typography variant="subtitle2" gutterBottom>
                      Limited time offer
                    </Typography>
                  </Box>

                  <div style={{ flexGrow: 1 }} />

                  {/* Billing Period Options */}
                  <Stack direction="row" spacing={1}>
                    {/* Yearly Plan */}
                    <Box
                      onClick={() => handleBillingPeriodChange("yearly")}
                      sx={{
                        p: 2,
                        border: 2,
                        borderColor:
                          billingPeriod === "yearly" ? "action" : "grey.300",
                        borderRadius: 2,
                        textAlign: "left",
                        cursor: "pointer",
                        flexGrow: 1,
                      }}
                    >

                      <Typography variant="body2" color="text.secondary">
                        Yearly
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        $4.08/mo
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        $5.83
                      </Typography>
                      <Box
                        sx={{
                          bgcolor: "success.light",
                          opacity: 0.7,
                          borderRadius: 0.5,
                        }}
                      >
                        <Typography
                          variant="caption"
                          sx={{
                            color: "background.default",
                            fontWeight: 600,
                            ml: 1,
                          }}
                        >
                          64% Cheaper
                        </Typography>
                      </Box>
                    </Box>

                    {/* Monthly Plan */}
                    <Box
                      onClick={() => handleBillingPeriodChange("monthly")}
                      sx={{
                        p: 2,
                        border: 2,
                        borderColor:
                          billingPeriod === "monthly" ? "action" : "grey.300",
                        borderRadius: 2,
                        textAlign: "left",
                        cursor: "pointer",
                        minWidth: 100,
                        flexGrow: 1,
                      }}
                    >
                      <Typography variant="body2" color="text.secondary">
                        Monthly
                      </Typography>
                      <Typography variant="h5" fontWeight="bold">
                        $11.19/mo
                      </Typography>
                      <Typography
                        variant="body2"
                        color="text.secondary"
                        sx={{ textDecoration: "line-through" }}
                      >
                        $15.99
                      </Typography>
                    </Box>
                  </Stack>
                  <Button
                    variant="contained"
                    fullWidth
                    onClick={handleUpgradeNow}
                    sx={{ mt: 1, borderRadius: 2}}
                  >
                    Upgrade Now
                  </Button>
                </Box>

                {/*  RIGHT SIDE */}
                <Box sx={{ bgcolor: "background.paper", p: 5, m: 2, flexGrow:1 }}>
                  <Stack spacing={2} direction="column">
                    <Box
                      sx={{
                        backgroundColor: "background.default", // Light gray background
                        borderRadius: 2,
                        p: 3,
                      }}
                    >
                      {/* Header Row */}
                      <Box display="flex" justifyContent="right" mb={2}>
                        <Typography
                          variant="body2"
                          color="text.secondary"
                          fontWeight="bold"
                          sx={{ mr: 3.5 }}
                        >
                          Free
                        </Typography>
                        <Typography
                          variant="body2"
                          color="action"
                          fontWeight="bold"
                        >
                          Pro
                        </Typography>
                      </Box>

                      {/* Features List */}
                      {[
                        "Unlimited chats",
                        "Unlimited spaces",
                        "Unlimited uploads",
                      ].map((feature, index) => (
                        <Box
                          key={index}
                          display="flex"
                          justifyContent="space-between"
                          alignItems="center"
                          mb={1.5}
                        >
                          <Typography variant="body1" sx={{ fontWeight: 500 }}>
                            {feature}
                          </Typography>

                          <Box display="flex" gap={4}>
                            {/* Free Plan: Cross (✖) */}
                            <CloseIcon sx={{ color: "grey.500" }} />

                            {/* Pro Plan: Check (✔) */}
                            <CheckIcon sx={{ color: "green" }} />
                          </Box>
                        </Box>
                      ))}
                    </Box>

                    {/* Example testimonial or rating area (optional) */}
                    <Box
                      sx={{
                        bgcolor: "background.default",
                        p: 3,
                        borderRadius: 2,
                      }}
                    >
                      <Typography variant="body1" fontStyle="italic">
                        StudyBuddy helped me improve my grades dramatically
                      </Typography>
                      <Typography variant="caption">
                        — Michael K. from USA
                      </Typography>
                    </Box>

                    <Stack direction="row" spacing={2} fullWidth>
                      <Box
                        sx={{
                          bgcolor: "background.default",
                          p: 3,
                          borderRadius: 2,
                          flexGrow: 1,
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 500 }}
                        >
                          Trusted by
                        </Typography>
                        <Typography variant="h6" sx={{ fontWeight: 600 }}>
                          350k+
                        </Typography>
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 500 }}
                        >
                          students
                        </Typography>
                      </Box>
                      <Box
                        sx={{
                          bgcolor: "background.default",
                          p: 2,
                          borderRadius: 2,
                          flexGrow: 1,
                        }}
                      >
                        <Typography gutterBottom variant="h4" sx={{ mt: 1 }}>
                          4.9
                        </Typography>
                        <Typography variant="subtitle2">★★★★★</Typography>
                      </Box>
                    </Stack>
                  </Stack>
                </Box>
              </Stack>
            </DialogContent>
          </>
        ) : (
          <>
            <DialogContent>
              {/* 
                The Embedded StripeForm. 
                accountType might be "paid-monthly" or "paid-yearly" 
                so your backend can create the correct Stripe Checkout session.
              */}
              <CheckoutForm accountType={accountType} />
              <Box mt={2} display="flex" justifyContent="center">
                <CircularProgress color="inherit" sx={{ display: "none" }} />
                {/* You can remove or show a spinner if needed. 
                    The EmbeddedCheckout handles its own loading states. */}
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleCloseGoProModal} color="inherit">
                Close
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </>
  );
};

export default SidebarPrimary;
