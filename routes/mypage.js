const express = require('express');
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

router.get('/', (req, res) => {
    db.query(`SELECT * FROM person `, function (error, result) {
        if (error) {
          throw error;
        }
        tmplogin = "Y";
        var context = {
          loggined: authIsOwner(req, res),
          id: req.session.login_id,
          cls: req.session.class,
          results: result,
        };
        req.app.render("user/mypage.ejs", context, function (err, html) {
        res.end(html);
        });
      });
});

/**
router.get('/', (req, res) => {
    res.render("user/mypage.ejs", { user: "" })
});
 */

router.get('/change_id/', (req, res) => {
    res.render("user/change_id.ejs", { user: "" })
});

router.get('/change_pw/', (req, res) => {
    res.render("user/change_pw.ejs", { user: "" })
});

router.get('/withdraw/', (req, res) => {
    res.render("user/withdraw.ejs", { user: "" })
});

module.exports = router;