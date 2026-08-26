const jwt = require("jsonwebtoken");
const userModel = require("../models/user-model");

module.exports = async (req, res, next) => {
    try {
        if (!req.cookies.token) {
            req.flash("error", "You need to login first");
            return res.redirect("/");
        }

        const decoded = jwt.verify(req.cookies.token, process.env.JWT_KEY);

        const user = await userModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!user) {
            req.flash("error", "User not found");
            return res.redirect("/");
        }

        req.user = user;
        next();
    } catch (err) {
        console.error("isLoggedIn error:", err.message);
        req.flash("error", "You need to login first");
        return res.redirect("/");
    }
};