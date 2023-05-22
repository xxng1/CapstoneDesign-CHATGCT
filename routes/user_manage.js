const express = require("express");
const router = express.Router();
const mysql = require("mysql");
var db = require('./db');
var qs = require("querystring");

function authIsOwner(request, response) {
  if (request.session.is_logined) {
    return true;
  } else {
    return false;
  }
}

router.get("/", (request, response) => {
  db.query(`SELECT * FROM user `, function (error, result) {
    if (error) {
      throw error;
    }
    var context = {
      doc: `user/user_manage.ejs`,
      loggined: authIsOwner(request, response),
      id: request.session.login_id,
      cls: request.session.class,
      results: result,
    };
    request.app.render("user/user_manage.ejs", context, function (err, html) {
      response.end(html);
    });
  });
});



router.get("/update/:userId", (request, response) => {
  var userId = request.params.userId;
  db.query(
    `SELECT * FROM user where id = ${userId} `,
    function (error, result) {
      if (error) {
        throw error;
      }
      var context = {
        doc: `user/user_update.ejs`,

        loginid: result[0].loginid,
        password: result[0].password,
        name:  result[0].name,
        class:  result[0].class,

        pId: userId,
        kindOfDoc: "U",
        loggined: authIsOwner(request, response),
        id: request.session.login_id,
        cls: request.session.class,
      };
      request.app.render("user/user_update.ejs", context, function (err, html) {
      response.end(html);
      });
    });
});

router.post("/update_process/:userId", (request, response) => {
  var body = "";
  request.on("data", function (data) {
    body = body + data;
  });
  request.on("end", function () {
    var users = qs.parse(body);
    userId = request.params.userId;
    db.query(
      "UPDATE user SET loginid=?, password=?, name=?, class=? WHERE id=?",
      [users.loginid, users.password, users.name, users.class, userId],
      function (error, result) {
        response.writeHead(302, { Location: `/user_manage` });
        response.end();
      }
    );
  });
});

router.get("/delete_process/:userId", (request, response) => {
  var userId = request.params.userId;
  db.query(
    "DELETE FROM user WHERE id = ?",
    [userId],
    function (error, result) {
      if (error) {
        throw error;
      }
      response.writeHead(302, { Location: `/user_manage` });
      response.end();
    }
  );
});



module.exports = router;
