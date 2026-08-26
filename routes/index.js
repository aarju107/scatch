const express = require("express");
const router = express.Router();

const isLoggedIn = require("../middlewares/isLoggedIn");
const productModel = require("../models/product-model");
const userModel = require("../models/user-model");

// Home Page
router.get("/", (req, res) => {
    let error = req.flash("error");
    res.render("index", {
        error,
        loggedin: false,
    });
});

// Shop Page
router.get("/shop", isLoggedIn, async (req, res) => {
    console.log("===== SHOP ROUTE HIT =====");

    try {
        let products = await productModel.find();

        console.log("Products:", products);
        console.log("Total Products:", products.length);

        let success = req.flash("success");

        res.render("shop", {
            products,
            success,
        });
    } catch (err) { //error ke liye use hota hai 
        console.log("SHOP ERROR:", err);
        res.status(500).send(err.message);
    }
});

// Cart Page
router.get("/cart", isLoggedIn, async (req, res) => {
    try {
        let user = await userModel
            .findOne({ email: req.user.email }) /////////////////////////////////
            .populate("cart");

        let bill = 0;

        if (user.cart.length > 0) {
            bill =
                Number(user.cart[0].price) +
                20 -
                Number(user.cart[0].discount);
        }

        res.render("cart", {
            user,
            bill,
        });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// Add to Cart
router.get("/addtocart/:productid", isLoggedIn, async (req, res) => { //non static route hai isliye get use kiya hai, aur productid ko params me bheja hai
    try {
        let user = await userModel.findOne({
            email: req.user.email,
        });

        user.cart.push(req.params.productid);
        await user.save(); //push hi kra hai main to save bhi karna padega, warna database me update nahi hoga

        req.flash("success", "Added to cart");
        res.redirect("/shop");
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

// Logout
router.get("/logout", isLoggedIn, (req, res) => {
    res.cookie("token", "");
    req.flash("success", "Logged out successfully");
    res.redirect("/");
});
//account page 
router.get("/account", isLoggedIn, async (req, res) => {
    try {
        let user = await userModel
            .findOne({ email: req.user.email })
            .populate("cart");

        res.render("account", { user });
    } catch (err) {
        console.log(err);
        res.status(500).send(err.message);
    }
});

module.exports = router;