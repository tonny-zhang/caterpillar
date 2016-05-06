var fs = require('fs')

var file = fs.openSync('./1.js', 'r');
var bf = new Buffer(1024);

var bf_read = fs.readSync(file, bf, 0, bf.length, 0);
console.log(typeof bf_read);

console.log(bf_read.toString());
console.log(bf.slice(0, bf_read).toString());

var util = require('../util')

var num_read = 0;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;

var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;

var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;
var result = util.file.readLine('./1.js', num_read, 3);
console.log(result);
num_read = result.num_read_to;