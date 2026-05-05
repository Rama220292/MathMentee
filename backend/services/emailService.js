const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

  await transporter.sendMail({
    from: process.env.EMAIL_USER,
    to: email,
    subject: "Verify your MathMentor account",
    html: `
      <h2>Email Verification</h2>
      <p>Click the link below to verify your MathMentor account:</p>
      <a href="${verificationLink}">${verificationLink}</a>
    `,
  });
};

module.exports = { sendVerificationEmail };