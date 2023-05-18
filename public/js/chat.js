"use strict";
const socket = io.connect();

const nickname = document.querySelector("#nickname");
const chatList = document.querySelector(".chatting-list");
const chatInput = document.querySelector(".chatting-input");
const sendButton = document.querySelector(".send-button");
const displayContainer = document.querySelector(".display-container");
const button = document.querySelector("send-button");

chatInput.addEventListener("keypress", (e) => {
  if (e.keyCode === 13) {
    send();
  }
});

sendButton.addEventListener("click", send);

function send() {
  const param = {
    name: "나",
    msg: chatInput.value,
  };
  // chatting 이벤트 발생 데이터는 param으로 전송
  socket.emit("chatting", param);
}

socket.on("chatting", (data) => {
  const { name, msg, time , chat_response, chat_url} = data;
  const item = new LiModel(name, msg, time);
  const item2 = new Chatbot(name, chat_response,chat_url, time);
  
  if (chatInput.value.trim() === "") {
    chatInput.value = "";
  } else {
    item.makeLi();
    item2.makeLi();
    displayContainer.scrollTo(0, displayContainer.scrollHeight);
  }
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
    chatInput.value = "";
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
    chatInput.value= '';
  };
}
