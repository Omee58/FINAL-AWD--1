const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Force Node.js to use Google DNS (fixes SRV lookup issues on some routers)
dns.setServers(["8.8.8.8", "8.8.4.4"]);

function connectDB() {
  mongoose
    .connect(process.env.MONGODB_URI)
    .then(() => console.log("MongoDB Connected"))
    .catch((err) => console.error("MongoDB connection error:", err));
}

module.exports = connectDB;
