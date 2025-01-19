require('dotenv').config();
const nodemailer = require('nodemailer');
const { connectDB } = require('../database/db'); // Adjust path if needed

(async function main() {
  try {
    // 1. Connect to the database
    const db = await connectDB();
    const usersCollection = db.collection('users');

    // 2. Get user counts
    const totalUsers = await usersCollection.countDocuments();
    const paidUsers = await usersCollection.countDocuments({ accountType: 'paid' });

    // 3. Create Nodemailer transporter using your Gmail + App Password
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
      subject: 'User Report: StudyBuddy App',
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
              <h1>StudyBuddy User Report</h1>
            </div>
            <div class="content">
              <h2>Hello Admin,</h2>
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
              <p>Best regards,<br/>Your StudyBuddy App</p>
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
    console.log('Email sent successfully:', info.response);

    // Optionally exit or close DB connection
    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
})();
