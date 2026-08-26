const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");

const ownerModel = require("../models/owners-model");
const productModel = require("../models/product-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");
const { generateToken, cookieOptions } = require("../utils/generateToken");

// Bootstrap route — only available locally, and only while no owner exists
if (process.env.NODE_ENV === "development") {
    router.post("/create", async (req, res, next) => {
        try {
            const owners = await ownerModel.find();
            if (owners.length > 0) {
                return res
                    .status(403)
                    .send("An owner already exists — you can't create another");
            }

            const fullname = (req.body.fullname || "").trim();
            const email = (req.body.email || "").trim().toLowerCase();
            const password = req.body.password || "";

            if (!fullname || !email || !password) {
                return res.status(400).send("fullname, email and password are required");
            }

            const hash = await bcrypt.hash(password, 10);
            const createdOwner = await ownerModel.create({
                fullname,
                email,
                password: hash,
            });

            res.status(201).json({
                _id: createdOwner._id,
                fullname: createdOwner.fullname,
                email: createdOwner.email,
            });
        } catch (err) {
            next(err);
        }
    });
}

router.get("/login", (req, res) => {
    res.render("owner-login", { error: req.flash("error"), loggedin: false });
});

router.post("/login", async (req, res, next) => {
    try {
        const email = (req.body.email || "").trim().toLowerCase();
        const password = req.body.password || "";

        const owner = await ownerModel.findOne({ email });
        if (!owner) {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/owners/login");
        }

        const match = await bcrypt.compare(password, owner.password);
        if (!match) {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/owners/login");
        }

        res.cookie("ownerToken", generateToken(owner), cookieOptions);
        res.redirect("/owners/admin");
    } catch (err) {
        next(err);
    }
});

router.get("/logout", (req, res) => {
    res.clearCookie("ownerToken", { ...cookieOptions, maxAge: undefined });
    res.redirect("/owners/login");
});

// Create-product form
router.get("/admin", isOwnerLoggedIn, (req, res) => {
    res.render("createproducts", {
        success: req.flash("success"),
        error: req.flash("error"),
        loggedin: false,
    });
});

// All products, for the owner
router.get("/products", isOwnerLoggedIn, async (req, res, next) => {
    try {
        const products = await productModel.find().sort({ createdAt: -1 });
        res.render("admin", { products, loggedin: false });
    } catch (err) {
        next(err);
    }
});

module.exports = router;