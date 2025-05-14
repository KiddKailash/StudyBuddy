/**
 * Feature Request Controller
 * 
 * Manages the submission and processing of user feature requests.
 * Provides endpoints for users to submit feedback and feature suggestions.
 * Handles email notification to administrators about new feature requests.
 * Uses nodemailer to format and send detailed request information.
 */
require("dotenv").config();
const nodemailer = require("nodemailer");

/**
 * Submit a feature request
 * 
 * Processes feature requests from authenticated users and sends them
 * via email to administrators. Creates a formatted HTML email with
 * user information and detailed feature descriptions.
 * 
 * @param {Object} req - Express request object with features array in request body
 * @param {Object} res - Express response object
 * @returns {Object} JSON response with success status or error
 */
exports.requestFeature = async (req, res) => {
  try {
    // The authMiddleware populates req.user
    const { firstName, lastName, email } = req.user || {};
    const { features } = req.body;

    // Validate the array
    if (!Array.isArray(features) || features.length === 0) {
      return res
        .status(400)
        .json({
          success: false,
          message: "Features must be a non-empty array.",
        });
    }
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found in token. Please log in again.",
      });
    }

    // Build an HTML table of all requested features
    // Example: enumerating each feature in a row
    const featureRows = features
      .map(
        (f, i) => `
          <tr>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
              Feature ${i + 1}
            </td>
            <td style="padding: 8px; border-bottom: 1px solid #e0e0e0;">
              <strong>Title:</strong> ${f.title}<br/>
              <strong>Description:</strong> ${f.description}
            </td>
          </tr>
        `
      )
      .join("");

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ADDRESS, // e.g. 'myapp@gmail.com'
        pass: process.env.GMAIL_APP_PASS, // 16-char app-specific password
      },
    });

    // Build the email
    const mailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: process.env.ADMIN_EMAIL,
      subject: `StudyBuddy: Feature Request`,
      html: `
        <!DOCTYPE html>
        <html>
          <head>
            <meta charset="UTF-8" />
            <title>New Feature Request</title>
            <style>
              body {
                font-family: 'Roboto', Arial, sans-serif;
                background-color: #f5f5f5;
                margin: 0;
                padding: 0;
              }
              .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 4px;
                box-shadow: 0 2px 5px rgba(0,0,0,0.1);
                overflow: hidden;
              }
              .header {
                background-color: #1976d2;
                padding: 16px;
                color: #ffffff;
              }
              .header h1 {
                margin: 0;
                font-size: 24px;
              }
              .content {
                padding: 16px;
                color: #333;
              }
              .footer {
                background-color: #fafafa;
                padding: 12px 16px;
                text-align: center;
                font-size: 14px;
                color: #999999;
              }
              .features-table {
                width: 100%;
                border-collapse: collapse;
                margin-top: 16px;
              }
              .features-table th, .features-table td {
                text-align: left;
                padding: 8px;
                border-bottom: 1px solid #e0e0e0;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>Feature Request</h1>
              </div>
              <div class="content">
                <table class="features-table">
                  ${featureRows}
                </table>
                 <p><strong>Requested By:</strong> ${firstName} ${lastName}, ${email}</p>
              </div>
              <div class="footer">
                &copy; ${new Date().getFullYear()} StudyBuddy
              </div>
            </div>
          </body>
        </html>
      `,
    };

    await transporter.sendMail(mailOptions);

    return res.status(200).json({
      success: true,
      message: "Feature request(s) sent successfully!",
    });
  } catch (error) {
    console.error("Error sending feature request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send feature request(s).",
    });
  }
};
