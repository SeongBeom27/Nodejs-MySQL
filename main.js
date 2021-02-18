var http = require('http');
var url = require('url');
var qs = require('querystring');
var template = require('./lib/template.js');
var sanitizeHtml = require('sanitize-html');
var db = require('./lib/db');
var topic = require('./lib/topic');
var author = require('./lib/author');

var app = http.createServer(function(request, response) {
    var _url = request.url;
    var queryData = url.parse(_url, true).query;
    var pathname = url.parse(_url, true).pathname;
    /**
     *  아래와 같이 경로로 보내주는 것을 "라우팅" 이라고 한다.
     *  여러 프레임워크에서는 아래와 같이 조건문이 아닌 좀 더 간결하게 사용할 수 있도록  제공해준다.
     */
    if (pathname === '/') {
        if (queryData.id === undefined) {
            // home
            topic.home(response);
        } else {
            topic.page(response, queryData);
        }
    } else if (pathname === '/create') {
        topic.create(response);
    } else if (pathname === '/create_process') {
        topic.create_process(request, response);
    } else if (pathname === '/update') {
        topic.update(response, queryData);
    } else if (pathname === '/update_process') {
        topic.update_process(request, response);
    } else if (pathname === '/delete_process') {
        topic.delete_process(request, response);
    } else if (pathname === '/author') {
        author.home(response);
    } else if (pathname === '/author/create_process') {
        author.create_process(request, response);
    } else if (pathname === '/author/update') {
        author.update(request, response);
    } else if (pathname === '/author/update_process') {
        author.update_process(request, response);
    } else if (pathname === '/author/delete_process') {
        author.delete_process(request, response);
    } else {
        response.writeHead(404);
        response.end('Not found');
    }
});
app.listen(3000);