var request = require('request');

var modePath = process.argv[2];
var base = process.argv[3];
var config = require(modePath);
var options = {
    url: base + config.config.url,
    method: config.config.request.method
};
if(config.config.request.headers){
    options['headers'] = config.config.request.headers;
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
    if (!error && response.statusCode == 200) {
        var info = JSON.parse(body);
        console.log(info);
    }
}
request(options, callback);