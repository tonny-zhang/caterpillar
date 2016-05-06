var fs = require('fs'),
    path = require('path'),
	crypto = require('crypto'),
    os = require('os'),
    exec = require('child_process').exec;;

var NUM_LINE_SPLIT = os.EOL.length;
var REG_LINE_SPLIT = new RegExp(os.EOL);  

/*时间格式化*/
Date.prototype.format = Date.prototype.format || function(format,is_not_second){
    format || (format = 'yyyy-MM-dd hh:mm:ss');
    var o = {
        "M{2}" : this.getMonth()+1, //month
        "d{2}" : this.getDate(),    //day
        "h{2}" : this.getHours(),   //hour
        "m{2}" : this.getMinutes(), //minute
        "q{2}" : Math.floor((this.getMonth()+3)/3),  //quarter
    }
    if(!is_not_second){
        o["s{2}"] = this.getSeconds(); //second
        o["S{2}"] = this.getMilliseconds() //millisecond
    }
    if(/(y{4}|y{2})/.test(format)){
        format = format.replace(RegExp.$1,(this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o){
        if(new RegExp("("+ k +")").test(format)){
            format = format.replace(RegExp.$1,RegExp.$1.length==1 ? o[k] :("00"+ o[k]).substr((""+ o[k]).length));
        }
    }

    return format;
}
    
// 日志文件
var path_log = path.join(__dirname, 'logs');
if (!fs.existsSync(path_log)) {
    fs.mkdirSync(path_log);
}

/**
 * 得到日志文件路径
 * 
 * @param {Boolean} b_is_get_yesterday 是否得到前一天日志路径
 */
function getLogPath(b_is_get_yesterday) {
    var now = new Date();
    if (b_is_get_yesterday) {
        now.setDate(now.getDate() - 1);
    }
    
    return path.join(path_log, now.format('yyyyMMdd.log'));
}

/**
 * 得到处理过程日志路径
 */
function getDealLogPath() {
    return path.join(path_log, 'deal_'+(new Date().format('yyyyMMdd.log')));
}
/**
 * 得到或设置状态
 * 
 * @param {Object} obj_stat 状态json对象
 * @returns {Object}
 */
function stat(obj_stat) {
    var path_stat = path.join(path_log, 'stat.json');
    if (obj_stat) {
        fs.writeFileSync(path_stat, JSON.stringify(obj_stat));
        return obj_stat;
    } else {
        delete require.cache[path_stat];
        try {
            return require(path_stat)
        } catch(e) {
            return {
                file: getLogPath(fs.existsSync(getLogPath(true))),
                lineNo: 0,
                byteNo: 0
            };
        }
    }
}

/**
 * 对字符串进行不逆加密
 * 
 * @param {String} str 要加密的明文
 * 
 * @returns {String}
 */
function md5(str) {
    if(str && str.toString){
        return crypto.createHash('sha1').update(str.toString() + 'caterpillar').digest('hex');
    }
    return '';
}

/**
 * 向文件中追加内容
 * 
 * @param {String} path_file 文件路径
 * @param {String} content 要写入的内容
 */
function fileAppend(path_file, content) {
    var file = fs.openSync(path_file, 'a+');
    fs.writeSync(file, content);
    fs.closeSync(file);
}

/**
 * 读取文件的行
 * 
 * @param {String} path_file 要读取的文件路径
 * @param {number} num_start_byte 文件开始的字节位置
 * @param {number} num_line 要读取的行数
 */
function fileReadLine(path_file, num_start_byte, num_line) {
    var file = fs.openSync(path_file, 'r');
    var num_len_bf = 1024;
    var bf = new Buffer(num_len_bf);
    
    var arr_lines_new = [];
    while(true) {
        var num_used = 0;
        var num_readed = fs.readSync(file, bf, 0, num_len_bf, num_start_byte);
        
        if (num_readed == 0) {
            break;
        }
        
        var str_readed = bf.slice(0, num_readed).toString();
        var arr_lines = str_readed.split(REG_LINE_SPLIT);
        var num_len_arr_lines = arr_lines.length;
        if (num_len_arr_lines > 0) {
            var b_break = false;
            for (var i = 0; i<num_len_arr_lines; i++) {
                var str_item = arr_lines[i];
                if (num_line > arr_lines_new.length) {
                    arr_lines_new.push(str_item);
                    num_start_byte += new Buffer(str_item).length + NUM_LINE_SPLIT;
                } else {
                    b_break = true;
                    break;
                }
            }
            if (b_break) {
                break;
            }
        }
        num_start_byte += num_readed;
    }
    
    fs.closeSync(file);
    return {
        lines: arr_lines_new, // 读到的行数据
        num_read_to: num_start_byte, //读到的文件的字节灵敏
        hasNext: num_readed > 0 && arr_lines_new.length > 0 //是否有下一行
    }
}

var NUM_TIME_OUT = 1000*60*5;

/**
 * 执行外部命令
 * 
 * @param {String} str_command 要执行的命令
 * @param {Function} fn_callback 回调函数
 * @param {Number} num_timeout 执行超时时间 (单位是毫秒)
 */
function command(str_command, fn_callback, num_timeout) {
	//这里要捕捉到命令的错误输出，一定不可以把错误重定向
	fn_callback || (fn_callback = function(){});
    // add timeout option
    exec(str_command, {timeout: Number(num_timeout) || NUM_TIME_OUT}, function(error, stdout, stderr){
        if(error || stderr){
            fn_callback(error || stderr);
        }else{
            fn_callback(null, stdout && stdout.replace(/^\s*|\s*$/g,''));
        }
    });
}
module.exports = {
    getLogPath: getLogPath,
    getDealLogPath: getDealLogPath,
    stat: stat,
    md5: md5,
    file: {
        append: fileAppend,
        readLine: fileReadLine
    },
    command: command
}