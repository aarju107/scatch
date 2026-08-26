const express = require("express");
const router = express.Router();

const upload = require("../config/multer-config");
const productModel = require("../models/product-model");
const isOwnerLoggedIn = require("../middlewares/isOwnerLoggedIn");

router.post("/create", isOwnerLoggedIn, (req, res, next) => {
    upload.single("image")(req, res, async (uploadErr) => {
        if (uploadErr) {
            req.flash("error", uploadErr.message);
            return res.redirect("/owners/admin");
        }

        try {
            const name = (req.body.name || "").trim();
            const price = Number(req.body.price);
            const discount = Number(req.body.discount || 0);

            if (!name || Number.isNaN(price)) {
                req.flash("error", "Product name and a numeric price are required");
                return res.redirect("/owners/admin");
            }

            if (discount > price) {
                req.flash("error", "Discount cannot be greater than the price");
                return res.redirect("/owners/admin");
            }

            const image = req.file
                ? `data:${req.file.mimetype};base64,${req.file.buffer.toString("base64")}`
                : "";

            await productModel.create({
                image,
                name,
                price,
                discount: Number.isNaN(discount) ? 0 : discount,
                bgcolor: (req.body.bgcolor || "").trim() || undefined,
                panelcolor: (req.body.panelcolor || "").trim() || undefined,
                textcolor: (req.body.textcolor || "").trim() || undefined,
            });

            req.flash("success", "Product created successfully");
            res.redirect("/owners/admin");
        } catch (err) {
            next(err);
        }
    });
});

module.exports = router;