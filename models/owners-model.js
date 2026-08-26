const mongoose = require("mongoose");

const ownerSchema = new mongoose.Schema(
    {
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
            trim: true,
            lowercase: true,
        },
        password: {
            type: String,
            required: true,
        },
        products: {
            type: Array,
            default: [],
        },
        contact: Number,
        picture: String,
        gstin: String,
    },
    { timestamps: true }
);

module.exports = mongoose.model("Owner", ownerSchema);
