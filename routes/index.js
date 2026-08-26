const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");
const { cookieOptions } = require("../utils/generateToken");

const PLATFORM_FEE = 20;

// Home / auth page — send already-logged-in users straight to the shop
router.get("/", (req, res) => {
    if (req.cookies.token) {
        try {
            jwt.verify(req.cookies.token, process.env.JWT_KEY);
            return res.redirect("/shop");
        } catch (err) {
            res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
        }
    }

    res.render("index", {
        error: req.flash("error"),
        loggedin: false,
    });
});

// Shop
router.get("/shop", isLoggedIn, async (req, res, next) => {
    try {
        const sortby = req.query.sortby === "newest" ? { createdAt: -1 } : { price: 1 };

        const products = await productModel.find().sort(sortby);

        res.render("shop", {
            products,
            sortby: req.query.sortby || "popular",
            success: req.flash("success"),
            loggedin: true,
        });
    } catch (err) {
        next(err);
    }
});

// Cart
router.get("/cart", isLoggedIn, async (req, res, next) => {
    try {
        const user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart");

        const items = (user && user.cart) || [];

        const totalMrp = items.reduce((sum, item) => sum + Number(item.price || 0), 0);
        const totalDiscount = items.reduce(
            (sum, item) => sum + Number(item.discount || 0),
            0
        );
        const platformFee = items.length > 0 ? PLATFORM_FEE : 0;
        const bill = totalMrp - totalDiscount + platformFee;

        res.render("cart", {
            user,
            items,
            totalMrp,
            totalDiscount,
            platformFee,
            bill,
            success: req.flash("success"),
            loggedin: true,
        });
    } catch (err) {
        next(err);
    }
});

// Add to cart
router.get("/addtocart/:productid", isLoggedIn, async (req, res, next) => {
    try {
        const { productid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productid)) {
            req.flash("error", "Invalid product");
            return res.redirect("/shop");
        }

        const product = await productModel.findById(productid);
        if (!product) {
            req.flash("error", "Product not found");
            return res.redirect("/shop");
        }

        await userModel.updateOne(
            { _id: req.user._id },
            { $addToSet: { cart: product._id } }
        );

        req.flash("success", "Added to cart");
        res.redirect("/shop");
    } catch (err) {
        next(err);
    }
});

// Remove from cart
router.get("/removefromcart/:productid", isLoggedIn, async (req, res, next) => {
    try {
        const { productid } = req.params;

        if (!mongoose.Types.ObjectId.isValid(productid)) {
            req.flash("error", "Invalid product");
            return res.redirect("/cart");
        }

        await userModel.updateOne({ _id: req.user._id }, { $pull: { cart: productid } });

        req.flash("success", "Removed from cart");
        res.redirect("/cart");
    } catch (err) {
        next(err);
    }
});

// Logout
router.get("/logout", (req, res) => {
    res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
    res.redirect("/");
});

module.exports = router;