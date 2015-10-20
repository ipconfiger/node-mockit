#!/usr/bin/env node

var request = require('request');
var program = require('commander');
var path = require('path');

program
.version('0.0.1')
.option('-t,--test', 'Print content of test.js, use > to save to file')
.option('-s,--script [type]', 'Specify path of script [./scripts/test.js]', '')
.option('-h,--host [type]', 'Specify host path [http://127.0.0.1:25300]', '')
.parse(process.argv);

if(program.test){
    fp = fs.readFile("./scripts/test/js");
    console.log(fp);
    process.exit(0);
}

if(program.script==''){
    console.log('Option -s, --script must specified');
    process.exit(1);
}

if(program.host==''){
    console.log('Option -h, --host must specified');
    process.exit(1);
}

var modePath = program.script;
modePath = path.resolve(process.cwd(), modePath);
var base = program.host;

function sendPost(){

var config = require(modePath);
var options = {
    url: base + config.config.url,
    method: config.config.request.method
};
console.log(options);
if(config.config.request.headers){
    options['headers'] = config.config.request.headers;
    console.log(config.config.request.headers);
}
if(config.config.request.type=='body'){
    options.body = JSON.stringify(config.config.request.data);
}
if(config.config.request.type=='form'){
    options.form = config.config.request.data;
}
if(config.config.request.type=='get'){
    var data = config.config.request.data;
    var params = [];
    for(var p in data){
        params.push(encodeURIComponent(p) + "=" + encodeURIComponent(data[p]));
    }
    options.url = options.url + "?" + params.join("&");
}

function callback(error, response, body) {
    if (response==undefined) {
        console.log(error+body);
        return
    }
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log(body);
    }else{
        console.log(response.statusCode+" "+error);
        console.log(body);
    }
}
request(options, callback);
}
sendPost();
