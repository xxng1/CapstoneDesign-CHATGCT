function isValidEmail(email) {
  // 이메일은 일반적으로 local-part@domain 형식을 따릅니다.
  var pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return pattern.test(email);
}

function validate() {
  var email = document.forms[0]["newEmail"].value;

  if (!isValidEmail(email)) {
    alert("유효한 이메일 주소를 입력해주세요.");
    return false;
  }

  // 유효성 검사에 모두 통과한 경우, 폼 전송을 진행합니다.
  return true;
}

// 모달 창 표시
var modal = document.getElementById("verificationModal");
var closeBtn = document.getElementsByClassName("close")[0];
var newEmailBtn = document.getElementById("newEmailBtn");

newEmailBtn.addEventListener("click", function (event) {
  if (!validate()) {
    event.preventDefault();
    return;
  }
  modal.style.display = "block";
});

closeBtn.onclick = function () {
  modal.style.display = "none";
};

// 인증코드 요청에 대한 응답을 alert 창에 표시
function handleSubmit(event, url) {
  event.preventDefault();

  // form의 데이터를 가져옵니다.
  let formData = new FormData(event.target);
  let data = Object.fromEntries(formData.entries());

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
      alert(JSON.stringify(data.message));
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

//아이디 변경 요청
document
  .getElementById("changeEmail")
  .addEventListener("submit", function (event) {
    handleSubmit(event, "/mypage/change_id/changeId_process");
  });

//인증코드 확인
document
  .getElementById("verificationCode")
  .addEventListener("submit", function (event) {
    handleSubmit(event, "/mypage/change_id/verify");
  });
