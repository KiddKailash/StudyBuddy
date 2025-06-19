/**
 * User Report Generator Script
 * 
 * Automated script that generates and sends user statistics reports via email.
 * Connects to the StudyBuddy MongoDB database, retrieves user analytics,
 * and sends a professionally styled HTML email report to administrators.
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const { connectDB } = require('../database/db'); // Adjust path if needed

/**
 * Main execution function that generates and sends user statistics report.
 * 
 * Orchestrates the entire report generation process including database
 * connection, data retrieval, email formatting, and delivery. Uses
 * immediately invoked async function for top-level await support.
 * 
 * Process Flow:
 * 1. Establishes database connection using connectDB utility
 * 2. Retrieves user statistics from users collection
 * 3. Configures nodemailer transporter with Gmail SMTP
 * 4. Generates styled HTML email with user analytics
 * 5. Sends email report to administrator
 * 6. Handles success/failure with appropriate exit codes
 * 
 * @async
 * @function main
 * @returns {Promise<void>}
 * @throws {Error} If database connection, email sending, or other operations fail
 */
(async function main() {
  try {
    // Step 1: Establish database connection and get users collection
    const db = await connectDB();
    const usersCollection = db.collection('users');

    // Step 2: Retrieve user analytics from database
    // Count total users and paid subscribers for reporting
    const totalUsers = await usersCollection.countDocuments();
    const paidUsers = await usersCollection.countDocuments({ accountType: 'paid' });

    // Step 3: Configure email transporter using Gmail SMTP
    // Uses Gmail App Password for secure authentication
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,    // Gmail account for sending
        pass: process.env.GMAIL_APP_PASS,   // 16-character App Password
      },
    });

    // Step 4: Create professionally styled HTML email with user statistics
    // Uses MUI-like design system for consistent branding
    const mailOptions = {
      from: process.env.GMAIL_ADDRESS,
      to: process.env.ADMIN_EMAIL,
      subject: `StudyBuddy User Report - ${totalUsers}`,
      html: `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8" />
          <title>User Report</title>
          <style>
            /* MUI-inspired styling for professional appearance */
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
              box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
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
            }
            .content h2 {
              margin-top: 0;
              color: #333;
            }
            .report-table {
              width: 100%;
              border-collapse: collapse;
              margin: 16px 0;
            }
            .report-table th,
            .report-table td {
              text-align: left;
              padding: 12px 8px;
              border-bottom: 1px solid #e0e0e0;
            }
            .footer {
              background-color: #fafafa;
              padding: 12px 16px;
              text-align: center;
              font-size: 14px;
              color: #999999;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>User Report</h1>
            </div>
            <div class="content">
              <p>Here is the latest user report from the StudyBuddy database:</p>
              <table class="report-table">
                <tr>
                  <th>Total Users</th>
                  <td>${totalUsers}</td>
                </tr>
                <tr>
                  <th>Paid Users</th>
                  <td>${paidUsers}</td>
                </tr>
              </table>
              <p>Make these numbers bigger this week.</p>
            </div>
            <div class="footer">
              &copy; ${new Date().getFullYear()} StudyBuddy
            </div>
          </div>
        </body>
      </html>
      `,
    };

    // Step 5: Send the email report to administrator
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');

    // Exit process with success code (0) on completion
    process.exit(0);
  } catch (error) {
    // Handle any errors during execution and exit with failure code (1)
    console.error('Error:', error);
    process.exit(1);
  }
})();
