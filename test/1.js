var fs = require('fs');


var data = 0;

for (var i = 0; i<10; i++) {
    var file = fs.openSync('./data.txt', 'a+');
    console.log(data);
    fs.writeSync(file, data++);
    fs.writeSync(file, '\n');
    var time_start = new Date().getTime();
    while (1) {
        fs.writeSync(file, data++);
        fs.writeSync(file, '\n');
        if (new Date().getTime() - time_start > 2000) {
            break;
        }
    }
    
    fs.closeSync(file);
}
test