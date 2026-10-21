const express = require("express");
const cors = require("cors");
const connectDB = require("./config/db");
const authRoutes = require("./routes/auth");
const app = express();
require("dotenv").config();

app.use(cors({
  origin: "http://localhost:5173",
}));

app.use(express.json());

app.use("/api/auth", authRoutes);

// Define startServer
async function startServer() {
  try {
    // Connect to MongoDB
    await connectDB();

    // Start Express
    const PORT = process.env.PORT || 5000;

    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Server startup failed:", error.message);
    process.exit(1);
  }
}

startServer();