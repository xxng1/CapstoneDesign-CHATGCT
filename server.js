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
const recommendRouter = require("./routes/recommend.js");

app.use("/", indexRouter);
app.use("/login", loginRouter);
app.use("/mypage", mypageRouter);
app.use("/timetable", timetableRouter);
app.use("/user_manage", usermanageRouter);
app.use("/message_manage", messagemanageRouter);
app.use("/recommend", recommendRouter);

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
      if (!chatResponse.includes("질문과 일치하는 공지를 찾지 못했습니다.")) {
        // Split the response into sentences
        let sentences = chatResponse.split("<br>");

        // Iterate over each sentence
        for (let i = 0; i < sentences.length; i++) {
          // If the sentence includes "키워드로 검색한 내용", log it
          if (sentences[i].includes("키워드로 검색한 내용")) {
            await logMessage("answer", sentences[i]);
          }
        }
      }
      
    } catch (error) {
      console.error("Error running tokenizer script:", error);
    }
  });
});

//질문을 저장하고 검색에 성공한 경우, 키워드를 한 행씩 따로 저장
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
      keywords = keywordMatch[1]
        .split(",")
        .map((s) => s.trim().replace(/'/g, ""));
      // Insert each keyword into the database
      keywords.forEach((keyword) => {
        db.query(
          "INSERT INTO messages (type, message, time) VALUES (?, ?, ?)",
          [type, keyword, time],
          (error, result) => {
            if (error) {
              console.error("Error inserting message:", error);
            } else {
              console.log(`Inserted ${result.affectedRows} row(s).`);
            }
          }
        );
      });
    }
  } else {
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

    // 오류 발생 여부에 상관 없도록 수정 => model 실행되면 GPU관련 오류
    pyProg.stderr.on("data", (data) => {
      console.error("Error executing Tokenizer.py:", data.toString());
      errorOccurred = false;
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

const PORT = process.env.PORT || 60007;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
