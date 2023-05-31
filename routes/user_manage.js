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

//--
function calculateSubjectCount(subject, callback) {
  db.query(
    `SELECT COUNT(*) AS count FROM user WHERE subject = ?`,
    [subject],
    function (error, result) {
      if (error) {
        callback(error, null);
      } else {
        // Extract the count from the result
        const count = result[0].count;
        callback(null, count);
      }
    }
  );
}
//--

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
        studentnum:  result[0].studentnum,
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
      "UPDATE user SET loginid=?, password=?, name=?, studentnum=?, class=? WHERE id=?",
      [users.loginid, users.password, users.name, users.studentnum, users.class, userId],
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


// router.get("/user_stats", (request, response) => {
//   db.query(`SELECT * FROM user WHERE subject IN (
//       SELECT subject FROM user GROUP BY subject
//       HAVING COUNT(*) >= 3)
//    `, function (error, result) {
//     if (error) {
//       throw error;
//     }
//     var context = {
//       doc: `user/user_stats.ejs`,
//       loggined: authIsOwner(request, response),
//       id: request.session.login_id,
//       cls: request.session.class,
//       results: result,
//     };
//     request.app.render("user/user_stats.ejs", context, function (err, html) {
//       response.end(html);
//     });
//   });
// });

//학과
router.get("/user_stats", (request, response) => {
  db.query(
    `SELECT subject, COUNT(*) AS count FROM user GROUP BY subject ORDER BY count DESC`,
    
    function (error, result) {
      if (error) {
        throw error;
      }
      var context = {
        doc: `user/user_stats.ejs`,
        //counts: result[0].count,
        loggined: authIsOwner(request, response),
        id: request.session.login_id,
        cls: request.session.class,
        results: result,
        
      };
      request.app.render("user/user_stats.ejs", context, function (err, html) {
        if (err) {
          throw err;
        }
        response.end(html);
      });
    }
  );
});

//학번

// router.get("/user_stats_num", (request, response) => {
//   db.query(
//     `SELECT subject, COUNT(*) AS count FROM user GROUP BY subject ORDER BY count DESC`,
//     function (error, result) {
//       if (error) {
//         throw error;
//       }
//       var context = {
//         doc: `user/user_stats.ejs`,
//         //counts: result[0].count,
//         loggined: authIsOwner(request, response),
//         id: request.session.login_id,
//         cls: request.session.class,
//         results: result,
        
//       };
//       request.app.render("user/user_stats.ejs", context, function (err, html) {
//         if (err) {
//           throw err;
//         }
//         response.end(html);
//       });
//     }
//   );
// });



module.exports = router;
