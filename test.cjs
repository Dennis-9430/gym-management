const fs = require("fs");
const content = "test content";
fs.writeFileSync("src/hooks/features/test.txt", content);
console.log("ok");
