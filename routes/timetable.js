const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render("user/timetable.ejs", { user: "" })
});

module.exports = router;