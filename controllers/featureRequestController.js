require("dotenv").config();
const nodemailer = require("nodemailer");

exports.requestFeature = async (req, res) => {
  try {
    // The authMiddleware should populate req.user
    const { firstName, lastName, email } = req.user || {};
    const { title, description } = req.body;

    // Basic validation
    if (!title || !description) {
      return res
        .status(400)
        .json({ success: false, message: "Title and description are required." });
    }
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "User not found in token. Please log in again.",
      });
    }

    // Create Nodemailer transporter
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_ADDRESS, // e.g. 'myapp@gmail.com'
        pass: process.env.GMAIL_APP_PASS, // 16-character app-specific password
      },
    });

    // MUI-like styling for the HTML
    const mailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: process.env.ADMIN_EMAIL,
      subject: `StudyBuddy Feature Request: ${title}`,
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
            .content h2 {
              margin-top: 0;
            }
            .info-table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            .info-table th,
            .info-table td {
              text-align: left;
              padding: 8px;
              border-bottom: 1px solid #e0e0e0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>StudyBuddy Feature Request</h1>
            </div>
            <div class="content">
              <h2>New Feature Requested</h2>
              <table class="info-table">
                <tr>
                  <th>Title</th>
                  <td>${title}</td>
                </tr>
                <tr>
                  <th>Description</th>
                  <td>${description}</td>
                </tr>
                <tr>
                  <th>Requested By</th>
                  <td>${firstName} ${lastName} &lt;${email}&gt;</td>
                </tr>
              </table>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} StudyBuddy
            </div>
          </div>
        </body>
      </html>
      `,
    };

    // Send the email
    await transporter.sendMail(mailOptions);

    // Respond to the client
    return res.status(200).json({
      success: true,
      message: "Feature request sent successfully!",
    });
  } catch (error) {
    console.error("Error sending feature request:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send feature request.",
    });
  }
};
