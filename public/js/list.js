// 옵션 요소를 텍스트 내용 기준으로 정렬
const selectEl = document.getElementById("department-list"); // select 요소 선택
const options = selectEl.querySelectorAll("option"); // 옵션 요소들을 NodeList 타입으로 선택

const regex = /[^ㄱ-ㅎㅏ-ㅣ가-힣a-zA-Z0-9]/gi; // 정규식: 한글, 영문 대소문자, 숫자, 기호 등을 제외하고 추출

options.forEach((el, idx, list) => {
  const text = el.textContent.replace(regex, ""); // 정규식 적용하여 한글, 영문 대소문자, 숫자만 남기고 제거
  const sorted = Array.from(list) // Node List -> Array로 변경 
    .sort((a, b) => 
      a.textContent.replace(regex, "").localeCompare(b.textContent.replace(regex, ""))
    );
  // 정렬된 옵션으로 select 요소의 html을 새로 렌더링합니다.
  selectEl.innerHTML = "";
  sorted.forEach((option) => selectEl.appendChild(option));
});
