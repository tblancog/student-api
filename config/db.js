const mongoose = require("mongoose");
const uri = process.env.MONGO_URI || "mongodb://localhost:27017/students";
const connectDB = async () => {
  try {
    await mongoose.connect(uri);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
};
module.exports = connectDB;
