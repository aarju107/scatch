const express = require("express");
const router = express.Router();
const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

router.post("/create", isOwnerLoggedIn, upload.single("image"), async (req, res) => {
    try {
        let { name, price, discount, bgcolor, panelcolor, textcolor } = req.body;

        let imageDataUrl = "";
        if (req.file) {
            imageDataUrl = `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`;
        }

        await productModel.create({
            image: imageDataUrl,
            name,
            price,
            discount,
            bgcolor,
            panelcolor,
            textcolor,
        });

        req.flash("success", "Product created successfully");
        res.redirect("/owners/admin");
    } catch (err) {
        res.send(err.message);
    }
});

module.exports = router;