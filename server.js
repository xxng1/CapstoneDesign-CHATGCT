const express = require("express");
const { spawn } = require("child_process");
const moment = require("moment");

const path = require("path");
const http = require("http");

const app = express();
const server = require("http").createServer(app);
const io = require("socket.io")(server);

// Set up session
const session = require("express-session");
const MySqlStore = require("express-mysql-session")(session);
const options = {
  host: "localhost",
  user: "dbid231",
  password: "dbpass231",
  database: "db23108",
};
const sessionStore = new MySqlStore(options);
app.use(
  session({
    secret: "keyboard cat",
    resave: false,
    saveUninitialized: true,
    store: sessionStore,
  })
);

// Configure views and static files
app.set("view engine", "ejs");
app.set("views", __dirname + "/views");
app.use(express.static(__dirname + "/public"));
app.use(express.json());

// Routes
const indexRouter = require("./routes/index.js");
const loginRouter = require("./routes/login.js");
const mypageRouter = require("./routes/mypage.js");
const timetableRouter = require("./routes/timeTable.js");
const usermanageRouter = require("./routes/user_manage.js");

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/mypage", mypageRouter);
app.use("/timetable", timetableRouter);
app.use("/user_manage", usermanageRouter);

// Handle root route
app.get("/", function (req, res) {
  res.render("index");
});

// Socket.IO connection handling
io.on("connection", (socket) => {
  socket.on("chatting", async (data) => {
    const { name, msg } = data;

    try {
      const result = await runTokenizerScript(msg);
      const [chatResponse, chatUrl] = result;

      io.emit("chatting", {
        name,
        msg,
        time: moment(new Date()).format("h:mm A"),
        chat_response: chatResponse,
        chat_url: chatUrl,
      });
    } catch (error) {
      console.error("Error running tokenizer script:", error);
    }
  });
});

// Function to run the Tokenizer.py script and return the result
function runTokenizerScript(msg) {
  return new Promise((resolve, reject) => {
    const pyProg = spawn("python", ["Tokenizer.py"]);

    let result = [];
    let errorOccurred = false;

    pyProg.stdout.on("data", (data) => {
      const lines = data.toString().split("\n");
      lines.forEach((line) => {
        result.push(line.trim());
      });
    });

    pyProg.stderr.on("data", (data) => {
      console.error("Error executing Tokenizer.py:", data.toString());
      errorOccurred = true;
    });

    pyProg.on("close", (code) => {
      if (code === 0 && !errorOccurred) {
        resolve(result);
      } else {
        reject(new Error("Tokenizer.py execution failed"));
      }
    });

    pyProg.stdin.write(msg + "\n");
    pyProg.stdin.end();
  });
}

const PORT = process.env.PORT || 60008;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
