const mongoose = require("mongoose");

const productSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            default: "",
        },
        name: {
            type: String,
            required: true,
            trim: true,
        },
        price: {
            type: Number,
            required: true,
            min: 0,
        },
        discount: {
            type: Number,
            default: 0,
            min: 0,
        },
        bgcolor: { type: String, default: "#e5e7eb" },
        panelcolor: { type: String, default: "#f3f4f6" },
        textcolor: { type: String, default: "#111827" },
    },
    { timestamps: true }
);

module.exports = mongoose.model("Product", productSchema);