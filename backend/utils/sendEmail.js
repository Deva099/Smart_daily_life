import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
  let transporter;
  
  // Use real SMTP credentials if provided in .env
  if (process.env.SMTP_EMAIL && process.env.SMTP_PASSWORD && process.env.SMTP_EMAIL !== 'your_email@gmail.com') {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.SMTP_EMAIL,
        pass: process.env.SMTP_PASSWORD // App Password
      }
    });
  } else {
    // Development Fallback: Just log to console to prevent hangs and network dependency
    console.log('--- DEVELOPMENT MODE: Skipping real email send ---');
    console.log('--- SUBJECT:', options.subject);
    console.log('--- TO:', options.email);
    console.log('--- MESSAGE:', options.message);
    return { messageId: 'dev-mode-mock-id' }; 
  }

  const message = {
    from: `${process.env.FROM_NAME || 'Smart Daily Life'} <${process.env.FROM_EMAIL || 'noreply@smartdailylife.com'}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html
  };

  const info = await transporter.sendMail(message);

  console.log('Email sent: %s', info.messageId);
  // Log the URL where the email can be previewed if using ethereal
  if (!process.env.SMTP_HOST) {
     console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
     console.log('--- Development Console Alert: Check the URL above to see the email content ---');
  }
};

export default sendEmail;
