const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const ownerModel = require("../models/owners-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

if (process.env.NODE_ENV === "development") {
    router.post("/create", async (req, res) => { //body se req.body me data aayega, aur create karne ke liye post use kiya hai
        try {
            let owners = await ownerModel.find();

            if (owners.length > 0) {
                return res.status(500).send("You don't have permission to create owner");
            }

            let { fullname, email, password } = req.body;

            let hash = await bcrypt.hash(password, 10);

            let createdOwner = await ownerModel.create({
                fullname,
                email,
                password: hash,
            });

            res.status(201).send(createdOwner);
        } catch (err) {
            res.status(500).send(err.message);
        }
    });
}

// Owner Login Page
router.get("/login", (req, res) => {
    let error = req.flash("error");
    res.render("owner-login", { error, loggedin: false });
});

// Owner Login
router.post("/login", async (req, res) => {
    try {
        let { email, password } = req.body;

        let owner = await ownerModel.findOne({ email }); //js apne aap se true false return karega, agar email match hua to owner object milega, nahi to null milega
        if (!owner) {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/owners/login");
        }

        let result = await bcrypt.compare(password, owner.password);
        if (!result) {
            req.flash("error", "Email or Password is incorrect");
            return res.redirect("/owners/login");
        }

        let token = jwt.sign({ email: owner.email, id: owner._id }, process.env.JWT_KEY);
        res.cookie("ownerToken", token);
        res.redirect("/owners/admin");
    } catch (err) {
        res.status(500).send(err.message);
    }
});

// Owner Logout
router.get("/logout", (req, res) => {
    res.cookie("ownerToken", "");
    res.redirect("/owners/login");
});

router.get("/admin", isOwnerLoggedIn, (req, res) => {
    let success = req.flash("success");
    res.render("createproducts", { success });
});

module.exports = router;
