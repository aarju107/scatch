const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
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
    },
    discount: {
        type: Number,
        default: 0,
    },
    bgcolor: {
        type: String,
        default: "",
    },
    panelcolor: {
        type: String,
        default: "",
    },
    textcolor: {
        type: String,
        default: "",
    },
});

module.exports = mongoose.model("Product", productSchema);