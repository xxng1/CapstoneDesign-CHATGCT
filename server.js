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
  let chatHistory = []; // 배열을 사용해 대화 내역을 기록

  // Listen for the 'courseRecom' event
  socket.on("courseRecom", (data) => {
    let msg;
    let name = "Server";
    let response;

    //"courseRecom" 이벤트로 응답 보내기
    function sendResponse(chat_response) {
      // 이전 대화 내역에 추가
      chatHistory.push({
        name,
        msg: chat_response,
        time: moment(new Date()).format("h:mm A"),
      });

      response = {
        name,
        time: moment(new Date()).format("h:mm A"),
        chat_response,
      };

      // Send a response back to the client
      socket.emit("courseRecom", response);
    }

    // Check if the incoming data is a string or an object
    if (typeof data === "string") {
      msg = data;
      response = {
        name,
        msg,
        time: moment(new Date()).format("h:mm A"),
        chat_response: msg,
        chat_url: "http://ceprj.gachon.ac.kr:60008/timetable/",
      };
      socket.emit("courseRecom", response);
    } else if (typeof data === "object" && data !== null) {
      msg = data.msg;
      let chat_response;

      //종료하는 키워드를 받으면 "endCourseRecom" 이벤트로 메세지 전송
      if (msg === "고마워") {
        const chat_response = "시간표 추천 서비스를 이용해주셔서 감사합니다.";
        const time = moment(new Date()).format("h:mm A"); // format the current time
        socket.emit("endCourseRecom", {chat_response, time});
        chatHistory = [];
        return;
      }
      

      const majorKeywords = ["전공", "전선", "전필"];
      const generalKeywords = ["교양", "교선", "교필", "계교"];
      const departmentKeywords = [
        "한국학",
        "경영학부",
        "경영학부(경영학)",
        "경영학부(글로벌경영학)",
        "금융수학과",
        "국어국문학과",
        "영어영문학과",
        "동양어문학과",
        "유럽어문학과",
        "법학과",
        "행정학과",
        "글로벌경제학과",
        "관광경영학과",
        "회계·세무학과",
        "사회복지학과",
        "유아교육학과",
        "보건정책·관리학과",
        "언론영상광고학과",
        "경찰·안보학과",
        "응용통계학과",
        "교육학과",
        "특수상담치료학과",
        "의상학과",
        "식품영양학과",
        "나노-나노물리학과",
        "나노-나노화학과",
        "나노-생명과학과",
        "간호학과",
        "보건과학과",
        "보건학과",
        "약학과",
        "도시계획학과",
        "조경학과",
        "건축학과-건축학",
        "건축학과-건축공학",
        "건축학과-실내건축학",
        "산업공학과",
        "설비·소방공학과-소방방재공학",
        "기계공학과",
        "식품생명공학과",
        "토목환경공학과",
        "인공지능학과",
        "신소재공학과",
        "바이오나노융합학과",
        "IT융합공학과-컴퓨터공학",
        "게임영상공학과",
        "AI·소프트웨어학과",
        "정보보호학과",
        "차세대스마트에너지시스템융합학과",
        "나노-화공생명공학과",
        "나노-전기공학과",
        "나노-전자공학과",
        "나노-에너지IT학과",
        "한의학과",
        "공연예술학과",
        "조소과",
        "디자인학과-시각디자인",
        "디자인학과-산업디자인",
        "회화과",
        "음학학과",
        "체육학과",
        "융합의과학과",
        "의학과",
      ];

      // Check if message includes any major keywords
      if (majorKeywords.some((keyword) => msg.includes(keyword))) {
        chat_response = "어떤 학과의 전공 강의를 찾고 계신가요?";
        sendResponse(chat_response);
      }
      // Check if message includes any general keywords
      else if (generalKeywords.some((keyword) => msg.includes(keyword))) {
        chat_response = "어떤 학과의 교양 강의를 찾고 계신가요?";
        sendResponse(chat_response);
      } else {
        if (departmentKeywords.some((keyword) => msg.includes(keyword))) {
          const department = departmentKeywords.find((keyword) =>
            msg.includes(keyword)
          );

          // Find the previous server message
          let lastServerMessage;
          if (
            chatHistory.length > 0 &&
            [
              "어떤 학과의 전공 강의를 찾고 계신가요?",
              "어떤 학과의 교양 강의를 찾고 계신가요?",
            ].includes(chatHistory[chatHistory.length - 1].msg)
          ) {
            lastServerMessage = chatHistory[chatHistory.length - 1].msg;
          } else {
            let lastServerMessageIndex = chatHistory
              .slice(0, chatHistory.length - 1)
              .reverse()
              .findIndex((message) =>
                [
                  "어떤 학과의 전공 강의를 찾고 계신가요?",
                  "어떤 학과의 교양 강의를 찾고 계신가요?",
                ].includes(message.msg)
              );

            // If last message was "정확히 입력해주세요." then skip it and find another one.
            while (
              lastServerMessageIndex >= 0 &&
              chatHistory[chatHistory.length - lastServerMessageIndex - 2]
                .msg === "정확히 입력해주세요."
            ) {
              lastServerMessageIndex--;
            }

            if (lastServerMessageIndex >= 0) {
              lastServerMessage =
                chatHistory[chatHistory.length - lastServerMessageIndex - 2]
                  .msg;
            }
          }

          if (lastServerMessage === "어떤 학과의 전공 강의를 찾고 계신가요?") {
            const sql = `
            SELECT timeTable.교과목명, timeTable.담당교수, timeTable.이수, timeTable.강의시간, timeTable.학점, COUNT(*) as student_count
            FROM timeTable 
            INNER JOIN user ON timeTable.user_id = user.loginid 
            WHERE user.subject = ? AND (timeTable.이수 = '전필' OR timeTable.이수 = '전선')
            GROUP BY timeTable.교과목명, timeTable.담당교수, timeTable.이수, timeTable.강의시간, timeTable.학점
            ORDER BY student_count DESC 
            LIMIT 5            
            `;
            db.query(sql, [department], function (err, results, fields) {
              if (err) {
                console.error(err);
                chat_response =
                  "Sorry, there was an error finding the top 5 courses.";
                sendResponse(chat_response);
              } else {
                if (results.length === 0) {
                  chat_response = `<span style="color:green;">${department}</span> 학과로 등록된 시간표가 없습니다.<br />추천을 원하는 강의가 <span style="color:red;">전공</span>인가요, <span style="color:red;">교양</span>인가요?`;
                  sendResponse(chat_response);
                } else {
                  let table = `
                    <table style="width:100%; border:1px solid #000; border-collapse:collapse;">
                    <tr style="background-color:#f5f5f5;">
                      <th style="border:1px solid #000; padding:5px;">교과목명</th>
                      <th style="border:1px solid #000; padding:5px;">담당교수</th>
                      <th style="border:1px solid #000; padding:5px;">이수</th>
                      <th style="border:1px solid #000; padding:5px;">강의시간</th>
                      <th style="border:1px solid #000; padding:5px;">학점</th>
                    </tr>
                    `;
                  for (let result of results) {
                    table += `
                        <tr>
                          <td style="border:1px solid #000; padding:5px;">${result.교과목명}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.담당교수}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.이수}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.강의시간}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.학점}</td>
                        </tr>
                        `;
                  }
                  table += "</table>";
                  chat_response = `<span style="color:green;">${department}</span> 학생들에게 가장 <span style="color:purple;">인기</span> 있는 <span style="color:red;">전공</span> 강의 <span style="color:green;">${results.length}</span>개는 다음과 같습니다. ${table} 해당 강의들을 추가하실 건가요? --> <a href="http://ceprj.gachon.ac.kr:60008/timetable/" style="color:blue;">내 시간표</a><br />추천을 원하는 강의가 <span style="color:red;">전공</span>인가요, <span style="color:red;">교양</span>인가요?`;
                  sendResponse(chat_response);
                }
              }
            });
          } else if (
            lastServerMessage === "어떤 학과의 교양 강의를 찾고 계신가요?"
          ) {
            const sql = `
            SELECT timeTable.교과목명, timeTable.담당교수, timeTable.이수, timeTable.강의시간, timeTable.학점, COUNT(*) as student_count
            FROM timeTable 
            INNER JOIN user ON timeTable.user_id = user.loginid 
            WHERE user.subject = ? AND (timeTable.이수 = '교양' OR timeTable.이수 = '교선' OR timeTable.이수 = '교필' OR timeTable.이수 = '계교')
            GROUP BY timeTable.교과목명, timeTable.담당교수, timeTable.이수, timeTable.강의시간, timeTable.학점
            ORDER BY student_count DESC 
            LIMIT 5            
            `;
            db.query(sql, [department], function (err, results, fields) {
              if (err) {
                console.error(err);
                chat_response =
                  "Sorry, there was an error finding the top 5 courses.";
                sendResponse(chat_response);
              } else {
                if (results.length === 0) {
                  chat_response = `<span style="color:green;">${department}</span> 학과로 등록된 시간표가 없습니다.<br />추천을 원하는 강의가 <span style="color:red;">전공</span>인가요, <span style="color:red;">교양</span>인가요?`;
                  sendResponse(chat_response);
                } else {
                  let table = `
                    <table style="width:100%; border:1px solid #000; border-collapse:collapse;">
                    <tr style="background-color:#f5f5f5;">
                      <th style="border:1px solid #000; padding:5px;">교과목명</th>
                      <th style="border:1px solid #000; padding:5px;">담당교수</th>
                      <th style="border:1px solid #000; padding:5px;">이수</th>
                      <th style="border:1px solid #000; padding:5px;">강의시간</th>
                      <th style="border:1px solid #000; padding:5px;">학점</th>
                    </tr>
                    `;
                  for (let result of results) {
                    table += `
                        <tr>
                          <td style="border:1px solid #000; padding:5px;">${result.교과목명}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.담당교수}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.이수}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.강의시간}</td>
                          <td style="border:1px solid #000; padding:5px;">${result.학점}</td>
                        </tr>
                        `;
                  }
                  table += "</table>";
                  chat_response = `<span style="color:green;">${department}</span> 학생들에게 가장 <span style="color:purple;">인기</span> 있는 <span style="color:red;">교양</span> 강의 <span style="color:green;">${results.length}</span>개는 다음과 같습니다. ${table} 해당 강의들을 추가하실 건가요? --> <a href="http://ceprj.gachon.ac.kr:60008/timetable/" style="color:blue;">내 시간표</a><br />추천을 원하는 강의가 <span style="color:red;">전공</span>인가요, <span style="color:red;">교양</span>인가요?`;
                  sendResponse(chat_response);
                }
              }
            });
          } else {
            chat_response = `추천을 원하시는 강의가 <span style="color:red;">전공</span>인가요, <span style="color:red;">교양</span>인가요?`;
            sendResponse(chat_response);
          }
        } else {
          chat_response = "정확히 입력해주세요.";
          sendResponse(chat_response);
        }
      }
    }
  });

  //"chatting" 이벤트를 사용하는 부분
  socket.on("chatting", async (data) => {
    const { name, msg } = data;
    try {
      const result = await runTokenizerScript(msg);
      const [chatResponse, chatUrl] = result;

      // Log the user's message
      await logMessage("question", msg);

      socket.emit("chatting", {
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
const db = require("./routes/db.js");

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

const PORT = process.env.PORT || 60008;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
