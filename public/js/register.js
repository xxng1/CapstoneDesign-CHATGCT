function isValidEmail(loginid) {
  // 이메일은 일반적으로 local-part@domain 형식을 따릅니다.
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(loginid);
}

function isValidPassword(password) {
  // 비밀번호는 8~20자의 영문 대소문자, 숫자, 특수문자(!, @, #, $, %, ^, &, *)를 사용하며, 모두 포함해야 합니다.
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
  var name = document.forms[0]["name"].value;
  var studentnum = document.forms[0]["studentnum"].value;
  var subject = document.forms[0]["subject"].value;
  var loginid = document.forms[0]["loginid"].value;
  var password = document.forms[0]["password"].value;

  if (
    name == "" ||
    studentnum == "" ||
    subject == "" ||
    loginid == "" ||
    password == ""
  ) {
    alert("모든 필드를 채워주세요!");
    return false;
  }

  var password = document.getElementById("loginid").value;

  if (!isValidEmail(loginid)) {
    alert("유효한 이메일 주소를 입력해주세요.");
    return false;
  }

  var password = document.getElementById("password").value;

  if (!isValidPassword(password)) {
    alert(
      "비밀번호는 8~20자의 영문 대소문자, 숫자, 특수문자(!, @, #, $, %, ^, &, *)를 사용하며, 모두 포함되어야 합니다."
    );
    return false;
  }

  // 유효성 검사에 모두 통과한 경우, 폼 전송을 진행합니다.
  return true;
}

// 모달 창 표시
var modal = document.getElementById("verificationModal");
var closeBtn = document.getElementsByClassName("close")[0];
var register = document.getElementById("register");

register.onclick = function (event) {
  if (!validate()) {
    event.preventDefault();
    return;
  }
  modal.style.display = "block";
};

closeBtn.onclick = function () {
  modal.style.display = "none";
};

// 인증코드 요청에 대한 응답을 alert 창에 표시
function handleSubmit(event, url) {
  event.preventDefault();

  var form = event.target;
  var data = {};
  Array.from(form.elements).forEach((element) => {
    if (element.name) {
      data[element.name] = element.value;
    }
  });

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
    .then((data) => {
      alert(data.message);
      if (data.redirect) {
        window.location.href = data.redirect;
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
  .getElementById("verificationCode")
  .addEventListener("submit", function (event) {
    handleSubmit(event, "/login/register_process");
  });

document
  .getElementById("send_code")
  .addEventListener("submit", function (event) {
    handleSubmit(event, "/login/send_code");
  });
