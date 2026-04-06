import nodemailer from 'nodemailer';

/**
 * Send Email via SMTP (Gmail)
 * Note: Requires Gmail App Password (2FA must be on)
 */
const sendEmail = async (options) => {
  // 1. Check if SMTP is configured
  const isConfigured = 
    process.env.SMTP_EMAIL && 
    process.env.SMTP_EMAIL !== 'your_email@gmail.com' &&
    process.env.SMTP_PASSWORD &&
    process.env.SMTP_PASSWORD !== 'your_app_password';

  if (!isConfigured) {
    console.log('--------------------------------------------------');
    console.log('⚠️  SMTP NOT CONFIGURED: Skipping real email send.');
    console.log(`📧  RECIPIENT: ${options.email}`);
    console.log(`🔐  OTP/MESSAGE: ${options.message}`);
    console.log('💡  TO FIX: Update SMTP_EMAIL and SMTP_PASSWORD in .env');
    console.log('--------------------------------------------------');
    return { success: true, mode: 'console' };
  }

  // 2. Transporter Configuration
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD // Must be a 16-character App Password
    }
  });

  // 3. Email Options
  const mailOptions = {
    from: `"${process.env.FROM_NAME || 'Smart Daily Life'}" <${process.env.SMTP_EMAIL}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html || `<p>${options.message.replace(/\n/g, '<br>')}</p>`
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent successfully: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (error) {
    console.error(`❌ SMTP Error: ${error.message}`);
    throw error;
  }
};

export default sendEmail;
