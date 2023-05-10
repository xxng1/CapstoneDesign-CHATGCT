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
      loginid: req.session.login_id,
      cls: req.session.class,
      results: result,
    };
    req.app.render("user/mypage.ejs", context, function (err, html) {
      res.end(html);
    });
  });
});

router.get("/change_id/", (req, res) => {
  res.render("user/change_id.ejs", { user: "" });
});

router.get("/change_pw/", (req, res) => {
  res.render("user/change_pw.ejs", { user: "" });
});

router.get("/withdraw/", (req, res) => {
  res.render("user/withdraw.ejs", { user: "" });
});

router.post("/changeid_process", (req, res) => {
  var body = "";
  req.on("data", function (data) {
    body = body + data;
  });
  req.on("end", function () {
    var post = qs.parse(body);
    db.query(
      `SELECT loginid FROM user WHERE loginid = ?`,
      [post.newid],
      function (error, result) {
        if (error) {
          throw error;
        }
        else if (result[0] !== undefined) {
          return res.send('<script>alert("이미 존재하는 아이디 입니다!"); window.location="/mypage/change_id";</script>');
        } 
        else {
          const stdnum = req.session.studentnum;
          db.query(
            'UPDATE user SET loginid=? WHERE studentnum=?',
            [post.newid, stdnum],
            function (error, result) {
              if (error) {
                throw error;
              }
              req.session.login_id = post.newid;
              res.redirect("/mypage");
            });
        }
      }
    );
  });
});

router.post("/changepw_process", (req, res) => {
  var body = "";
  req.on("data", function (data) {
    body = body + data;
  });
  req.on("end", function () {
    var post = qs.parse(body);
    db.query(
      `SELECT password FROM user WHERE password = ?`,
      [post.newpw],
      function (error, result) {
        if (error) {
          throw error;
        }
        else {
          const stdnum = req.session.studentnum;
          db.query(
            'UPDATE user SET password=? WHERE studentnum=?',
            [post.newpw, stdnum],
            function (error, result) {
              if (error) {
                throw error;
              }
              res.redirect("/mypage");
            });
        }
      }
    );
  });
});

//db 삭제는 되는데 초기화면으로 돌아가는 과정에 문제발생
router.post("/withdraw_process", (req, res) => {
  var body = "";
  req.on("data", function (data) {
    body = body + data;
  });
  req.on("end", function () {
    var post = qs.parse(body);
    const stdnum = req.session.studentnum;
    db.query(
      `SELECT password FROM user WHERE studentnum=?`,
      [stdnum],
      function (error, result) {
        if (error) {
          throw error;
        }
        else if (result[0].password === post.password) {
          db.query(
            'DELETE FROM user WHERE studentnum=?',
            [stdnum],
            function (error, result) {
              if (error) {
                throw error;
              }
              req.session.destroy(function (err) {
                res.redirect("/");
              });
            });
        } 
      }
    );
  });
});


module.exports = router;
