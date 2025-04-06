const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const nodemailer = require("nodemailer");
const path = require("path");
const multer = require("multer");

require("dotenv").config();

const Submission = require("./models/Submission");

const app = express();
app.use(cors());
app.use(express.json());
const upload = multer(); 

// ✅ Serve static files from the "public" directory
app.use(express.static("public"));

// DB connect
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("Error connecting to MongoDB:", error));

// Mailer setup
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// API endpoint
app.post("/submit", upload.single("pdf"), async (req, res) => {
  try {
    const { name, email } = req.body;
    const pdfBuffer = req.file.buffer;
    console.log("Form Data being submitted:", req.body); // Log form data to track it

    // Save to DB
    console.log("Saving data to database...");
    const submission = await Submission.create({ name, email });
    console.log("Data saved to database:", submission);

    // Email HTML with banner
    const emailHTML = `
      <div style="font-family: Arial, sans-serif; padding: 20px;">
        <img src="cid:banner" alt="Header Banner" style="width: 100%; max-width: 600px;" />
        <h2>Great news!</h2>
        <p>Your ROI report is ready! It’s attached as a PDF, and shares your online insights to help you make smarter decisions about your Agile toolkit.</p>
        <ul>
          <li>✅ Actionable insights tailored to your team</li>
          <li>📊 Key metrics that impact your bottom line</li>
          <li>🚀 Opportunities to optimize your workflow</li>
        </ul>
        <p>This isn’t just valuable for you—it’s great for your team too! Share the report with your teammates so everyone can align on the insights and take action together.</p>
        <p>Only thing to do now is download, review & share the report.</p>
        <p>Let us know if you have any questions—we’re here to help!</p>
      </div>
    `;

    console.log("Sending email...");
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: email,
      subject: "Your Easy Agile ROI Report is Here — Unlock the Insights",
      html: emailHTML,
      attachments: [
        {
          filename: "roi.pdf",
          content: pdfBuffer,
          contentType: "application/pdf",
        },
        {
          filename: "banner.png",
          path: path.resolve(__dirname, "public/assets/EA_ROI_EDM_Header.png"),
          cid: "banner",
        },
      ],
    });

    console.log("Email sent successfully!");

    res.status(200).json({ message: "Success" });
  } catch (error) {
    console.error("Submission Error:", error);
    res.status(500).json({ error: "Submission failed" });
  }
});

app.listen(process.env.PORT, () => {
  console.log(`Server running on port ${process.env.PORT}`);
});
