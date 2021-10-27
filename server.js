const express = require("express");
const connectDB = require("./config/db");
const app = express();

// Connect Database
connectDB();

app.use(express.json({ extended: false }));

// routes
app.use("/api/students", require("./routes/students"));
// app.use("api/courses", require("./routes/courses"));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server listing at ${PORT}`));
