const fs = require("fs");
const path = require("path");
const { stdin, stdout } = process;
const file = path.join(__dirname, "text.txt");
const writeStream = fs.createWriteStream(file, { flags: "a" });


stdout.write("Hello, please enter some words\n");
stdin.on("data", (data) => {
    if (data.toString().trim() === "exit") process.exit();
    else writeStream.write(data);
    
})

process.on("exit", () => stdout.write("Thank you for checking the assignment. Good luck"));
process.on("SIGINT", () => {
    process.exit();
})