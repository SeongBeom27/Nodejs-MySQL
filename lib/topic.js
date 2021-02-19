// 전체적으로 바깥쪽으로 제공할 때 exports만 사용하면된다.
var db = require('./db');
var template = require('./template');
var qs = require('querystring');

exports.home = function(response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        var title = 'Welcome';
        var description = 'Hello, Node.js';
        var list = template.list(topics);
        var html = template.HTML(title, list,
            `<h2>${title}</h2>${description}`,
            `<a href="/create">create</a>`
        );
        response.writeHead(200);
        response.end(html);
    });
}

exports.page = function(response, queryData) {
    // Detail Content

    // 1. 글 목록 가져오기
    db.query(`SELECT * FROM topic`, function(error, topics) {
        if (error) {
            throw error;
        }
        // -> ? 로 queryData.id가 formatting 되는데 이 때 공격받는 코드를 처리해준다.
        db.query(`SELECT * FROM topic LEFT JOIN author ON topic.author_id=author.id WHERE topic.id=?`, [queryData.id], function(error2, topic) {
            if (error2) {
                throw error2;
            }
            var title = topic[0].title;
            var description = topic[0].description;
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `<h2>${title}</h2>
                        ${description}
                        <p>by ${topic[0].name}</p>
                        `,
                `<a href="/create">create</a>
                 <a href="/update?id=${queryData.id}">update</a>
                 <form action="delete_process" method="post">
                     <input type="hidden" name="id" value="${queryData.id}">
                     <p>
                         <input type="submit" value="Delete Content">
                     </p>
                 </form>`
            );
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create = function(response) {
    db.query(`SELECT * FROM topic`, function(error, topics) {
        db.query(`SELECT * FROM author`, function(error2, authors) {
            var title = 'Create';
            var description = 'Hello, Node.js';
            var list = template.list(topics);
            var html = template.HTML(title, list,
                `
                <form action="/create_process" method="post">
                    <p>
                        <input type="text" name="title" placeholder="title"></p>
                    <p>
                        <textarea name="description" placeholder="description"></textarea>
                    </p>
                    <p>
                        ${template.authorSelect(authors)}
                    </p>
                    <p>
                    <input type="submit">
                    </p>
                </form>
            `, '');
            response.writeHead(200);
            response.end(html);
        });
    });
}

exports.create_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`
          insert into topic (title, description, created, author_id) 
          values(?, ?, NOW(), ?)`, [post.title, post.description, post.author], // 1 : author id
            function(error, result) {
                if (error) {
                    throw error;
                }
                response.writeHead(302, { Location: `/?id=${result.insertId}` });
                response.end();
            }
        )
    })
}

exports.update = function(response, queryData) {
    // list를 만들기 위해서 topics도 가져와야 한다.
    db.query(`SELECT * FROM topic`, function(error, topics) {
        if (error) {
            throw error;
        }
        db.query(`SELECT * FROM topic WHERE id=?`, [queryData.id], function(error2, topic) {
            if (error2) {
                throw error2;
            }
            db.query(`SELECT * FROM author`, function(error3, authors) {
                var list = template.list(topics);
                var html = template.HTML(topic[0].title, list,
                    `
                              <form action="/update_process" method="post">
                                <input type="hidden" name="id" value="${topic[0].id}">
                                <p><input type="text" name="title" placeholder="title" value="${topic[0].title}"></p>
                                <p>
                                  <textarea name="description" placeholder="description">${topic[0].description}</textarea>
                                </p>
                                    ${template.authorSelect(authors, topic[0].author_id)}
                                <p>
                                  <input type="submit">
                                </p>
                              </form>
                              `,
                    `<a href="/create">create</a> <a href="/update?id=${topic[0].id}">update</a>`
                );
                response.writeHead(200);
                response.end(html);
            });
        });
    });
}

exports.update_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        db.query(`update topic set title=?, description=?, author_id=? WHERE id=?`, [post.title, post.description, post.author, post.id], function(err, result) {
            if (err) {
                throw err;
            }
            response.writeHead(302, { Location: `/?id=${post.id}` });
            response.end();
        });
    });
}

exports.delete_process = function(request, response) {
    var body = '';
    request.on('data', function(data) {
        body = body + data;
    });
    request.on('end', function() {
        var post = qs.parse(body);
        console.log(post.id);
        db.query(`DELETE FROM author WHERE id=?`, [post.id],
            function(err, result) {
                if (err) {
                    throw err;
                }
                response.writeHead(302, { Location: `/author` });
                response.end();
            });
    });
}