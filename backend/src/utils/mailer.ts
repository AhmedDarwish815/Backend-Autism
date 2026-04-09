async function sendEmail(to: string, subject: string, html: string) {
  const response = await fetch("https://sandbox.api.mailtrap.io/api/send/4400782", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${process.env.MAILTRAP_TOKEN}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: { email: "hello@demomailtrap.com", name: "Autism App" },
      to: [{ email: to }],
      subject,
      html,
    }),
  });

  if (!response.ok) {
    const err = await response.json();
    console.error("Mailtrap error:", err);
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