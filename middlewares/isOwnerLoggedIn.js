const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");

module.exports = async (req, res, next) => {
    try {
        if (!req.cookies.ownerToken) {
            req.flash("error", "You need to login first");
            return res.redirect("/owners/login");
        }

        const decoded = jwt.verify(req.cookies.ownerToken, process.env.JWT_KEY);

        const owner = await ownerModel
            .findOne({ email: decoded.email })
            .select("-password");

        if (!owner) {
            req.flash("error", "Owner not found");
            return res.redirect("/owners/login");
        }

        req.owner = owner;
        next();
    } catch (err) {
        console.error("isOwnerLoggedIn error:", err.message);
        req.flash("error", "You need to login first");
        return res.redirect("/owners/login");
    }
};