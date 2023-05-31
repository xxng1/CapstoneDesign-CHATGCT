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
const messagemanageRouter = require("./routes/message_manage.js");

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/mypage", mypageRouter);
app.use("/timetable", timetableRouter);
app.use("/user_manage", usermanageRouter);
app.use("/message_manage", messagemanageRouter);

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

      // Log the user's message
      await logMessage("question", msg);

      io.emit("chatting", {
        name,
        msg,
        time: moment(new Date()).format("h:mm A"),
        chat_response: chatResponse,
        chat_url: chatUrl,
      });

      // Log the chatbot's response
      if(!chatResponse.includes("키워드로 검색한 내용이 없습니다.")) {
        await logMessage("answer", chatResponse);
      }

    } catch (error) {
      console.error("Error running tokenizer script:", error);
    }
  });
});

const db = require("/home/t23108/svr/JH_PRACTICE/routes/db.js");

// Log message to the database
function logMessage(type, message) {
  // Get the current time
  const time = new Date();

  // When a question is asked, save the message
  let keywords = message.trim();

  
  // Extract the keywords if the message type is "answer"
  if (type === "answer") {
    const keywordMatch = message.match(/\['(.*)'\]/);
    if (keywordMatch) {
      keywords = keywordMatch[1].split(',').map(s => s.trim().replace(/'/g, "")).join(',');
    }       
  }

  // Insert the message into the database
  db.query(
    "INSERT INTO messages (type, message, time) VALUES (?, ?, ?)",
    [type, keywords, time],
    (error, result) => {
      if (error) {
        console.error("Error inserting message:", error);
      } else {
        console.log(`Inserted ${result.affectedRows} row(s).`);
      }
    }
  );
}

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

    pyProg.stdin.write(msg.trim() + "\n");
    console.log(msg.trim());
    pyProg.stdin.end();
  });
}

const PORT = process.env.PORT || 60008;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
