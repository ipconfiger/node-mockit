#顾名思义就是用nodejs写的用来mock Http的服务端和客户端的工具

##开发的目的

方便客户端开发人员和服务端开发人员的协作，双方可以通过本工具的配置来协定交互协议，并且可以并行开发，在开发期间可以用mock.js和cli.js分别模拟服务端和客户端。可以提高整个团队的协作效率。

另，如果有诸如开发的API之类，可以在不部署测试服务器的情况下，将配置好的脚本发给合作方，用于辅助接口接入使用。

##使用方法
1. 安装nodejs （必须）
2. sudo npm install https://github.com/ipconfiger/node-mockit.git -g
3. mkdir ./scripts
3. cli -e > ./scripts/test.js
4. mock -s ./scripts  即可启动mock服务端

服务自己会检测配置脚本的变化，并且立即更新，所以修改了测试脚本后不需要重启

用  cli -s 脚本地址 -h 服务根地址  就可以向服务地址提交指定脚本的请求，用于验证服务端实现
比如 cli -s ./scripts -b http://127.0.0.1:25300


##配置文件说明：

    exports.config={
	    name:"test7",   // 接口名，输出错误提示的时候用到
	    url:"/test",    //接口地址
	    request:{       //请求部分配置
	        method:"POST",  //请求的方法
	        headers:{Authorization:"Basic token"}, //请求的header（可选项）
	        type:"body",  //请求的方式，有body,form,get 三个选项后续请求说明中详细说明
	        data:{        //请求的数据
	            name:"alex",
	            password:"XXXX",
	        }
	    },
	    response:{       //返回数据定义
	        content_type:"application/json",     //返回内容类型
	        success:{                            //请求正确时的返回内容
	            rs:true,
	            info:""
	        },
	        error:{                              //请求错误时的返回内容
	            rs:false,
	            error:"error info"
	        }
	    }
	}
	

##请求方式说明：

###body：

通过post发送数据，将请求内容用json序列化后放在body中

###form：

通过form表单发送的数据

###get：

GET请求通过querystring发送数据

##命令参数

    mock -h

    Usage: mock [options]

    Options:

      -h, --help           输出命令说明
      -V, --version        输出版本号
      -s,--scripts [type]  设定脚本所在目录，比如./scripts
      -p,--port [type]     设定服务器工作目录，比如 25300
      -l,--level [type]    设定请求验证级别0=不检测 1=只检测键 2=全检测 默认：1
      


---------------------------------------------------------------------------

    cli --help

    Usage: cli [options]

    Options:

      -h, --help          输出命令说明
      -V, --version       输出版本号
      -e,--example        输出example配置脚本
      -s,--script [type]  设定脚本所在目录，比如./scripts
      -b,--host [type]    设定服务器地址和端口 [http://127.0.0.1:25300]
