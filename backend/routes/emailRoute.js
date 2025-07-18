require("dotenv").config();
const express = require("express");
const nodemailer = require("nodemailer");
const asyncHandler = require("express-async-handler");

const router = express.Router();

// Setup transporter
const transporter = nodemailer.createTransport({
  service: "gmail",
  host: "smtp.gmail.com",
  port: 587,
  secure: false, // Use TLS
  auth: {
    user: process.env.EMAIL_USER, // Your email
    pass: process.env.EMAIL_PASS, // App password
  },
  tls: {
    rejectUnauthorized: false,
  },
});

// Verify transporter configuration
transporter.verify(function (error, success) {
  if (error) {
    console.error("SMTP connection error:", error);
  } else {
    console.log("SMTP server is ready to send messages");
  }
});

// Send Email API
router.post(
  "/sendEmail",
  asyncHandler(async (req, res) => {
    const { email, text } = req.body;

    if (!email || !text) {
      return res.status(400).json({ message: "Email and text are required" });
    }

    try {
      const info = await transporter.sendMail({
        from: `"Zenith" <${process.env.EMAIL_USER}>`, // Sender name as Zenith
        to: email,
        subject: "New Jobs Added - Check Them Out!",
        text: text,
        html: `<p>${text}</p>`,
        headers: {
          Priority: "high",
        },
      });

      res.status(200).json({
        message: "Email sent successfully",
        messageId: info.messageId,
      });
    } catch (error) {
      console.error("Failed to send email:", error);
      res.status(500).json({
        message: "Failed to send email",
        error: error.message,
      });
    }
  })
);

// Test Email API
router.get(
  "/testEmail",
  asyncHandler(async (req, res) => {
    try {
      const info = await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: process.env.EMAIL_USER, // Send to yourself for testing
        subject: "Test Email",
        text: "This is a test email to verify the email service is working.",
      });

      res.status(200).json({
        message: "Test email sent successfully",
        messageId: info.messageId,
      });
    } catch (error) {
      console.error("Test email failed:", error);
      res.status(500).json({
        message: "Test email failed",
        error: error.message,
      });
    }
  })
);

module.exports = router;