const mongoose = require("mongoose");
const config = require("config");

// Prefer the Atlas URI from .env; fall back to config/development.json (local mongod)
const uri = process.env.MONGODB_URI || config.get("MONGODB_URI");

mongoose
    .connect(uri)
    .then(() => {
        console.log(`MongoDB connected -> ${mongoose.connection.name}`);
    })
    .catch((err) => {
        console.error("MongoDB connection error:", err.message);
    });

module.exports = mongoose.connection;
