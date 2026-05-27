import nodemailer from "nodemailer";

// Create transporter once (reused)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT),
  secure: process.env.SMTP_SECURE === "true", // true for 465, false for 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // optional (if self-signed certificate issues)
  },
});

export async function sendCredentials(email, fullName, plainPassword, role) {
  const appUrl = process.env.APP_URL || "http://localhost:8000";
  const fromEmail = process.env.SMTP_FROM || process.env.SMTP_USER;

  const textContent = `
Dear ${fullName},

Your SRMSS account has been created.

Email: ${email}
Password: ${plainPassword}
Role: ${role}

Login at: ${appUrl}

Please change your password after first login.

Regards,
SRMSS Team
    `;

  const htmlContent = `
<h2>Welcome to SRMSS</h2>
<p>Dear ${fullName},</p>
<p>Your account has been created with the following credentials:</p>
<ul>
    <li><strong>Email:</strong> ${email}</li>
    <li><strong>Password:</strong> ${plainPassword}</li>
    <li><strong>Role:</strong> ${role}</li>
</ul>
<p>Login at: <a href="${appUrl}">${appUrl}</a></p>
<p>Please change your password after first login.</p>
<p>Regards,<br/>SRMSS Team</p>
    `;

  try {
    const info = await transporter.sendMail({
      from: `"SRMSS System" <${fromEmail}>`,
      to: email,
      subject: "Your SRMSS Account Credentials",
      text: textContent,
      html: htmlContent,
    });
    console.log(`✅ Email sent to ${email} - ID: ${info.messageId}`);
    return true;
  } catch (error) {
    console.error(`❌ Failed to send email to ${email}:`, error.message);
    return false;
  }
}
