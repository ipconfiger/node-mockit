#!/usr/bin/env node

var request = require('request');

var modePath = process.argv[2];
var base = process.argv[3];

function sendPost(){
if(base==undefined){
    console.log("参数缺失");
    return;
}

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
