const express = require('express'); 
const app = express();

var session = require("express-session");
var MySqlStore = require("express-mysql-session")(session);
var options = {
  host: "127.0.0.1",
  user: "root",
  password: "123qwe",
  database: "testserver",
};
var sessionStore = new MySqlStore(options);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

const path = require('path');
const http = require('http');

const server = http.createServer(app);
const moment = require('moment');

const socketIO = require('socket.io');
const io = socketIO(server);

const indexRouter = require('./routes/index.js');
const loginRouter = require('./routes/login.js');
const mypageRouter = require('./routes/mypage.js');
const timetableRouter = require('./routes/timetable.js');

app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', __dirname + '/views');

app.use('/', indexRouter);
app.use('/login', loginRouter);
app.use('/mypage', mypageRouter);
app.use('/timetable', timetableRouter);

app.get('/', function(req, res) {
  res.render('index');
});

const PORT = process.env.PORT || 8080;

server.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});


io.on('connection', (socket) => {
    socket.on('chatting', (data) => {
      const { name, msg } = data;
      io.emit('chatting', {
        name,
        msg,
        time: moment(new Date()).format('h:mm A'),
      })
    })
  })