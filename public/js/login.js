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
  var password = document.forms[0]["pw"].value;

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
