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
import CircularProgress from "@mui/material/CircularProgress";

// MUI Icons
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";

// Local Import
import { CheckoutForm } from "../../webpages/stripe/StripeForm";

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
    // If you want to reset everything each time the modal closes:
    setShowCheckoutForm(false);
    setBillingPeriod("yearly");
    setAccountType("paid-yearly");

    onClose(); // call parent’s onClose
  };

  return (
    <Dialog open={open} onClose={handleCloseModal} fullWidth maxWidth="md">
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
                }}
              >
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

                <Box sx={{ flexGrow: 1 }} />

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
                  sx={{ mt: 1, borderRadius: 2 }}
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
            {/* The embedded Stripe form: */}
            <CheckoutForm accountType={accountType} />
            <Box
              sx={{
                display: "flex",
                height: "100%",
                width: "100%",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <CircularProgress color="inherit" sx={{}} />
            </Box>
          </DialogContent>

          <DialogActions>
            <Button onClick={handleCloseModal} color="inherit">
              Close
            </Button>
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
