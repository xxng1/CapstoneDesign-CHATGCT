const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render("user/login.ejs", { user: "" })
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

module.exports = router;