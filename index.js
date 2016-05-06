var fs = require('fs'),
    path = require('path'),
    util = require('./util'),
    os = require('os');

// 行尾结束符
var EOL = os.EOL;
// 最大的执行队列
var NUM_MAX_QUEUE = 50;

// 最新的日志文件
var path_log_last = util.getLogPath();

/**
 * 添加到队列文件
 * 
 * @param {String} str_command 命令行字符串
 */    
function add(str_command) {
    var now = new Date();
    var arr_log = [now.format(), util.md5(now.getTime()+Math.random()), str_command];
    
    util.file.append(path_log_last, arr_log.join('\t')+EOL);
}

function readLine(path_log, num_begin) {
    var obj_result = util.file.readLine(path_log, num_begin, 1);
    if (obj_result.hasNext) {
        var num_read_to = obj_result.num_read_to;
        var obj_stat = util.stat();
        util.stat({
            file: path_log,
            lineNo: (obj_stat.file == path_log? obj_stat.lineNo: 0) + 1,
            byteNo: num_read_to
        });
        cache[path_log] = num_read_to;
    }
    
    return obj_result
}
// 正在执行的个数
var num_running = 0;
var cache = {};


var execAll = function(fn_finish) {
    /**
     * 执行下一个命令
     * 
     * @param {String} path_log 处理的日志路径
     * @param {String} num_begin 处理开始的日志字符号
     */
    return function execNext(path_log, num_begin) {
        var obj_result = readLine(path_log, num_begin);
        var arr_lines = obj_result.lines;
        if (arr_lines.length > 0) {
            var str_line = arr_lines[0];
            var arr_info = str_line.split(/\t/);
            var str_command = arr_info.slice(2).join('\s');
            num_running++;
            // console.log(num_running, str_command);
            // 开始执行命令
            util.command(str_command, function(err, result) {
                // console.log(err, result);
                num_running--;
                // console.log('down', num_running, str_command);
                // 记录相关日志
                var arr_log = [new Date().format(), arr_info[1], err || 'Y'];
                util.file.append(util.getDealLogPath(), arr_log.join('\t')+EOL);
                
                // 单条命令执行完后再启动处理下一条
                execNext(path_log, cache[path_log])
            });
            
            if (obj_result.hasNext && num_running < NUM_MAX_QUEUE) {
                execNext(path_log, cache[path_log] || obj_result.num_read_to)
            }
        } else {
            num_running == 0 && fn_finish && fn_finish();
        }
    }
}
/**
 * 执行主逻辑
 */
function run() {
    var obj_stat = util.stat();
    var path_file_stat = obj_stat.file;
    var num_line = obj_stat.lineNo;
    var num_byte = obj_stat.byteNo;
    
    if (path_file_stat != path_log_last) {
        var path_log_yesterday = util.getLogPath(true);
        if (path_file_stat == path_log_yesterday) {
            execAll(function(params) {
                execAll()(path_log_last, 0);
            })(path_log_yesterday, num_byte);
            // execNext(path_log_yesterday, num_byte, function(params) {
            //     execNext(path_log_last, 0);
            // });
            return;
        }
    }
    execAll()(path_log_last, num_byte);  
}

module.exports = {
    run: run,
    add: add
};