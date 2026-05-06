const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },

  email: {
    type: String,
    required: true,
    unique: true
  },

  hashedPassword: {
    type: String,
    required: true
  },

  role: {
    type: String,
    enum: ["teacher", "student"],
    required: true
  },

  isVerified: {
    type: Boolean,
    default: true
  },

  verificationToken: String,

  verificationTokenExpiry: Date

}, { timestamps: true });

userSchema.set("toJSON", {
  transform: (document, returnedObject) => {
    delete returnedObject.hashedPassword;
  },
});

module.exports = mongoose.model("User", userSchema);