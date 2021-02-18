var mysql = require('mysql');

var db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '111111',
    database: 'study'
});

db.connect();

// export 방법 1
module.exports = db;

// export 방법 2