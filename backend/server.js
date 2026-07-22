const express = require("express");
const dotenv = require("dotenv");
dotenv.config();
const cors = require("cors");
const app = express();
const PORT = process.env.PORT || 5000;
const allowedOrigins = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(",").map((origin) => origin.trim())
  : true;

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

app.get("/", (req, res) => {
  res.send("API is running");
});

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const questionRoutes = require("./routes/questionRoutes");
app.use("/api/questions", questionRoutes);

const submissionRoutes = require("./routes/submissionRoutes");
app.use("/api/submissions", submissionRoutes);

app.use((req, res) => {
  res.status(404).json({ err: "Route not found" });
});

const connectDB = require("./config/db");

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
};

startServer();
