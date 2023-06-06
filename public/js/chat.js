"use strict";
const socket = io.connect();

const nickname = document.querySelector("#nickname");
const chatList = document.querySelector(".chatting-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");
const csRe = document.querySelector("#courseRecommend");

var interval;
const li = document.createElement("li");

let sendNotProceed = false;

// 시간표 추천 버튼을 클릭하면 실행 해당 메세지를 소켓으로 "courseRecom"이벤트로 전달
csRe.addEventListener("click", function () {
  sendNotProceed = true;
  const message = `"<span style="color:brown;">고마워</span>"를 입력 하시면 추천 서비스는 종료됩니다.<br />추천을 원하시는 강의가 <span style="color:red;">전공</span>인가요, <span style="color:red;">교양</span>인가요?`;
  socket.emit("courseRecom", message);
  chatInput.focus();
});

//해당 함수도 "courseRecom"로 메세지를 전달하는 함수
function sendCourseRecom() {
  if (chatInput.value.trim() !== "") {
    const param = {
      name: "나",
      msg: chatInput.value,
    };

    const time = moment(new Date()).format("h:mm A"); // format the current time
    const li = document.createElement("li");
    li.classList.add("sent");
    const dom = `
      <span class="message">${param.msg}</span>
      <span class="time">${time}</span>`;

    li.innerHTML = dom;
    chatList.appendChild(li);

    // courseRecom 이벤트 발생 데이터는 param으로 전송
    socket.emit("courseRecom", param);

    chatInput.value = "";
  }
}

//소켓 chatting, courseRecom 이벤트 사용하는 함수 따로 처리하기
chatInput.addEventListener("keypress", (e) => {
  if (e.keyCode === 13 && sendButton.disabled === false) {
    e.preventDefault(); // prevent the default action
    if (sendNotProceed) {
      sendCourseRecom();
    } else {
      send();
    }
  }
});

sendButton.addEventListener("click", send);

//"chatting" 이벤트로 메세지르 전달 사용하는 함수
function send() {
  if (chatInput.value.trim() !== "" && !sendNotProceed) {
    const param = {
      name: "나",
      msg: chatInput.value,
    };
    // chatting 이벤트 발생 데이터는 param으로 전송
    socket.emit("chatting", param);

    li.classList.add("received");
    const load = `<span class="profile">
      <img class="received-image" src=./images/icon.png alt="any">GCT
      </span>
      <span class="message" style="display:flex; flex-direction: row;">
        <div class="dot" style="visibility: hidden;"></div>
        <div id="dot1" class="dot black"></div>
        <div id="dot2" class="dot silver"></div>
        <div id="dot3" class="dot silver"></div>
      </span>`;
    li.innerHTML = load;
    chatList.appendChild(li);
    interval = setInterval(() => {
      if (document.getElementById("dot1").className === "dot black") {
        document.getElementById("dot1").className = "dot silver";
        document.getElementById("dot3").className = "dot silver";
        document.getElementById("dot2").className = "dot black";
      } else if (document.getElementById("dot2").className === "dot black") {
        document.getElementById("dot2").className = "dot silver";
        document.getElementById("dot1").className = "dot silver";
        document.getElementById("dot3").className = "dot black";
      } else if (document.getElementById("dot3").className === "dot black") {
        document.getElementById("dot3").className = "dot silver";
        document.getElementById("dot2").className = "dot silver";
        document.getElementById("dot1").className = "dot black";
      }
    }, 500);

    displayContainer.scrollTo(0, displayContainer.scrollHeight);
    chatInput.disabled = true; // Disable the chat input field
    sendButton.disabled = true;
    chatInput.value = "";
  } else {
    chatInput.value = "";
  }
}

//서버에서 오는 chatting 이벤트 읽어오기
socket.on("chatting", (data) => {
  const { name, msg, time, chat_response, chat_url } = data;
  const item = new LiModel(name, msg, time);
  const item2 = new Chatbot(name, chat_response, chat_url, time);

  chatList.removeChild(li);
  clearInterval(interval);
  chatInput.disabled = false;
  sendButton.disabled = false;
  item.makeLi();
  item2.makeLi();
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
  chatInput.focus();
});

// 서버에서 오는 "courseRecom" 이벤트를 읽고 url을 유무에 따라 다르게 출력
socket.on("courseRecom", (data) => {
  const { name, time, chat_response, chat_url } = data;

  const li = document.createElement("li");
  li.classList.add("received");

  let messageContent;

  // Check if chat_url exists in the data
  if (chat_url) {
    messageContent = `현재 <a href="${chat_url}" style="color:blue;">내 시간표</a>를 확인하고 싶으시다면 클릭해주세요.<br /> ${chat_response}`;
  } else if (
    chat_response.includes("어떤 학과의 전공 강의를") ||
    chat_response.includes("어떤 학과의 교양 강의를")
  ) {
    // add select option if url doesn't exist
    messageContent = `${chat_response}<br />참고하세요.  
    <select id="department-list" name="subject">
    <option value="전체 학과">전체 학과</option>
    <option value="한국학">한국학</option>
    <option value="경영학부">경영학부</option>
    <option value="경영학부(경영학)">경영학부(경영학)</option>
    <option value="경영학부(글로벌경영학)">
      경영학부(글로벌경영학)
    </option>
    <option value="금융수학과">금융수학과</option>
    <option value="국어국문학과">국어국문학과</option>
    <option value="영어영문학과">영어영문학과</option>
    <option value="동양어문학과">동양어문학과</option>
    <option value="유렵어문학과">유럽어문학과</option>
    <option value="법학과">법학과</option>
    <option value="행정학과">행정학과</option>
    <option value="글로벌경제학과">글로벌경제학과</option>
    <option value="관광경영학과">관광경영학과</option>
    <option value="회계·세무학과">회계·세무학과</option>
    <option value="사회복지학과">사회복지학과</option>
    <option value="유아교육학과">유아교육학과</option>
    <option value="보건정책·관리학과">보건정책·관리학과</option>
    <option value="언론영상광고학과">언론영상광고학과</option>
    <option value="경찰·안보학과">경찰·안보학과</option>
    <option value="응용통계학과">응용통계학과</option>
    <option value="교육학과">교육학과</option>
    <option value="특수상담치료학과">특수상담치료학과</option>
    <option value="의상학과">의상학과</option>
    <option value="식품영양학과">식품영양학과</option>
    <option value="나노-나노물리학과">나노-나노물리학과</option>
    <option value="나노-나노화학과">나노-나노화학과</option>
    <option value="나노-생명과학과">나노-생명과학과</option>
    <option value="간호학과">간호학과</option>
    <option value="보건과학과">보건과학과</option>
    <option value="보건학과">보건학과</option>
    <option value="약학과">약학과</option>
    <option value="도시계획학과">도시계획학과</option>
    <option value="조경학과">조경학과</option>
    <option value="건축학과-건축학">건축학과-건축학</option>
    <option value="건축학과-건축공학">건축학과-건축공학</option>
    <option value="건축학과-실내건축학">건축학과-실내건축학</option>
    <option value="산업공학과">산업공학과</option>
    <option value="설비·소방공학과-소방방재공학">
      설비·소방공학과-소방방재공학
    </option>
    <option value="기계공학과">기계공학과</option>
    <option value="식품생명공학과">식품생명공학과</option>
    <option value="토목환경공학과">토목환경공학과</option>
    <option value="인공지능학과">인공지능학과</option>
    <option value="신소재공학과">신소재공학과</option>
    <option value="바이오나노융합학과">바이오나노융합학과</option>
    <option value="IT융합공학과-컴퓨터공학">
      IT융합공학과-컴퓨터공학
    </option>
    <option value="게임영상공학과">게임영상공학과</option>
    <option value="AI·소프트웨어학과">AI·소프트웨어학과</option>
    <option value="정보보호학과">정보보호학과</option>
    <option value="차세대스마트에너지시스템융합학과">
      차세대스마트에너지시스템융합학과
    </option>
    <option value="나노-화공생명공학과">나노-화공생명공학과</option>
    <option value="나노-전기공학과">나노-전기공학과</option>
    <option value="나노-전자공학과">나노-전자공학과</option>
    <option value="나노-에너지IT학과">나노-에너지IT학과</option>
    <option value="한의학과">한의학과</option>
    <option value="공연예술학과">공연예술학과</option>
    <option value="조소과">조소과</option>
    <option value="디자인학과-시각디자인">
      디자인학과-시각디자인
    </option>
    <option value="디자인학과-산업디자인">
      디자인학과-산업디자인
    </option>
    <option value="회화과">회화과</option>
    <option value="음학학과">음학학과</option>
    <option value="체육학과">체육학과</option>
    <option value="융합의과학과">융합의과학과</option>
    <option value="의학과">의학과</option>
    </select>`;
  } else {
    messageContent = chat_response;
  }

  const dom = `<span class="profile">
      <img class="received-image" src="./images/icon.png" alt="any">GCT
      </span>
      <span><img id="randomImage" src=""></span>
      <span class="message">${messageContent}</span>
      <span class="time">${time}</span>`;

  li.innerHTML = dom;
  chatList.appendChild(li);
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
});

// 서버에서 "endCourseRecom" 이벤트를 듣기 위한 handler 설정
socket.on("endCourseRecom", (data) => {
  // 'sendNotProceed'를 false로 설정
  sendNotProceed = false;

  const li = document.createElement("li");
  li.classList.add("received");

  const dom = `<span class="profile">
      <img class="received-image" src="./images/icon.png" alt="any">GCT
      </span>
      <span><img id="randomImage" src=""></span>
      <span class="message">${data.chat_response}</span>
      <span class="time">${data.time}</span>`;
  li.innerHTML = dom;
  chatList.appendChild(li);
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
});

function LiModel(name, msg, time) {
  this.name = name;
  this.msg = msg;
  this.time = time;

  this.makeLi = () => {
    const li = document.createElement("li");
    li.classList.add("sent");
    const dom = `
      <span class="message">${this.msg}</span>
      <span class="time">${this.time}</span>`;

    li.innerHTML = dom;
    chatList.appendChild(li);
  };
}

function Chatbot(name, msg, msg2, time) {
  this.name = name;
  this.msg = msg;
  this.msg2 = msg2;
  this.time = time;

  this.makeLi = () => {
    const li = document.createElement("li");
    li.classList.add("received");
    const dom = `<span class="profile">
      <img class="received-image" src=./images/icon.png alt="any">GCT
      </span>
      <span><img id="randomImage" src=""></span>
      <span class="message">${this.msg}${"\n"}${this.msg2}</span>
      <span class="time">${this.time}</span>`;

    li.innerHTML = dom;
    chatList.appendChild(li);
  };
}
