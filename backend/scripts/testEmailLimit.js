require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmailLimit() {
  console.log('========================================');
  console.log('TESTING EMAIL SERVICE');
  console.log('========================================\n');

  console.log('Email Configuration:');
  console.log('   Host: ' + process.env.EMAIL_HOST);
  console.log('   Port: ' + process.env.EMAIL_PORT);
  console.log('   User: ' + process.env.EMAIL_USER);
  console.log('   Pass: ' + (process.env.EMAIL_PASS ? 'Set' : 'Not Set'));
  console.log('');

  if (!process.env.EMAIL_HOST || !process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.log('ERROR: Email configuration incomplete!');
    process.exit(1);
  }

  const testEmail = process.env.EMAIL_USER;
  
  try {
    console.log('Attempting to send test email...\n');
    
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    const info = await transporter.sendMail({
      from: 'BESTEA - Premium Tea Co. <' + process.env.EMAIL_USER + '>',
      to: testEmail,
      subject: 'Email Service Test - BESTEA',
      html: '<h1>Email Service Working!</h1><p>Your BESTEA email service is working. Test sent at ' + new Date().toLocaleString() + '</p>',
      text: 'Email Service Test - Working. Sent at ' + new Date().toLocaleString()
    });

    console.log('\n========================================');
    console.log('SUCCESS! Email sent successfully!');
    console.log('========================================\n');
    console.log('Details:');
    console.log('   Message ID: ' + info.messageId);
    console.log('   Recipient: ' + testEmail);
    console.log('   Time: ' + new Date().toLocaleString());
    console.log('\nYour email service is working and has NOT exceeded limits!');
    console.log('Check your inbox at: ' + testEmail);
    console.log('');
    process.exit(0);

  } catch (error) {
    console.log('\n========================================');
    console.log('FAILED! Email could not be sent');
    console.log('========================================\n');
    
    const errorMessage = error.message.toLowerCase();
    
    if (errorMessage.includes('quota') || errorMessage.includes('limit') || errorMessage.includes('exceeded')) {
      console.log('REASON: Daily sending limit exceeded');
      console.log('SOLUTION: Wait 24 hours');
      console.log('Gmail Limit: 500 emails/day');
    } else if (errorMessage.includes('authentication') || errorMessage.includes('password')) {
      console.log('REASON: Authentication failed');
      console.log('SOLUTION: Check your App Password');
    } else {
      console.log('Error: ' + error.message);
    }
    
    console.log('\nFull Error:');
    console.log(error);
    process.exit(1);
  }
}

testEmailLimit();
