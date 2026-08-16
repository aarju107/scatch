const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema({
    fullname: {
        type: String,
        minlength: 3,
        trim: true,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
    },
    products: {
        type: Array,
        default: [],
    },
    contact: {
        type: Number,
    },
    picture: {
        type: String,
    },
    gstin: {
        type: String,
    },
});

module.exports = mongoose.model("Owner", ownerSchema);