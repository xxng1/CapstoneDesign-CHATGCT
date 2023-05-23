"use strict";
const socket = io.connect();

const nickname = document.querySelector("#nickname");
const chatList = document.querySelector(".chatting-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");
const button = document.querySelector("send-button");

chatInput.addEventListener("keypress", (e) => {
  if (e.keyCode === 13 && sendButton.disabled === false) {
    send();
  }
});

sendButton.addEventListener("click", send);

function send() {
  if (chatInput.value.trim() !== ""){
    const param = {
      name: "나",
      msg: chatInput.value,
    };
    // chatting 이벤트 발생 데이터는 param으로 전송
    socket.emit("chatting", param);

    const li = document.createElement("li");
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
     const interval = setInterval(() => {

      if(document.getElementById('dot1').className === "dot black"){
        document.getElementById('dot1').className = "dot silver";
        document.getElementById('dot3').className = "dot silver";
        document.getElementById('dot2').className = "dot black";
      }
      else if(document.getElementById('dot2').className === "dot black"){
        document.getElementById('dot2').className = "dot silver";
        document.getElementById('dot1').className = "dot silver";
        document.getElementById('dot3').className = "dot black";
      }
      else if(document.getElementById('dot3').className === "dot black"){
        document.getElementById('dot3').className = "dot silver";
        document.getElementById('dot2').className = "dot silver";
        document.getElementById('dot1').className = "dot black";
      }
      
    }, 500);

    

    setTimeout(() => {
      chatList.removeChild(li);
      clearInterval(interval);
      sendButton.disabled = false;
    }, 7000)
    sendButton.disabled = true;
    chatInput.value = "";
  }
  else {
    chatInput.value = "";
  }
}

socket.on("chatting", (data) => {
  const { name, msg, time , chat_response, chat_url} = data;
  const item = new LiModel(name, msg, time);
  const item2 = new Chatbot(name, chat_response,chat_url, time);
  
  item.makeLi();
  item2.makeLi();
  displayContainer.scrollTo(0, displayContainer.scrollHeight);
});

function LiModel(name, msg, time){
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
      <span class="message">${this.msg}${'\n'}${this.msg2}</span>
      <span class="time">${this.time}</span>`;

    li.innerHTML = dom;
    chatList.appendChild(li);
  };
}
