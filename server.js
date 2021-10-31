const express = require("express");
const app = express();
const connectDB = require("./config/db");

// Connect Database
connectDB();

app.use(express.json({ extended: false }));

// routes
app.use("/api/students", require("./routes/students"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/mock", require("./routes/mock"));

module.exports = app;
