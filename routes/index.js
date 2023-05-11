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

router.get("/", (req, res) => {
  db.query(`SELECT * FROM user `, function (error, result) {
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
    req.app.render("index.ejs", context, function (err, html) {
      res.end(html);
    });
  });
});

module.exports = router;
