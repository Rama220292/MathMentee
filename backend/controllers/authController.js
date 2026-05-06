const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/User");
const { sendVerificationEmail } = require("../services/emailService");

const saltRounds = 11;

const signup = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ err: "Email already registered" });
    }

    const hashedPassword = bcrypt.hashSync(password, saltRounds);

    // const verificationToken = crypto.randomBytes(32).toString("hex");
    // const verificationTokenExpiry = new Date(
    //   Date.now() + 60 * 60 * 1000 // 1 hour
    // );

    const user = await User.create({
      name,
      email,
      hashedPassword,
      role,
      isVerified: true,
      // verificationToken,
      // verificationTokenExpiry
    });

    // await sendVerificationEmail(user.email, verificationToken);

    res.status(201).json({
      message: "Account created. Please check your email to verify."
    });

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ err: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(403).json({ err: "Please verify your email first" });
    }

    const isMatch = bcrypt.compareSync(password, user.hashedPassword);
    if (!isMatch) {
      return res.status(401).json({ err: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "24h" }
    );

     res.json({ token,
      user: {
        id: user._id,
        role: user.role,
        email: user.email
      }
    });

  } catch (err) {
    res.status(500).json({ err: err.message });
  }
};


// const verifyEmail = async (req, res) => {
//   try {
//     const { token } = req.query;

//     const user = await User.findOne({
//       verificationToken: token,
//       verificationTokenExpiry: { $gt: new Date() }
//     });

//     if (!user) {
//       return res.status(400).json({ err: "Invalid or expired token" });
//     }

//     user.isVerified = true;
//     user.verificationToken = null;
//     user.verificationTokenExpiry = null;

//     await user.save();

//     res.json({ message: "Email verified successfully" });

//   } catch (err) {
//     res.status(500).json({ err: err.message });
//   }
// };

module.exports = { signup, login };
