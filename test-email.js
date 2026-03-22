require('dotenv').config();
const nodemailer = require('nodemailer');

async function testEmail() {
  console.log("Starting email test...");
  
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("Missing credentials in .env");
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });

  const mailOptions = {
    from: `"Pathforge System" <${process.env.EMAIL_USER}>`,
    to: 'thakurhimanshu830@gmail.com', // sending it straight to the user!
    subject: 'IT WORKS! Your Pathforge Reset System is Online!',
    html: `
      <div style="font-family: Arial, sans-serif; background-color: #0d0f1a; color: #fff; max-width: 600px; margin: 0 auto; padding: 30px; border-radius: 12px; border: 1px solid #ffffff15;">
        <h1 style="color: #00ff88; font-size: 24px;">Connection Verified!</h1>
        <p style="color: #b0b5c1; font-size: 16px; line-height: 1.5;">This is a test email sent straight from your VSCode Terminal! Your Nodemailer code is fully working, and the Google App Password is correct. The reset password button on your website will now do exactly this.</p>
      </div>
    `
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log("Success! Email sent to " + mailOptions.to);
  } catch (error) {
    console.error("Failed to send email:", error.message);
  }
}

testEmail();
