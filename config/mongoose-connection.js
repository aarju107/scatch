const mongoose = require("mongoose");

const uri = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/scatch";

if (!process.env.MONGODB_URI) {
    console.warn("MONGODB_URI not set — falling back to local mongodb://127.0.0.1:27017/scatch");
}

mongoose.set("strictQuery", true);

// Reuse the connection across warm serverless invocations
let cached = global._mongooseConn;
if (!cached) {
    cached = global._mongooseConn = { conn: null, promise: null };
}

function connectDB() {
    if (cached.conn) return Promise.resolve(cached.conn);

    if (!cached.promise) {
        cached.promise = mongoose
            .connect(uri, { serverSelectionTimeoutMS: 10000 })
            .then((m) => {
                cached.conn = m;
                console.log(`Connected to MongoDB -> ${mongoose.connection.name}`);
                return m;
            })
            .catch((err) => {
                cached.promise = null;
                console.error("Error connecting to MongoDB:", err.message);
                throw err;
            });
    }

    return cached.promise;
}

connectDB().catch(() => {});

module.exports = connectDB;