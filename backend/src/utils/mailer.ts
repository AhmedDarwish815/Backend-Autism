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
} as any);

// Force IPv4
transporter.set("oauth2_provision_cb", undefined);
(transporter.options as any).host = "smtp.gmail.com";
(transporter.options as any).family = 4;

async function sendEmail(to: string, subject: string, html: string) {
  try {
    await transporter.sendMail({
      from: `"Autism App" <${process.env.GMAIL_USER}>`,
      to,
      subject,
      html,
    });
  } catch (error: any) {
    console.error("Nodemailer error:", error);
    throw new Error(`Email send failed: ${error.message || error}`);
  }
}

export async function sendResetCodeEmail(to: string, code: string) {
  await sendEmail(
    to,
    "استعادة كلمة المرور - تطبيق دعم التوحد",
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; direction: rtl; text-align: right;">
      <div style="background-color: #4A90E2; padding: 30px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 24px;">استعادة كلمة المرور 🔒</h1>
      </div>
      <div style="padding: 30px; background-color: #fcfcfc;">
        <p style="font-size: 16px; color: #333; line-height: 1.6;">مرحباً بك،</p>
        <p style="font-size: 16px; color: #555; line-height: 1.6;">
          لقد تلقينا طلباً لإعادة تعيين كلمة المرور الخاصة بحسابك في <strong>تطبيق دعم التوحد</strong>.
        </p>
        <div style="text-align: center; margin: 30px 0;">
          <span style="display: inline-block; padding: 15px 30px; background-color: #EAF2FA; color: #4A90E2; font-size: 28px; font-weight: bold; border-radius: 8px; letter-spacing: 4px;">
            ${code}
          </span>
        </div>
        <p style="font-size: 14px; color: #888; text-align: center;">هذا الكود صالح لمدة 10 دقائق فقط.</p>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 12px; color: #aaa; text-align: center;">إذا لم تقم بطلب هذا الرمز، يُرجى تجاهل هذه الرسالة لحماية حسابك.</p>
      </div>
    </div>
    `
  );
}

export async function sendVerificationEmail(to: string, token: string) {
  const link = `${process.env.APP_URL}/auth/verify-email?token=${token}`;
  await sendEmail(
    to,
    "تأكيد حسابك - تطبيق دعم التوحد",
    `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; border: 1px solid #e0e0e0; border-radius: 12px; overflow: hidden; direction: rtl; text-align: right;">
      <div style="background-color: #6C63FF; padding: 40px 20px; text-align: center;">
        <h1 style="color: white; margin: 0; font-size: 28px;">أهلاً بك في مجتمعنا! 💙</h1>
      </div>
      <div style="padding: 40px 30px; background-color: #ffffff;">
        <p style="font-size: 18px; color: #333; font-weight: bold;">خطوة واحدة للبدء..</p>
        <p style="font-size: 16px; color: #555; line-height: 1.8;">
          نحن سعداء جداً بانضمامك لتطبيقنا المخصص لدعم أطفال التوحد وأسرهم. هدفنا هو توفير بيئة آمنة ومتكاملة لمساعدتك.
        </p>
        <p style="font-size: 16px; color: #555; line-height: 1.8; margin-bottom: 30px;">
          للوصول إلى جميع الميزات، يُرجى تأكيد بريدك الإلكتروني من خلال الضغط على الزر أدناه:
        </p>
        <div style="text-align: center; margin: 40px 0;">
          <a href="${link}" style="display: inline-block; padding: 14px 40px; background-color: #6C63FF; color: white; text-decoration: none; font-size: 18px; font-weight: bold; border-radius: 50px; box-shadow: 0 4px 6px rgba(108, 99, 255, 0.2);">
            تأكيد الحساب الآن
          </a>
        </div>
        <hr style="border: none; border-top: 1px solid #eee; margin: 30px 0;" />
        <p style="font-size: 13px; color: #999; text-align: center;">
          هل تواجه مشكلة مع الزر؟ يمكنك نسخ هذا الرابط ولصقه في متصفحك:<br>
          <a href="${link}" style="color: #6C63FF; word-break: break-all;">${link}</a>
        </p>
      </div>
    </div>
    `
  );
}