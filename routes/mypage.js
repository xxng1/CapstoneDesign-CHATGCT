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

// 아이디 변경하기
router.post("/change_id/changeId_process", (req, res) => {
  if (req.session.studentnum) {
    // 새로운 이메일
    var newEmail = req.body.newEmail;

    db.query(
      "SELECT * FROM user WHERE studentnum = ?",
      [req.session.studentnum],
      (err, rows) => {
        if (err) throw err;
        const user = rows[0];

        if (user.verified === 0) {
          // 인증 코드 생성
          const verificationCode = generateVerificationCode();

          // 이메일 인증 코드 발송
          sendVerificationCode(user.loginid, verificationCode);

          // 기존 아이디를 새로운 이메일로 변경 및 인증 상태 업데이트
          db.query(
            "UPDATE user SET verificationCode = ? WHERE studentnum = ?",
            [verificationCode, req.session.studentnum],
            (err, result) => {
              if (err) throw err;
              // 아직 인증되지 않은 사용자에게 메시지 전송
              return res.json({message: `인증코드를 ${user.loginid}로 보냈습니다. 진행하던 인증을 마무리하세요.`});
            }
          );
        }

        if (user.verified === 1) {
          // 이미 인증된 사용자의 경우
          if (newEmail === user.loginid) {
            // 새 이메일이 현재 로그인 아이디와 같다면
            return res.json({message:`${user.loginid}은 이미 사용중인 아이디 입니다.`});
          } else {
            // 인증 코드 생성
            const verificationCode = generateVerificationCode();

            // 이메일 인증 코드 발송
            sendVerificationCode(newEmail, verificationCode);

            // 기존 아이디를 새로운 이메일로 변경 및 인증 상태 업데이트
            db.query(
              "UPDATE user SET verificationCode = ?, loginid = ?, verified = 0 WHERE studentnum = ?",
              [verificationCode, newEmail, req.session.studentnum],
              (err, result) => {
                if (err) throw err;
                return res.json({message: "인증코드가 전송되었습니다."});
              }
            );
          }
        }
      }
    );
  }
});

//변경된 새로운 아이디 인증하기
router.post("/change_id/verify", (req, res) => {
  if (req.session.studentnum) {
    // Get the provided verification code from the request body

    var verificationCode = req.body.verificationCode;

    db.query(
      `
      SELECT verificationCode, loginid, verified FROM user WHERE studentnum = ?
      `,
      [req.session.studentnum],
      function (error, results) {
        if (error) {
          throw error;
        }

        // Check if the provided code matches the one in the database
        if (
          results.length > 0 &&
          results[0].verificationCode === Number(verificationCode)
        ) {
          // If the codes match, update the 'verified' field and clear the verification code
          db.query(
            `
            UPDATE user SET verified = true, verificationCode = NULL WHERE studentnum = ?
            `,
            [req.session.studentnum],
            function (error, results) {
              if (error) {
                throw error;
              }

              // Fetch the updated loginid
              db.query(
                `
                SELECT loginid FROM user WHERE studentnum = ?
                `,
                [req.session.studentnum],
                function (error, results) {
                  if (error) {
                    throw error;
                  }

                  // Update the session login_id after fetching the new loginid
                  req.session.login_id = results[0].loginid;
                  
                  res.status(200).json({
                    message:
                      results[0].loginid + "로 아이디 변경이 인증되었습니다.",
                    redirect: "/mypage",
                  });
                }
              );
            }
          );
        } else {
          // If the codes do not match, revert the login id to the original
          db.query(
            `
            UPDATE user SET loginid = ?, verified = true, verificationCode = NULL WHERE studentnum = ?
            `,
            [req.session.login_id, req.session.studentnum],
            function (error, results) {
              if (error) {
                throw error;
              }

              // Fetch the updated loginid
              db.query(
                `
                SELECT loginid FROM user WHERE studentnum = ?
                `,
                [req.session.studentnum],
                function (error, results) {
                  if (error) {
                    throw error;
                  }

                  // Update the session login_id after fetching the new loginid
                  req.session.login_id = results[0].loginid;

                  res.status(200).json({
                    message: "인증코드가 일치하지 않습니다. 아이디 변경이 없습니다."
                  });
                }
              );
            }
          );
        }
      }
    );
  }
});

//비밀번호 변경하기
router.post("/change_pw/change_password", function (req, res) {
  if (req.session.login_id) {
    var newpw = req.body.newpw;

    db.query(
      `
      SELECT password, name FROM user WHERE loginid = ?
      `,
      [req.session.login_id],
      function (error, result) {
        if (error) {
          throw error;
        }

        var name = result[0].name;
        var currentPassword = result[0].password;

        // 현재 비밀번호와 새 비밀번호가 동일한지 확인
        if (currentPassword === newpw) {
          res.status(200).json({
            message:
              name +
              "님, 새로운 비밀번호는 현재 비밀번호와 다르게 설정해야 합니다.",
          });
        } else {
          db.query(
            `
            UPDATE user SET password = ? WHERE loginid = ?
            `,
            [newpw, req.session.login_id],
            function (error, result) {
              if (error) {
                throw error;
              }

              // 비밀번호 변경에 성공한 경우
              res.status(200).json({
                message: name + "님, 비밀번호가 성공적으로 변경되었습니다.",
                redirect: "/mypage",
              });
            }
          );
        }
      }
    );
  }
});

//사용자 탈퇴하기
router.post("/withdraw/withdraw_process", function (req, res) {
  if (req.session.login_id) {
    var pw = req.body.pw;

    // 사용자 비밀번호 조회
    db.query(
      "SELECT password, name FROM user WHERE loginid = ?",
      [req.session.login_id],
      function (error, results, fields) {
        if (error) throw error;

        // 데이터베이스에서 가져온 비밀번호와 사용자가 입력한 비밀번호 비교
        let username = results[0].name; // 이동한 위치
        if (results[0].password === pw) {
          // 비밀번호가 일치하면 사용자 삭제 전에 사용자 이름 저장
          // let username = results[0].name;  // 원래 위치

          db.query(
            "DELETE FROM user WHERE loginid = ?",
            [req.session.login_id],
            function (error, results, fields) {
              if (error) throw error;
          
              // Also delete from timeTable where user_id matches the login_id
              db.query(
                "DELETE FROM timeTable WHERE user_id = ?",
                [req.session.login_id],
                function (error, results, fields) {
                  if (error) throw error;
          
                  // User deletion and related timetable deletion completed, destroy session
                  req.session.destroy(function (err) {
                    // Handle error during session destroy
                    if (err) throw err;
          
                    // Success message
                    res.status(200).json({
                      message:
                        username +
                        "님의 회원 탈퇴가 완료되었습니다. 저희 서비스를 이용해 주셔서 감사합니다.",
                      redirect: "/",
                    });
                  });
                }
              );
            }
          );          
        } else {
          // 비밀번호가 일치하지 않으면 오류 메시지 전송
          res.status(200).json({
            message: username + "님의 비밀번호가 일치하지 않습니다.",
          });
        }
      }
    );
  }
});

module.exports = router;
