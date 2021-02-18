var template = require('./template.js');
var db = require('./db');
var qs = require('querystring');
var url = require('url');
const { request } = require('http');

exports.home = function(response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            var title = 'author';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `
                ${template.authorTable(authors)}
                <style>
                    table{
                        border-collapse: collapse;
                    }
                    td{
                        border:1px solid black;
                    }
                </style>
                <form action="/author/create_process" method="post">
                <p>
                    <input type="text" name="name" placeholder="name">
                </p>
                <p>
                <textarea name="profile" placeholder="description"></textarea>
                </p>
                <p>
                <input type="submit" value="Author create">
                </p>
                
                </p>
                </form>
                `,
                ``
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function(request, response) {
    let body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`
          insert into author (name, profile) 
          values(?, ?)`, [post.name, post.profile], // 1 : author id
            function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/author` });
                response.end();
            }
        )
    })
}

exports.update = function(request, response) {
    // 콜백이 여러번 중첩되는 것을 콜백 헬 이라고한다.

    /**
     *  이러한 현상들을 막기 위한 테크닉들을 공부해보자
     *  promise, ... etc.
     */
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            var _url = request.url;
            var queryData = url.parse(_url, true).query;
            db.query(`SELECT * FROM author WHERE id=?`, [queryData.id], function(error3, author) {
                var title = 'author';
                var list = template.list(topics);
                var html = template.HTML(title, list,
                    `
                ${template.authorTable(authors)}
                <style>
                    table{
                        border-collapse: collapse;
                    }
                    td{
                        border:1px solid black;
                    }
                </style>
                <form action="/author/update_process" method="post">
                    <p>
                        <input type="hidden" name="id" value="${queryData.id}">
                    </p>
                    <p>
                        <input type="text" name="name" value="${author[0].name}" placeholder="name">
                    </p>
                    <p>
                        <textarea name="profile" placeholder="description">${author[0].profile}</textarea>
                    </p>
                    <p>
                        <input type="submit" value="update">
                    </p>
                </form>
                `,
                    ``
                );
                response.writeHead(200);
                response.end(html);
            });

        });
    });
}

exports.update_process = function(request, response) {
    let body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`
          update author set name=?, profile=? where id=?`, [post.name, post.profile, post.id],
            function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/author` });
                response.end();
            }
        )
    })
}

exports.delete_process = function(request, response) {
    let body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`delete from topic where author_id=?`, [post.id],
            function(error1, result1) {
                if (error1) {
                    // 나중에 트랜잭션 기법도 공부하기
                    throw error1;
                }
                db.query(`
                    delete from author where id=?`, [post.id],
                    function(error2, result) {
                        if (error2) {
                            throw error;
                        }
                        response.writeHead(302, { Location: `/author` });
                        response.end();
                    }
                )
            })
    })
}