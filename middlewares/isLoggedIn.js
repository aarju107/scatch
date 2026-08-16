const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async (req, res, next) => {
    try {
        // Check token
        if (!req.cookies.token) {
            req.flash("error", "You need to login first");
            return res.redirect("/");
        }

        console.log("Token:", req.cookies.token);

        // Verify token
        const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);
        console.log("Decoded:", decoded);

        // Find user
        const user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!user) {
            console.log("User not found");
            req.flash("error", "User not found");
            return res.redirect("/");
        }

        console.log("User Found:", user.email);

        req.user = user;
        next();
    } catch (err) {
        console.log("Middleware Error:", err);
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }
};