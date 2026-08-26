const jwt = require("jsonwebtoken");

const JWT_KEY = process.env.JWT_KEY;

if (!JWT_KEY) {
    console.warn("JWT_KEY is not set — authentication will fail");
}

// Shared cookie options so every auth cookie is set the same way.
const cookieOptions = {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

const generateToken = (doc) =>
    jwt.sign({ email: doc.email, id: doc._id }, JWT_KEY, { expiresIn: "7d" });

module.exports = { generateToken, cookieOptions };
module.exports.generateToken = generateToken;
module.exports.cookieOptions = cookieOptions;