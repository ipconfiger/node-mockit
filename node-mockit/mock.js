#!/usr/bin/env node

var http = require("http");
var fs = require('fs');
var url = require("url");
var querystring = require("querystring");
var program = require('commander');

var scripts = [];

program
.version('0.0.1')
.option('-s,--scripts [type]', 'Specify path of scripts [./scripts]', '')
.option('-p,--port [type]', 'Specify working port [25300]', '25300')
.option('-l,--level [type]', 'Specify result checking level 0=no checking 1=check only keys 2=full check[1]', '1')
.parse(process.argv);

var script_base = '';
if (program.scripts == ''){
    console.log('option -s, --script must specified!');
    process.exit(1);
}else{
    script_base = program.scripts;
}

var working_port = parseInt(program.port);

var checking_level = parseInt(program.level);


function getAllFiles(root) {
  var result = [], files = fs.readdirSync(root);
  files.forEach(function(file) {
    var pathname = root+ "/" + file
      , stat = fs.lstatSync(pathname)
    if (stat === undefined) return
    if (!stat.isDirectory()) {
        if(pathname.substr(pathname.length-3)==".js"){
            result.push(pathname)
        }
    } else {
      result = result.concat(getAllFiles(pathname))
    }
  });
  return result
}

function loadScript(){
    scripts = [];
    for(var p in require.cache){
        if(p.substr(p.length-7)!="moke.js"){
            delete require.cache[p];
        }
    }
    var files = getAllFiles(script_base);
    for(var file in files){
        var path = files[file];
        var config = require(path);
        scripts.push(config.config);
    }
}

loadScript();

function reloadChecker(){
    setTimeout(function(){
        var editFiles = checkFile();
        if(editFiles.length>0){
            loadScript();
        }
        reloadChecker();
    }, 2000);
}

function checkFile(){
    var checktime=new Date().getTime();
    var files = getAllFiles(script_base);
    var edited = [];
    files.filter(function(item, idx){
        var stat = fs.lstatSync(item);
        if (stat === undefined) return
        if((checktime-stat.mtime.getTime())<2*1000){
            edited.push(item);
        }
    });
    return edited;
}

function routeToScript(request){
    var objectUrl = url.parse(request.url);
    for(var idx in scripts){
        if(scripts[idx].url==objectUrl.pathname){
            return scripts[idx];
        }
    }
    return null;
}

function prepareResponse(response, code, contentType, data){
    response.writeHead(code, {"Content-Type": contentType});
    response.write(JSON.stringify(data));
    response.end();
}

function getPOST(request, callback){
    var postData = "";
    request.setEncoding("utf8");
    request.on("data", function(data) {
        postData += data;
    });
    request.on("end", function() {
        if (callback) {
            callback(postData);
        }
    });

}

function processRequest(request, script, callback){
    if (request.method!=script.request.method) {
        callback({error:'invalid method'});
        return;
    }
    if (script.request.headers) {
        if (request.headers===undefined) {
            callback(script.response.error);
            console.log(script.name + ":invalid header "+ ppt + " missing");
            return;
        }
        for(var ppt in script.request.headers){
            var property = ppt.toLowerCase();
            var value = script.request.headers[ppt];
            if (request.headers[property]) {
                if (request.headers[property]==value) {

                }else{
                    callback(script.response.error);
                    console.log(script.name + ":invalid header "+ ppt + " " + value +" need but got " + request.headers[ppt]);
                    return;
                }
            }else{
                callback(script.response.error);
                console.log(script.name + ":invalid header "+ ppt + " missing");
                return;
            }
        }
    }

    if (script.request.type=='form') {
        getPOST(request, function(data){
            var formData = querystring.parse(data);
            validateDict(formData, script, callback);
        });
        return;
    }
    if (script.request.type=='body') {
        getPOST(request, function(data){
            try{
                var body = JSON.parse(data);
                validateDict(body, script, callback);
            }catch(e){
                callback(script.response.error);
                console.log(script.name + ":invalid body format with:" + data);
                return;
            }
        });
        return;
    }
    if (script.request.type=='get') {
        var objectUrl = url.parse(request.url);
	    var objectQuery = querystring.parse(objectUrl.query);
        validateDict(objectQuery, script, callback);
        return;
    }
    if (script.request.type=='redirect') {
        var objectUrl = url.parse(request.url);
        var objectQuery = querystring.parse(objectUrl.query);
        console.log(objectQuery);
        return;
    }
}

function validateDict(requestDict, script, callback){
    if (checking_level<1){
        callback(script.response.success);
        return;
    }

    var tarDict = script.request.data;
    var error = [];
    for(var ppt in tarDict){
        var value = tarDict[ppt];
        if (requestDict[ppt]) {
            if (requestDict[ppt]==value) {
                //正确的就什么都不做
            }else{
                if (checking_level>1){
                    error.push(ppt+" needs "+ value+" but "+requestDict[ppt]+" got");
                }
            }
        }else{
            error.push(ppt+" required");
        }
    }
    if (error.length>0) {
        callback(script.response.error);
        console.log(">---------------------------------\n" + script.name+":\n" + error.join("\n"));
        return;
    }
    callback(script.response.success);
}

reloadChecker();
console.log("mock server starting at 0.0.0.0:" + working_port);
http.createServer(function(request, response) {
    var script = routeToScript(request);
    if(script==null){
        prepareResponse(response, 404, 'application/json', {error:'script not found'} );
        return;
    }
    //prepareResponse(response, 200, 'application/json', {return:'found script '+script.name } );
    processRequest(request, script, function(data){
        prepareResponse(response, 200, 'application/json', data );
    })

}).listen(working_port);
