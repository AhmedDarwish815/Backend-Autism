import nodemailer from "nodemailer";

if (!process.env.GMAIL_USER || !process.env.GMAIL_PASS) {
  console.warn("⚠️ GMAIL_USER or GMAIL_PASS is not set in environment variables!");
}

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: process.env.GMAIL_USER,
    pass: process.env.GMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds timeout
});

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"Autism App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error) {
    console.error("Nodemailer error:", error);
    throw new Error("Email send failed");
  }
}

export async function sendResetCodeEmail(to: string, code: string) {
  await sendEmail(
    to,
    "Password Reset Code",
    `<h2>Your reset code is: <strong>${code}</strong></h2><p>Valid for 10 minutes.</p>`
  );
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
  await sendEmail(
    to,
    "Verify Your Email",
    `<h2>Welcome! 👋</h2>
    <a href="${link}" style="padding:12px 24px;background:#4F46E5;color:white;text-decoration:none;border-radius:8px;">Verify Email</a>`
  );
}