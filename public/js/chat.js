"use strict"
const socket = io.connect();

const nickname = document.querySelector('#nickname');
const chatList = document.querySelector('.chatting-list');
const chatInput = document.querySelector('.chatting-input');
const sendButton = document.querySelector('.send-button');
const displayContainer = document.querySelector('.display-container');
const button = document.querySelector('send-button');

chatInput.addEventListener('keypress', (e) => {
    if (e.keyCode === 13) {
      send();
    }
  });

sendButton.addEventListener('click', send);

function send() {
    const param = {
      name: "나",
      msg: chatInput.value,
    };
      socket.emit('chatting', param);
  }


socket.on('chatting', (data) => {
    const { name, msg, time } = data;
    const item = new LiModel(name, msg, time);
    const item2 = new Chatbot(name, msg, time);

    if (chatInput.value.trim() === '') {
      chatInput.value= '';
    } 
    else {
      item.makeLi();
      item2.makeLi();
      displayContainer.scrollTo(0, displayContainer.scrollHeight);
    }
  });  

function LiModel(name, msg, time) {
    this.name = name;
    this.msg = msg;
    this.time = time;
  
    this.makeLi = () => {
      const li = document.createElement('li');
      li.classList.add('sent');
      const dom = `
      <span class="message">${this.msg}</span>
      <span class="time">${this.time}</span>`;
      
      li.innerHTML = dom;
      chatList.appendChild(li);
      chatInput.value= '';
    };
  }


  function Chatbot(name, msg, time) {
    this.name = name;
    this.msg = msg;
    this.time = time;
  
    this.makeLi = () => {
      const li = document.createElement('li');
      li.classList.add('received');
      const dom = `<span class="profile">
      <img class="received-image" src=./images/icon.png alt="any">
      </span>
      <span class="message">안녕하세요.</span>
      <span class="time">${this.time}</span>`;
  
      li.innerHTML = dom;
      chatList.appendChild(li);
    };
  }