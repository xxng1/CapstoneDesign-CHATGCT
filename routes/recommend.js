const express = require("express");
const router = express.Router();
const db = require("./db");

function authIsOwner(request, response) {
    if (request.session.is_logined) {
        return true;
    } else {
        return false;
    }
}

router.get("/", (req, res) => {
    db.query(`SELECT * FROM user`, function (error, result) {
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
        req.app.render("user/recommend.ejs", context, function (err, html) {
            res.end(html);
        });
    });
});

router.post("/recommend_process", (req, res) => {
    var post = req.body;
    const query = 'SELECT * FROM courses WHERE 이수=? AND 강의시간=? AND 학수번호 NOT IN (SELECT 학수번호 FROM timeTable WHERE user_id = ? );';
    const values = [post.subtypeVAL, post.classtimeVAL, req.session.login_id];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('쿼리 실행 오류:', error);
            res.status(500).json({ error: '쿼리 실행 오류' });
            return;
        }
        const data = results.map(item => {
            return {
                num: item.학수번호,
                name: item.교과목명,
                subtype: item.이수,
                score: item.학점,
                professor: item.담당교수,
                time: item.강의시간,
                room: item.강의실,
            }
        });
        res.json(data);
    });
});

router.post('/makelist', (req, res) => {
    const query = 'SELECT 강의시간 FROM courses GROUP BY 강의시간;';

    db.query(query, (error, results) => {
        if (error) {
            console.error('쿼리 실행 오류:', error);
            return;
        }

        const data = results.map(item => item.강의시간);
        res.json(data);
    });
});

router.post('/timelist', (req, res) => {
    const query = 'SELECT 강의시간 FROM timeTable WHERE user_id=?;';
    const values = [req.session.login_id];

    db.query(query, values, (error, results) => {
        if (error) {
            console.error('쿼리 실행 오류:', error);
            return;
        }

        const data = results.map(item => item.강의시간);
        res.json(data);
    });
});

module.exports = router;
