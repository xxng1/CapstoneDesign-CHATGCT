const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render("user/mypage.ejs", { user: "" })
});

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