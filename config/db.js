const mongoose = require("mongoose");

// Function to connect to local MongoDB Compass
const connectdb = () => {
  mongoose
    .connect("mongodb://127.0.0.1:27017/drivedb")
    .then(() =>
       console.log("MongoDB Connected Successfully (Local Compass)"))
     .catch((err) => 
      console.log("MongoDB Connection Error:", err));
};

module.exports = connectdb;