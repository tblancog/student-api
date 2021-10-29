const express = require("express");
const app = express();
const server = require("./server.js");

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => console.log(`Server listing at ${PORT}`));

module.export = app;
