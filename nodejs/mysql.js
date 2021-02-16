var mysql = require('mysql');
// 접속하기 위한 정보를 전달해야 인증이 된다.
var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'study'
});

connection.connect();

connection.query('SELECT * FROM topic', function(error, results, fields) {
    if (error) throw error;
    console.log(results);
});

connection.end();