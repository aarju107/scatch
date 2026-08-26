const express = require("express");
const path = require("path");
require("dotenv").config();

const flash = require("connect-flash");
const cookieSession = require("cookie-session");
const cookieParser = require("cookie-parser");

require("./config/mongoose-connection");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/usersRouter");
const ownersRouter = require("./routes/ownersRouter");
const productsRouter = require("./routes/productsRouter");

const app = express();

// Behind Vercel's proxy — needed for secure cookies / correct protocol
app.set("trust proxy", 1);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Cookie-backed session: survives serverless invocations, unlike MemoryStore.
// Only used to carry flash messages across redirects.
app.use(
    cookieSession({
        name: "scatch.sid",
        keys: [process.env.EXPRESS_SESSION_SECRET || "mysecretkey"],
        maxAge: 24 * 60 * 60 * 1000,
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
    })
);

app.use(flash());

app.use(express.static(path.join(__dirname, "public")));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use("/", indexRouter);
app.use("/owners", ownersRouter);
app.use("/users", usersRouter);
app.use("/products", productsRouter);

// 404
app.use((req, res) => {
    res.status(404).send("Page not found");
});

// Central error handler — nothing crashes the process any more
app.use((err, req, res, next) => {
    console.error("Unhandled error:", err);
    res.status(500).send("Something went wrong. Please try again.");
});

// Only listen when run directly (local dev). On Vercel the app is imported
// by api/index.js and invoked as a serverless function instead.
if (require.main === module) {
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
        console.log(`Server running on http://localhost:${PORT}`);
    });
}

module.exports = app;