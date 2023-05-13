const express = require("express");
const router = express.Router();
var db = require("./db");
var qs = require("querystring");
const nodemailer = require("nodemailer");

// 이메일 인증 코드 발송
function sendVerificationCode(email, verificationCode) {
  // 이메일 발송을 위한 SMTP 설정
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    auth: {
      user: "riss961105@gmail.com",
      pass: "vkboxsthigniolkq",
    },
  });

  // 이메일 발송 옵션 설정
  const mailOptions = {
    from: "riss961105@gmail.com",
    to: email,
    subject: "이메일 인증",
    text: `인증 코드: ${verificationCode}`,
  };

  // 이메일 발송
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.error("이메일 발송 중 오류가 발생했습니다:", error);
    } else {
      console.log("이메일이 성공적으로 발송되었습니다.");
    }
  });
}

// 인증 코드 생성
function generateVerificationCode() {
  const codeLength = 6;
  const verificationCode = Math.floor(Math.random() * Math.pow(10, codeLength))
    .toString()
    .padStart(codeLength, "0");
  return verificationCode;
}

function authIsOwner(request, response) {
  if (request.session.is_logined) {
    return true;
  } else {
    return false;
  }
}
//수정필요
router.get("/", (request, response) => {
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
    stdnum: request.session.studentnum,
  };
  request.app.render("user/login.ejs", context, function (err, html) {
    response.end(html);
  });
});

router.get("/logout", (request, response) => {
  request.session.destroy(function (err) {
    response.redirect("/");
  });
});

router.get("/join/", (req, res) => {
  res.render("user/join.ejs", { user: "" });
});

router.get("/register", (request, response) => {
  var titleofcreate = "register";
  var context = {
    doc: `/user/join.ejs`,
    loginid: "",
    password: "",
    name: "",
    subject: "",
    studentnum: "",
    class: "a",
    loggined: authIsOwner(request, response),
    id: request.session.login_id,
    cls: request.session.class,
  };
  request.app.render("index", context, function (err, html) {
    response.end(html);
  });
});

// 회원가입, 인증코드 생성 및 보내기
router.post("/send_code", (request, response) => {
  var userData = request.body;

  // 인증 코드 생성
  const verificationCode = generateVerificationCode();

  // 이메일 인증 코드 발송
  sendVerificationCode(userData.loginid, verificationCode);

  // Check if loginid already exists
  db.query(
    `SELECT * FROM user WHERE loginid = ?`,
    [userData.loginid],
    function (error, result) {
      if (error) {
        throw error;
      }
      if (result.length > 0) {
        response
          .status(200)
          .json({
            message: userData.loginid + "은 이미 존재하는 아이디입니다.",
            redirect: "/login/join",
          });
        return;
      }

      // Check if studentnum already exists
      db.query(
        `SELECT * FROM user WHERE studentnum = ?`,
        [userData.studentnum],
        function (error, result) {
          if (error) {
            throw error;
          }
          if (result.length > 0) {
            response
              .status(200)
              .json({
                message: userData.studentnum + "은 이미 존재하는 학번입니다.",
                redirect: "/login/join",
              });
            return;
          }

          // 데이터베이스에 회원 정보 저장
          db.query(
            `
            INSERT INTO user (loginid, password, name, subject, studentnum, class, verificationCode, verified)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            `,
            [
              userData.loginid,
              userData.password,
              userData.name,
              userData.subject,
              userData.studentnum,
              userData.class,
              verificationCode,
              0,
            ],
            function (error, result) {
              if (error) {
                throw error;
              }
              // 인증코드를 보낸 경우
              response
                .status(200)
                .json({
                  message: userData.loginid + "로 인증코드를 보냈습니다.",
                });
            }
          );
        }
      );
    }
  );
});

// 인증코드 확인
router.post("/register_process", (request, response) => {
  var post = request.body;
  var verificationCode = post.verificationCode;

  db.query(
    `
    SELECT loginid, name, class, studentnum FROM user WHERE verificationCode = ?
    `,
    [verificationCode],
    function (error, result) {
      if (error) {
        throw error;
      }

      // 인증 코드가 일치하지 않는 경우 실패 응답
      if (result.length === 0) {
        // 인증 코드가 일치하지 않으면, 데이터베이스에서 해당 사용자를 삭제
        db.query(
          `
          DELETE FROM user WHERE verified = false
          `,
          function (error, result) {
            if (error) {
              throw error;
            }

            response
              .status(200)
              .json({
                message: "인증코드가 일치하지 않습니다. 다시 해보세요.",
                redirect: "/login/join",
              });
          }
        );
      } else {
        // 인증 코드가 일치하는 경우 성공 응답
        // 인증 코드가 일치하면, 데이터베이스에서 해당 사용자의 인증 코드를 NULL로 설정하고, verified를 true로 업데이트
        var user = result[0];
        var name = user.name;

        db.query(
          `
          UPDATE user SET verificationCode = NULL, verified = true WHERE verificationCode = ?
          `,
          [verificationCode],
          function (error, result) {
            if (error) {
              throw error;
            }

            // 가입하자마자 바로 로그인
            request.session.is_logined = true;
            request.session.login_id = user.loginid;
            request.session.class = user.class;
            request.session.studentnum = user.studentnum;

            response
              .status(200)
              .json({
                message: "축하합니다.^@^ " + name + "님, 가입 되었습니다.",
                redirect: "/",
              });
          }
        );
      }
    }
  );
});

//로그인하기
router.post("/login_process", (request, response) => {
  var post = request.body;
  var loginid = post.id;
  var password = post.pw;

  db.query(
    `
    SELECT loginid, password, class, studentnum, verified, name FROM user WHERE loginid = ?
    `,
    [loginid],
    function (error, result) {
      if (error) {
        throw error;
      }

      // ID가 DB에 없는 경우
      if (result.length === 0) {
        response.status(200).json({
          message: loginid + "와 일치하는 아이디가 없습니다.",
          redirect: "/login",
        });
      } else {
        // ID가 DB에 있는 경우
        var user = result[0];

        // 인증이 안된 경우
        if (user.verified === 0) {
          // 데이터베이스에서 해당 사용자를 삭제
          db.query(
            `
            DELETE FROM user WHERE loginid = ? AND verified = false
            `,
            [loginid],
            function (error, result) {
              if (error) {
                throw error;
              }

              // 응답을 보내고 함수를 종료
              response.status(200).json({
                message:
                  loginid +
                  "는 인증이 안된 아이디 입니다. 삭제 됩니다. 회원가입을 해주세요.",
                redirect: "/login",
              });
            }
          );
        } else {
          // 비밀번호 확인
          if (user.password !== password) {
            response
              .status(200)
              .json({
                message: "비밀번호가 일치하지 않습니다.",
                redirect: "/login",
              });
          } else {
            request.session.is_logined = true;
            request.session.login_id = user.loginid;
            request.session.class = user.class;
            request.session.studentnum = user.studentnum;
            var name = user.name;
            response
              .status(200)
              .json({ message: name + "님, 로그인 성공!", redirect: "/" });
          }
        }
      }
    }
  );
});

module.exports = router;
