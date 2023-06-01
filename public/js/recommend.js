const chatList = document.querySelector(".chatting-list");
const sent = document.querySelector(".sent");
const classtime = document.getElementById("classtime");
const subtype = document.getElementById("subtype");

var submitbtn = document.getElementById("submitbtn");
var classtimeVAL = classtime.value;
var subtypeVAL = subtype.value;

const selectElement = document.getElementById('classtime');

const getData = () => {
    fetch("/recommend/makelist", {
        method: "POST",
        headers: {
      "Content-Type": "application/json",
    },
    })
    .then(response => response.json())
    .then(data => {
        data.forEach(item => {
        const option = document.createElement('option');
        option.value = item;
        option.textContent = item;  
        selectElement.appendChild(option);
        });
    })
    .catch(error => {
        console.error('데이터 가져오기 오류:', error);
    });
};

// getData() 함수 호출
window.onload=getData();

classtime.addEventListener("change", function() { 
    var classtimeVAL = classtime.value;
    var subtypeVAL = subtype.value;   
    if (classtimeVAL !=="수업시간" && subtypeVAL !== "이수") {
        submitbtn.disabled = false;
    }
    else{
        submitbtn.disabled = true;
    }
});


subtype.addEventListener("change", function() {
    var classtimeVAL = classtime.value;
    var subtypeVAL = subtype.value;
    if (classtimeVAL !=="수업시간" && subtypeVAL !== "이수") {
        submitbtn.disabled = false;
    }
    else{
        submitbtn.disabled = true;
    }
});

submitbtn.addEventListener("click", rcmd);

function rcmd() {
    const li = document.createElement("li");
    var classtimeVAL = classtime.value;
    var subtypeVAL = subtype.value;

    fetch("/recommend/recommend_process", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            subtypeVAL: subtypeVAL,
            classtimeVAL: classtimeVAL
        })
    })
    .then(response => response.json())
    .then(data => {
        li.classList.add("received");

        function addButtons() {
            const buttons = data.map(item => {
                const button = document.createElement("button");
                button.classList.add("addcourse");
                button.textContent = `학수번호: "${item.num}"  교과목명: "${item.name}"  이수: "${item.subtype}"  학점: "${item.score}"  담당교수:  "${item.professor}"  강의시간: "${item.time}"  강의실: "${item.room}"`;
                button.addEventListener("click", () => {
                    const timeList = item.time.split(",");
                    fetch("/recommend/timelist", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                    })
                    .then(response => response.json())
                    .then(data => {
                        const dataArray = Array.from(data);
                        const usertimeList = dataArray.join(",").split(",");
                        function hasOverlap(arr1, arr2) {
                            for (var i = 0; i < arr1.length; i++) {
                              if (arr2.includes(arr1[i])) {
                                return true;
                              }
                            }
                            return false;
                        }
                        var overlap = hasOverlap(usertimeList, timeList);
                        if (overlap) {
                            alert("시간이 겹치는 강의가 있습니다!");
                        }
                        else {
                            const confirmed = confirm("추가하시겠습니까?");
                    if (confirmed) {
                        const data = {
                            학수번호: item.num,
                            교과목명: item.name,
                            담당교수: item.professor,
                            이수: item.subtype,
                            강의시간: item.time,
                            학점: item.score,
                          };

                        fetch("/timeTable/addCourse", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify(data),
                          })
                        .then((response) => response.json())
                        .catch((error) => {
                            console.error(error);
                        });
                        alert("성공적으로 추가되었습니다!");
                        const messageElement = li.querySelector(".message");
                        messageElement.removeChild(button);
                    } 
                        }
                    })
                });
                return button;
            });
            return buttons;
        }

        const buttons = addButtons();

        const dom = `
        <span class="profile">
            <img class="received-image" src="/images/icon.png" alt="any">GCT
        </span>
        <span class="message">
            ${classtimeVAL}에 ${subtypeVAL} 과목 추천 
            <button class="research">다시 검색</button>
            <br><br>
        </span>`;

        li.innerHTML = dom;
        const messageElement = li.querySelector(".message");
        buttons.forEach(button => {
            messageElement.appendChild(button);
        });
        // //버튼의 순서 재조정 미완성
        // function getcoursedays(array){
        //     const originalArray = array;
        //     const newArray = [];

        //     for (let i = 0; i < originalArray.length; i++) {
        //         const item = originalArray[i];
        //         const cleanedItem = item.replace(/\d/g, ''); // 숫자를 제거한 문자열 생성
        //         newArray.push(cleanedItem);
        //     }
        //     const uniqueArray = [...new Set(newArray)];
        //     return uniqueArray;
        // }

        // function hasOverlap(arr1, arr2) {
        //     for (var i = 0; i < arr1.length; i++) {
        //       if (arr2.includes(arr1[i])) {
        //         return true;
        //       }
        //     }
        //     return false;
        // }
        chatList.appendChild(li);
        sent.style.display = "none";

        const researchButton = document.querySelector(".research");
        researchButton.addEventListener("click", researchButtonClick);

        function researchButtonClick() {
            sent.style.display = "flex";
            chatList.removeChild(li);
        }
    })
    .catch(error => {
        console.error("데이터 가져오기 오류:", error);
    });
}
