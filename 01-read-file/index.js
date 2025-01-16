const fs = require("fs");
const path = require("path");
const stdout = process.stdout;

const file = path.join(__dirname, "text.txt")

const readStream = fs.createReadStream(file);

readStream.on("data", data => stdout.write(data));