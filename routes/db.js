var mysql = require("mysql");
var db = mysql.createConnection({
  host: "localhost",
  user: "dbid231",
  password: "dbpass231",
  database: "db23108",
});
db.connect();
module.exports = db;
