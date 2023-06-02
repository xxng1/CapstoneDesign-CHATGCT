const express = require("express");
const router = express.Router();
var db = require("./db");
var qs = require("querystring");
function authIsOwner(request, response) {
  if (request.session.is_logined) {
    return true;
  } else {
    return false;
  }
}

//사용자의 이름을 가져오는 거 추가
router.get("/", (req, res) => {
  db.query(`SELECT * FROM user WHERE id = ?`, [req.session.login_id], function (error, result) {
    if (error) {
      throw error;
    }

    let name = '';

    if (result.length > 0) {
      name = result[0].name;
    }

    var context = {
      loggined: authIsOwner(req, res),
      id: req.session.login_id,
      cls: req.session.class,
      results: result,
      name: name,
    };

    req.app.render("index.ejs", context, function (err, html) {
      if (err) {
        throw err;
      }

      res.end(html);
    });
  });
});

// router.get("/", (req, res) => {
//   db.query(`SELECT * FROM user `, function (error, result) {
//     if (error) {
//       throw error;
//     }
//     tmplogin = "Y";
//     var context = {
//       loggined: authIsOwner(req, res),
//       id: req.session.login_id,
//       cls: req.session.class,
//       results: result,
//     };
//     req.app.render("index.ejs", context, function (err, html) {
//       res.end(html);
//     });
//   });
// });

module.exports = router;
