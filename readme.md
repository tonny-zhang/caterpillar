## 名字由来
`caterpillar` => 毛毛虫，意为多任务执行队列，防止正在执行的任务堆积，影响系统性能

## 用法
### 加入队列
`bin/caterpillar node 1.js`
> 当执行命令里有输出重定向时，要用字符串，如：
> `bin/caterpillar 'node 1.js >> 1.log'`


### 执行
在计划任务里添加 `*/1 * * * * /usr/bin/flock -xn /var/run/watcherCallback.lock -c 'bin/caterpillar RUN'`
> 要确保锁文件存在且计划任务用户有可写权限

-------------
### 日志说明
* `logs/20160506.log` 为队列日志文件
* `logs/deal_20160506.log` 为队列处理日志文件
* `logs/stat.json` 为队列处理状态文件
> 此文件不可删除

-------------
### 特殊说明
根据服务器资源使用情况可适当调整`index.js`里`NUM_MAX_QUEUE`（最多同时执行的任务队列默认为50）
