const mysql = require("mysql");
const config = require("config");

const dbConfig = config.get("dbConfig");
const connection = mysql.createConnection(dbConfig);
connection.connect();

function Query(sql, values) {
  return new Promise((resolve, reject) => {
    const query = connection.query(sql, values, (err, results) => {
      if (err) reject(new Error(err));

      resolve(results);
    });
    console.log(query.sql);
  });
}

module.exports = Query;
