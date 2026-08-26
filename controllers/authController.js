const bcrypt = require("bcryptjs");
const userModel = require("../models/user-model");
const { generateToken, cookieOptions } = require("../utils/generateToken");

module.exports.registerUser = async function (req, res) {
    try {
        const fullname = (req.body.fullname || "").trim();
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";

        if (!fullname || !email || !password) {
            req.flash("error", "All fields are required");
            return res.redirect("/");
        }

        if (fullname.length < 3) {
            req.flash("error", "Full name must be at least 3 characters");
            return res.redirect("/");
        }

        if (password.length < 6) {
            req.flash("error", "Password must be at least 6 characters");
            return res.redirect("/");
        }

        const existing = await userModel.findOne({ email });
        if (existing) {
            req.flash("error", "User already exists, please login");
            return res.redirect("/");
        }

        const hash = await bcrypt.hash(password, 10);

        const user = await userModel.create({ fullname, email, password: hash });

        res.cookie("token", generateToken(user), cookieOptions);
        return res.redirect("/shop");
    } catch (err) {
        console.error("registerUser error:", err);
        req.flash("error", "Something went wrong, please try again");
        return res.redirect("/");
    }
};

module.exports.loginUser = async function (req, res) {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";

        const user = await userModel.findOne({ email });
        if (!user) {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/");
        }

        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/");
        }

        res.cookie("token", generateToken(user), cookieOptions);
        return res.redirect("/shop");
    } catch (err) {
        console.error("loginUser error:", err);
        req.flash("error", "Something went wrong, please try again");
        return res.redirect("/");
    }
};

module.exports.logoutUser = function (req, res) {
    res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
    return res.redirect("/");
};