const express = require("express");
const {spawn} = require("child_process")
const pyProg = spawn('python', ['Tokenizer.py']);
const app = express();

var session = require("express-session");
var MySqlStore = require("express-mysql-session")(session);
var options = {
  host: "localhost",
  user: "dbid231",
  password: "dbpass231",
  database: "db23108",
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

const path = require("path");
const http = require("http");

const server = http.createServer(app);
const moment = require("moment");

const socketIO = require("socket.io");
const io = socketIO(server);

const indexRouter = require("./routes/index.js");
const loginRouter = require("./routes/login.js");
const mypageRouter = require("./routes/mypage.js");
const timetableRouter = require("./routes/timeTable.js");

app.use(express.static(path.join(__dirname, "public")));
app.use(express.json()); // JSON body parsing 미들웨어 설정
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/mypage", mypageRouter);
app.use("/timetable", timetableRouter);

app.get("/", function (req, res) {
  res.render("index");
});

const PORT = process.env.PORT || 60020;

server.listen(PORT, () => {
  console.log(`server is running ${PORT}`);
});

io.on("connection", (socket) => {
  socket.on("chatting", (data) => {
    const { name, msg } = data;
    pyProg.stdin.write(msg + "\n")

    let result = []

    pyProg.stdout.on("data", (data) => {
      const lines = data.toString().split('\n');
      lines.forEach((line) => {
        result.push(line.trim());
      });
    });
    pyProg.stdout.on("end", () => {
      io.emit("chatting", {
        name,
        msg ,
        time: moment(new Date()).format("h:mm A"),
        chat_response : result[0],
        chat_url : result[1],
      });
      result = [];
    });
  });
});



