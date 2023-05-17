function isValidEmail(username) {
  // 이메일은 일반적으로 local-part@domain 형식을 따릅니다.
  // id 값이 "adminid" 또는 "testid"인 경우에는 이메일 형식 검사를 수행하지 않고 항상 true를 반환
  if (username === "adminid" || username === "testid") {
    return true;
  }
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(username);
}

function isValidPassword(password) {
  // 비밀번호는 8~20자의 영문 대소문자, 숫자, 특수문자(!, @, #, $, %, ^, &, *)를 사용하며, 모두 포함해야 합니다.
  // id 값이 "adminid" 또는 "testid"인 경우에는 이메일 형식 검사를 수행하지 않고 항상 true를 반환
  if (password === "adminpw" || password === "testpw") {
    return true;
  }
  var pattern =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*])[a-zA-Z\d!@#$%^&*]{8,20}$/;
  if (!pattern.test(password)) {
    return false;
  }

  var count = 0;
  if (password.match(/[a-z]/)) count++;
  if (password.match(/[A-Z]/)) count++;
  if (password.match(/\d/)) count++;
  if (password.match(/[!@#$%^&*]/)) count++;
  return count === 4; // 모든 종류가 포함되어야 하므로 카운트는 반드시 4여야 합니다.
}

function validate() {

  var username = document.forms[0]["id"].value;
  var password = document.forms[0]["pw"].value;

  if (!isValidEmail(username)) {
    alert("유효한 이메일 주소를 입력해주세요.");
    return false;
  }

  if (!isValidPassword(password)) {
    alert(
      "비밀번호는 8~20자의 영문 대소문자, 숫자, 특수문자(!, @, #, $, %, ^, &, *)를 사용하며, 모두 포함되어야 합니다."
    );
    return false;
  }

  // 유효성 검사에 모두 통과한 경우, 폼 전송을 진행합니다.
  return true;
}

var loginbtn2 = document.getElementById('loginbtn2');
loginbtn2.addEventListener('click', function(event) {
  if (!validate()) {
    event.preventDefault();
  }
});


// 인증코드 요청에 대한 응답을 alert 창에 표시
function handleSubmit(event, url) {
  event.preventDefault();

  // form의 데이터를 가져옵니다.
  let id = document.getElementById("username").value;
  let pw = document.getElementById("password").value;

  // 데이터를 객체 형태로 정의합니다.
  let data = {
    id: id,
    pw: pw,
  };

  fetch(url, {
    method: "POST",
    body: JSON.stringify(data),
    headers: {
      "Content-Type": "application/json",
    },
  })
    .then((response) => {
      if (!response.ok) {
        throw new Error("Network response was not ok");
      }
      return response.json();
    })
    .then(data => {
      if (data.redirect) {
        alert(data.message);
        window.location.href = data.redirect;
      } else {
        alert(data.message);
        if (data.message.includes("비밀번호가 일치하지 않습니다.")) {
          document.getElementById('password').value="";
          document.getElementById('password').focus(); 
        } else if (data.message.includes("와 일치하는 아이디가 없습니다.")) {
          document.getElementById('username').value="";
          document.getElementById('username').focus();
        }
      }
    })
    .catch((error) => {
      console.error(
        "There has been a problem with your fetch operation:",
        error
      );
    });
}

document
  .getElementById("login_process")
  .addEventListener("submit", function (event) {
    handleSubmit(event, "/login/login_process");
  });
