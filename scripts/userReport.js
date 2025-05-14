/**
 * @fileoverview User Report Generator for StudyBuddy
 * 
 * This script connects to the MongoDB database, retrieves user statistics,
 * and sends a styled email report to the admin email address. The report 
 * includes the total number of users and how many are paid subscribers.
 * 
 * Environment variables required:
 * - DATABASE_URL: MongoDB connection string
 * - GMAIL_ADDRESS: Sender email address (Gmail)
 * - GMAIL_APP_PASS: Gmail App Password (16-character)
 * - ADMIN_EMAIL: Recipient email address
 * 
 * @author StudyBuddy Team
 */

require('dotenv').config();
const nodemailer = require('nodemailer');
const { connectDB } = require('../database/db'); // Adjust path if needed

/**
 * Main execution function that:
 * 1. Connects to the database
 * 2. Retrieves user statistics
 * 3. Formats and sends an email report
 * 
 * @async
 * @function main
 * @returns {Promise<void>}
 */
(async function main() {
  try {
    // 1. Connect to the database
    const db = await connectDB();
    const usersCollection = db.collection('users');

    // 2. Get user counts
    const totalUsers = await usersCollection.countDocuments();
    const paidUsers = await usersCollection.countDocuments({ accountType: 'paid' });

    // 3. Create Nodemailer transporter using Gmail + App Password
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_ADDRESS,    // e.g. 'myapp@gmail.com'
        pass: process.env.GMAIL_APP_PASS,   // 16-character App Password
      },
    });

    // 4. Create a styled HTML email with an MUI-like look
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
            /* Basic MUI-like styling */
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

    // 5. Send the email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent successfully!');

    // Exit process with success code
    process.exit(0);
  } catch (error) {
    // Log any errors and exit with failure code
    console.error('Error:', error);
    process.exit(1);
  }
})();
