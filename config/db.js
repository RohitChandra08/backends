const mongoose = require("mongoose");

const connectdb = () => {
  mongoose
    .connect(process.env.MONGO_URI)
    .then(() => console.log("MongoDB Connected Successfully"))
    .catch((err) => console.log("MongoDB Connection Error:", err.message));
};

module.exports = connectdb;