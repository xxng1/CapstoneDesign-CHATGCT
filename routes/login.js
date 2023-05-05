const express = require('express');
const router = express.Router();
var db = require("./db");
var qs = require("querystring");
function authIsOwner(request, response) {
    //console.log(request.session);
    if (request.session.is_logined) {
      return true;
    } else {
      return false;
    }
}
//수정필요
router.get('/', (request, response) => {
    var subdoc;
    if (authIsOwner(request, response) === true) {
      subdoc = "index.ejs";
    } else {
      subdoc = "/user/login.ejs";
    }
    var context = {
      doc: subdoc,
      loggined: authIsOwner(request, response),
      id: request.session.login_id,
      cls: request.session.class,
    };
    request.app.render("user/login.ejs", context, function (err, html) {
     response.end(html);
    });
});


router.get('/logout', (request, response) => {
    request.session.destroy(function (err) {
        response.redirect("/");
    });
});


router.get('/find_id/', (req, res) => {
    res.render("user/find_id.ejs", { user: "" })
});

router.get('/find_pw/', (req, res) => {
    res.render("user/find_pw.ejs", { user: "" })
});

router.get('/join/', (req, res) => {
    res.render("user/join.ejs", { user: "" })
});
//추가
router.post('/login_process', (request, response) => {
    var body = "";
        request.on("data", function (data) {
          body = body + data;
        });
        request.on("end", function () {
          var post = qs.parse(body);
          db.query(
            `SELECT loginid, password, class FROM person WHERE loginid = ? and password = ?`,
            [post.id, post.pw],
            function (error, result) {
              if (error) {
                throw error;
              }
              if (result[0] === undefined){
                request.app.render("user/login_fail.ejs", function (err, html) {
                    response.end(html);
                });
                //response.end("Who ?");
              }
              else {
                request.session.is_logined = true;
                request.session.login_id = result[0].loginid;
                request.session.class = result[0].class;
                
                response.redirect("/");
                response.end('Welcome !!!');
              }
            });
        });
});

module.exports = router;