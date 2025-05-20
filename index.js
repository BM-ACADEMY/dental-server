require("dotenv").config();
const express = require("express");
const cors = require("cors");
const nodemailer = require("nodemailer");

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: "*",
  methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true
}));

app.use(express.json());

// Nodemailer transporter
const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// Email Templates
const getOwnerEmailTemplate = (fullName, email, contactNumber, companyName, message) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
      
      <!-- Header Section -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #007bff;">
        <h2 style="color: #333;">📩 New Contact Form Submission</h2>
      </div>

      <p><strong>Name:</strong> ${fullName}</p>
      <p><strong>Email:</strong> <a href="mailto:${email}" style="color: #007bff;">${email}</a></p>
      <p><strong>Contact Number:</strong> ${contactNumber || "Not provided"}</p>
      <p><strong>Company Name:</strong> ${companyName || "Not provided"}</p>
      <p><strong>Message:</strong></p>
      
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #007bff;">
        <p style="margin: 0;">${message}</p>
      </div>

      <!-- Footer Section -->
    </div>
  </div>
`;

const getUserEmailTemplate = (fullName, message) => `
  <div style="font-family: Arial, sans-serif; background-color: #f4f4f4; padding: 20px;">
    <div style="max-width: 600px; background: #ffffff; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.2);">
      
      <!-- Header Section -->
      <div style="text-align: center; padding-bottom: 20px; border-bottom: 2px solid #28a745;">
        <h2 style="color: #007bff;">✨ Thank You for Contacting Us!</h2>
      </div>

      <p>Dear <strong>${fullName}</strong>,</p>
      <p>Thank you for reaching out! We have received your message and will get back to you shortly.</p>
      
      <p><strong>Your Message:</strong></p>
      <div style="background: #f8f9fa; padding: 15px; border-radius: 5px; border-left: 4px solid #28a745;">
        <p style="margin: 0;">${message}</p>
      </div>

      <p>If you need immediate assistance, please contact us at <a href="mailto:gnrdentistry@gmail.com" style="color: #007bff;">gnrdentistry@gmail.com</a></p>

      <!-- Footer Section -->
  
    </div>
  </div>
`;

// Root route
app.get("/", (req, res) => {
    res.send("Welcome to the GNR Dentistry is Live!!✅");
  });
// Email sending route
app.post("/send-email", async (req, res) => {
  try {
    const { fullName, email, contactNumber, companyName, message } = req.body;

    if (!fullName || !email || !message) {
      return res.status(400).json({ message: "Full name, email, and message are required!" });
    }

    // Admin email
    const ownerMailOptions = {
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: "New Contact Form Submission",
      html: getOwnerEmailTemplate(fullName, email, contactNumber, companyName, message),
    };

    // User confirmation email
    const userMailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Thank You for Contacting Us",
      html: getUserEmailTemplate(fullName, message),
    };

    await transporter.sendMail(ownerMailOptions);
    await transporter.sendMail(userMailOptions);

    res.status(200).json({ message: "Message sent successfully!" });

  } catch (error) {
    console.error("Email Error:", error);
    res.status(500).json({ message: "Failed to send message.", error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`✅ Server is running on port ${PORT}`);
});