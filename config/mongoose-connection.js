const mongoose = require("mongoose");
const config = require("config");

mongoose
    .connect(`${config.get("MONGODB_URI")}/scatch`)
    .then(function () {
        console.log("Connected to MongoDB");
    })
    .catch(function (err) {
        console.error("Error connecting to MongoDB:", err);
    });

module.exports = mongoose.connection;
