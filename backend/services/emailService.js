const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.error("EMAIL CONFIG ERROR:", error);
  } else {
    console.log("Email server is ready");
  }
});

const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;
  try {
      console.log("Sending email to:", email);
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

  } catch (err) {
    console.error("EMAIL SEND ERROR:", err);
  }
};

// const sendVerificationEmail = async (email, token) => {
//   try {
//     console.log("Sending email to:", email);

//     const verificationLink = `${process.env.FRONTEND_URL}/verify?token=${token}`;

//     const info = await transporter.sendMail({
//       from: process.env.EMAIL_USER,
//       to: email,
//       subject: "Verify your MathMentor account",
//       html: `
//         <h2>Email Verification</h2>
//         <p>Click the link below to verify your MathMentor account:</p>
//         <a href="${verificationLink}">${verificationLink}</a>
//       `,
//     });

//     console.log("Email sent:", info.response);

//   } catch (err) {
//     console.error("EMAIL ERROR:", err);
//   }
// };

module.exports = { sendVerificationEmail };