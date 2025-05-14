import React, { useState } from "react";
import PropTypes from "prop-types";

// MUI
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";

// MUI Icons
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

// Local Import
import { CheckoutForm } from "../../pages/stripe/StripeForm";
import { DialogTitle } from "@mui/material";

const GoProModal = ({ open, onClose }) => {
  const [showCheckoutForm, setShowCheckoutForm] = useState(false);
  const [billingPeriod, setBillingPeriod] = useState("yearly");
  const [accountType, setAccountType] = useState("paid-yearly");

  const handleBillingPeriodChange = (period) => {
    setBillingPeriod(period);
    setAccountType(`paid-${period}`);
  };

  const handleUpgradeNow = () => {
    // Show the Checkout form instead of re-navigating
    setShowCheckoutForm(true);
  };

  const handleCloseModal = () => {
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleCloseModal}
      maxWidth="md"
      PaperProps={{
        sx: {
          borderRadius: "12px",
        },
      }}
    >
      {!showCheckoutForm ? (
        <>
          <DialogContent sx={{ p: 0 }}>
            <Stack direction="row">
              {/* ------------------- LEFT SIDE ------------------- */}
              <Box
                sx={{
                  bgcolor: "background.default",
                  p: 5,
                  flexGrow: 1,
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <Box sx={{ my: 8 }}>
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
                <Box
                  sx={{
                    bgcolor:
                      billingPeriod === "yearly"
                        ? "success.light"
                        : "text.disabled",
                    borderRadius: 0.5,
                    width: 100,
                    ml: 2,
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
                    30% Cheaper
                  </Typography>
                </Box>
                {/* Billing Period Options */}
                <Stack direction="row" spacing={1}>
                  {/* Yearly Plan */}
                  <Box
                    onClick={() => handleBillingPeriodChange("yearly")}
                    sx={{
                      p: 2,
                      border: 2,
                      borderColor:
                        billingPeriod === "yearly"
                          ? "success.light"
                          : "text.disabled",
                      borderRadius: 2,
                      textAlign: "left",
                      cursor: "pointer",
                      flexGrow: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Yearly
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      $3.15/mo
                    </Typography>
                    <Typography
                      variant="subtitle1"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      $4.10/mo
                    </Typography>
                  </Box>

                  {/* Monthly Plan */}
                  <Box
                    onClick={() => handleBillingPeriodChange("monthly")}
                    sx={{
                      p: 2,
                      border: 2,
                      borderColor:
                        billingPeriod === "monthly"
                          ? "success.light"
                          : "text.disabled",
                      borderRadius: 2,
                      textAlign: "left",
                      cursor: "pointer",
                      minWidth: 100,
                      flexGrow: 1,
                      "&:hover": {
                        backgroundColor: "action.hover",
                      },
                    }}
                  >
                    <Typography variant="body2" color="text.secondary">
                      Monthly
                    </Typography>
                    <Typography variant="h5" fontWeight="bold">
                      $3.95/mo
                    </Typography>
                    <Typography
                      variant="body2"
                      color="text.secondary"
                      sx={{ textDecoration: "line-through" }}
                    >
                      $5.15 /mo
                    </Typography>
                  </Box>
                </Stack>

                <Button
                  variant="contained"
                  fullWidth
                  onClick={handleUpgradeNow}
                  sx={{ mt: 2, borderRadius: 1 }}
                >
                  Upgrade Now
                </Button>
              </Box>

              {/* ------------------- RIGHT SIDE ------------------- */}
              <Box sx={{ bgcolor: "background.paper", p: 5, flexGrow: 1 }}>
                <Stack spacing={2} direction="column">
                  <Box
                    sx={{
                      backgroundColor: "background.default",
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
                          <CloseIcon sx={{ color: "grey.500" }} />
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

                  <Stack direction="row" spacing={2} sx={{ width: "100%" }}>
                    <Box
                      sx={{
                        bgcolor: "background.default",
                        p: 3,
                        borderRadius: 2,
                        flexGrow: 1,
                      }}
                    >
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        Trusted by
                      </Typography>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        350k+
                      </Typography>
                      <Typography variant="subtitle2" sx={{ fontWeight: 500 }}>
                        students
                      </Typography>
                    </Box>
                    <Box
                      sx={{
                        bgcolor: "background.default",
                        p: 3,
                        borderRadius: 2,
                        flexGrow: 1,
                        display: "flex",
                        flexDirection: "column",
                      }}
                    >
                      <div style={{ flexGrow: 1 }} />
                      <Box sx={{}}>
                        <Typography variant="h5" sx={{ fontWeight: 600 }}>
                          4.9
                        </Typography>
                        <Typography variant="subtitle2" color="warning.light">
                          ★★★★★
                        </Typography>
                      </Box>
                    </Box>
                  </Stack>
                </Stack>
              </Box>
            </Stack>
          </DialogContent>
        </>
      ) : (
        <>
          <DialogTitle sx={{ fontWeight: 600 }}>
            Welcome to StudyBuddy Pro!
          </DialogTitle>
          <DialogContent>
            {/* The embedded Stripe form: */}
            <Box sx={{ px: 2 }}>
              <CheckoutForm accountType={accountType} />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button
              onClick={() => setShowCheckoutForm(false)}
              color="inherit"
              sx={{ ml: 1 }}
            >
              Back
            </Button>
            <div style={{ flexGrow: 1 }} />
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

GoProModal.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
};

export default GoProModal;
