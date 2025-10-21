const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
  // Validate email configuration
  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Email configuration missing! Check your .env file');
    throw new Error('Email configuration is incomplete');
  }

  // Create transporter (simplified structure)
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    secure: false, // use TLS
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // Define email options
  const mailOptions = {
    from: `"BESTEA - Premium Tea Co." <${process.env.EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    html: options.html,
    text: options.text
  };

  // Send email
  try {
    console.log(`📧 Sending email to: ${options.email}`);
    console.log(`📋 Subject: ${options.subject}`);
    
    const info = await transporter.sendMail(mailOptions);
    
    console.log('✅ Email sent successfully!');
    console.log(`📬 Message ID: ${info.messageId}`);
    console.log(`📨 Recipient: ${options.email}`);
    
    return {
      success: true,
      messageId: info.messageId,
      recipient: options.email
    };
  } catch (error) {
    console.error('❌ Email sending failed!');
    console.error('Error details:', error.message);
    console.error('Recipient:', options.email);
    throw error;
  }
};

module.exports = sendEmail;
