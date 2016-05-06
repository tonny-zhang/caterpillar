var util = require('../util')

for (var i = 0; i<2; i++) {
    var str = 'f:/source/shell/caterpillar/bin/caterpillar node f:/source/shell/caterpillar/test/1.js '+i;
    util.command(str, function(err) {
        console.log(err);
    });
    console.log(i, str);
}