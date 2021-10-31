const express = require("express");
const router = express.Router();
const { initializeDatabase, clearDatabase } = require("../seeds");

// set start data
router.post("/", (_, res) => {
  initializeDatabase();
  res.status(200).send("OK");
});
router.delete("/", (_, res) => {
  clearDatabase();
  res.status(200).send("OK");
});

module.exports = router;
