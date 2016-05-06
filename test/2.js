var fs = require('fs');

var content = fs.readFileSync('./data.txt').toString();
var arr = content.split(/[\n\r]+/);
var firstLine = arr.shift();
console.log(firstLine);
fs.writeFileSync('./data.txt', arr.join('\n'));