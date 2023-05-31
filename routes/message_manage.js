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
  db.query(
    `SELECT message, COUNT(*) AS questionCount
    FROM messages
    WHERE type = 'question'
    GROUP BY message
    ORDER BY questionCount DESC LIMIT 5`,
    function (error, questionresult) {
      if (error) {
        throw error;
      }
      db.query(
        `SELECT message, COUNT(*) AS answerCount
        FROM messages
        WHERE type = 'answer'
        GROUP BY message
        ORDER BY answerCount DESC LIMIT 5`,
        function (error, answerresult) {
          if (error) {
            throw error;
          }

          var context = {
            doc: `user/message_manage.ejs`,
            loggined: authIsOwner(request, response),
            id: request.session.login_id,
            cls: request.session.class,
            questionresults: questionresult,
            answerresults: answerresult
          };

          request.app.render("user/message_manage.ejs", context, function (err, html) {
            if (err) {
              throw err;
            }
            response.end(html);
          });
        }
      );
    }
  );
});


module.exports = router;
