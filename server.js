const express = require("express");
const app = express();
const connectDB = require("./config/db");

// Connect Database
connectDB();

app.use(express.json({ extended: false }));

// routes
app.get("/api/", (req, res) => {
  const status = 200;
  res.status(status).json({ msg: "Api is online", status });
});
app.use("/api/students", require("./routes/students"));
app.use("/api/courses", require("./routes/courses"));
app.use("/api/mock", require("./routes/mock"));

app.get("*", function (req, res) {
  const status = 404;
  res.status(status).json({ msg: "No route found", status });
});

module.exports = app;
