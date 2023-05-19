const express = require("express");
const router = express.Router();
const mysql = require("mysql");
var db = require('./db');

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


module.exports = router;
