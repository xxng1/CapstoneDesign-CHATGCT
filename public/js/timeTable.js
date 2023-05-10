//새로고침하면 실행
document.addEventListener("DOMContentLoaded", () => {
  //새로고침해도 시간표 정보를 가져오는 요청
  fetch("/timeTable/getCourse")
    .then((response) => response.json())
    .then((data) => {
      // 서버에서 받은 강의 정보를 사용하여 시간표 구성
      buildTimeTable(data);
    })
    .catch((error) => {
      console.error(error);
    });

  // course-list-body 요소 가져오기
  const courseListBody = document.querySelector("#course-list-body");
  if (courseListBody) {
    // course-list-body에 클릭 이벤트 리스너 추가
    courseListBody.addEventListener("click", (event) => {
      const target = event.target;
      // 클릭된 요소가 td인 경우에는 부모인 tr을 찾음
      const tr = target.closest("tr");
      if (tr) {
        // 행을 클릭한 경우에 대한 처리 로직
        const courseInfo = {
          학수번호: tr.querySelector("td:nth-child(1)").textContent,
          교과목명: tr.querySelector("td:nth-child(2)").textContent,
          이수: tr.querySelector("td:nth-child(3)").textContent,
          학점: tr.querySelector("td:nth-child(4)").textContent,
          담당교수: tr.querySelector("td:nth-child(5)").textContent,
          강의시간: tr.querySelector("td:nth-child(6)").textContent,
        };
        showModal(courseInfo);
      }
    });
  } else {
    console.error("course-list-body 요소를 찾을 수 없습니다.");
  }
});

//시간표를 작성하는 함수
function buildTimeTable(courseData) {
  const table = document.getElementById("timeTable");

  courseData.forEach((course) => {
    const courseTime = course["강의시간"];
    const cellIds = getTableCellIds(courseTime);
    const color = getRandomColor();
    const courseName = course["교과목명"];

    cellIds.forEach((cellId) => {
      const cell = table.querySelector(`#${cellId}`);
      cell.style.backgroundColor = color;
      cell.textContent = courseName;
    });
  });
}

//모달창 생성 함수
function showModal(course) {
  const modal = document.querySelector("#modal");
  const modalContent = modal.querySelector(".modal-content");

  // Clear previous content
  modalContent.innerHTML = "";

  // Create elements to display course information
  const heading = document.createElement("h2");
  heading.textContent = "강의 정보";

  const table = document.createElement("table");
  table.classList.add("course-info-table");

  // Create table rows for each course property
  for (const key in course) {
    const row = document.createElement("tr");

    const labelCell = document.createElement("td");
    labelCell.textContent = key;

    const valueCell = document.createElement("td");
    valueCell.textContent = course[key];

    row.appendChild(labelCell);
    row.appendChild(valueCell);

    table.appendChild(row);
  }

  modalContent.appendChild(heading);
  modalContent.appendChild(table);

  // 버튼 요소 추가
  const yesButton = document.createElement("button");
  yesButton.id = "yes-btn";
  yesButton.textContent = "네";

  const noButton = document.createElement("button");
  noButton.id = "no-btn";
  noButton.textContent = "아니오";

  const closeButton = document.createElement("span");
  closeButton.className = "close";
  closeButton.innerHTML = "&times;";
  closeButton.textContent = "×";

  modalContent.appendChild(yesButton);
  modalContent.appendChild(noButton);
  modalContent.appendChild(closeButton);

  //네 버튼 클릭 경우 실행 함수
  yesButton.addEventListener("click", (event) => {
    event.stopPropagation();
    const courseTime = course["강의시간"];
    const cellIds = getTableCellIds(courseTime);
    /*
      //강의시작시간, 강의끝시간 가져오기
      const timesArr = courseTime.split(",").map((courseTime) => courseTime.trim());
      const str = courseTime;
      const days = [];
  
      // 쉼표(,)를 기준으로 문자열을 나누고 배열로 변환
      const strArray = str.split(",");
  
      // 배열의 각 요소에서 요일 정보를 추출하여 days 배열에 추가
      strArray.forEach(function(element) {
        const day = element.slice(0, 1);
        if (!days.includes(day)) {
          days.push(day);
        }
      });
  
      // days 배열 출력
      console.log(days); // ["월", "목"]
      
      const startTime = times[timesArr[0].slice(1).trim()].start;
      const endTime = times[timesArr[timesArr.length -1].slice(1).trim()].end;
      */
    const table = document.getElementById("timeTable");
    let hasConflict = false;

    for (const cellId of cellIds) {
      const cell = table.querySelector(`#${cellId}`);
      //동일한 시간의 과목 처리
      if (cell && cell.textContent !== "") {
        hasConflict = true;
        alert("해당 시간에 이미 수업이 존재합니다.");
        break;
      }
    }

    //동일한 이름의 과목 처리
    if (!hasConflict) {
      const color = getRandomColor();
      const courseName = course["교과목명"];
      let duplicateFound = false;
      for (const cell of table.querySelectorAll("td")) {
        if (cell.textContent === courseName) {
          duplicateFound = true;
          alert("동일한 이름의 과목이 존재합니다.");
          break;
        }
      }

      if (!duplicateFound) {
        cellIds.forEach((cellId) => {
          const cell = table.querySelector(`#${cellId}`);
          cell.style.backgroundColor = color;
          cell.textContent = courseName;
        });
      
        // fetch 요청 보내기
        const data = {
          학수번호: course["학수번호"],
          교과목명: course["교과목명"],
          담당교수: course["담당교수"],
          이수: course["이수"],
          강의시간: course["강의시간"],
          학점: course["학점"],
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
            // 오류 처리
            console.error(error);
          });
      
        // Find the start row and end row for the course
        const startRow = parseInt(cellIds[0].split("-")[1], 10);
        const endRow = parseInt(cellIds[cellIds.length - 1].split("-")[1], 10);
      
        console.log('Start row:', startRow, 'End row:', endRow);
      
        // Merge the cells vertically and maintain cell width
        const firstCellId = cellIds[0];
        const firstCell = table.querySelector(`#${firstCellId}`);
        firstCell.rowSpan = endRow - startRow + 1;
      
        // Remove other cells in the merged cell range
        for (let i = 1; i < cellIds.length; i++) {
          const cellId = cellIds[i];
          const cell = table.querySelector(`#${cellId}`);
          if (cell) {
            cell.remove();
          }
        }
      }
      
      
    }

    modal.style.display = "none";
  });

  noButton.addEventListener("click", () => {
    // 아니오 버튼이 클릭된 경우 모달창 닫기
    modal.style.display = "none";
  });

  closeButton.addEventListener("click", () => {
    // x 버튼이 클릭된 경우 모달창 닫기
    modal.style.display = "none";
  });

  // 모달창 외부 클릭 이벤트 리스너 추가
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });

  // 모달창 띄우기
  modal.style.display = "block";
}
//-------------------------------------------------------------------------------------------------------

//수업시간
const times = {
  A: { start: "09:30", end: "10:45" },
  B: { start: "11:00", end: "12:15" },
  C: { start: "13:00", end: "14:15" },
  D: { start: "14:30", end: "15:45" },
  E: { start: "16:00", end: "17:15" },
  F: { start: "17:30", end: "18:45" },
  G: { start: "18:55", end: "20:10" },
  H: { start: "20:20", end: "21:35" },
  I: { start: "21:45", end: "23:00" },
  1: { start: "09:00", end: "10:00" },
  2: { start: "10:00", end: "11:00" },
  3: { start: "11:00", end: "12:00" },
  4: { start: "12:00", end: "13:00" },
  5: { start: "13:00", end: "14:00" },
  6: { start: "14:00", end: "15:00" },
  7: { start: "15:00", end: "16:00" },
  8: { start: "16:00", end: "17:00" },
  9: { start: "17:00", end: "18:00" },
  10: { start: "18:00", end: "19:00" },
  11: { start: "19:00", end: "20:00" },
  12: { start: "20:00", end: "21:00" },
  13: { start: "21:00", end: "22:00" },
  14: { start: "22:00", end: "23:00" },
  15: { start: "23:00", end: "24:00" },
};
//-----------------------------------------------------------------------------------------------------

//timeTable cell id 가져오는 함수
function getTableCellIds(time) {
  const timesArr = time.split(",").map((t) => t.trim());
  const cellIds = [];

  timesArr.forEach((t) => {
    const day = t.slice(0, 1);
    const period = t.slice(1).trim();

    let cellId = "";

    switch (day) {
      case "월":
        cellId += "mon";
        break;
      case "화":
        cellId += "tue";
        break;
      case "수":
        cellId += "wed";
        break;
      case "목":
        cellId += "thu";
        break;
      case "금":
        cellId += "fri";
        break;
      default:
        return null;
    }

    // 숫자로 된 시간대 정보 참조
    if (/^\d+$/.test(period)) {
      // period가 숫자로만 구성되어 있을 때
      const startHour = times[period].start.split(":")[0];
      const endHour = times[period].end.split(":")[0];

      for (let i = startHour; i < endHour; i++) {
        const cellHour = i;
        cellIds.push(`${cellId}-${cellHour}`);
      }
    }

    // 문자로 된 시간대 정보 참조
    if (/^[A-Z]$/.test(period)) {
      // period가 대문자 알파벳으로 구성되어 있을 때
      const startHour = times[period].start.split(":")[0];
      const startMin = times[period].start.split(":")[1]; // 분 정보 추출

      const endHour = times[period].end.split(":")[0];
      const endMin = times[period].end.split(":")[1]; // 분 정보 추출

      for (let i = startHour; i <= endHour; i++) {
        const cellHour = isNaN(i) ? i.charCodeAt(0) - 64 : i;
        cellIds.push(`${cellId}-${cellHour}`);
      }
    }
  });

  return cellIds;
}
//-----------------------------------------------------------------------------------------------------

//색깔 주는 함수
function getRandomColor() {
  const letters = "0123456789ABCDEF";
  let color = "#";
  for (let i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}
//-----------------------------------------------------------------------------------------------------

document.addEventListener("DOMContentLoaded", () => {
  const table = document.getElementById("timeTable");
  if (table) {
    // 시간표 정보를 가져오는 요청 및 처리 로직
    fetch("/timeTable/getCourse")
      .then((response) => response.json())
      .then((data) => {
        buildTimeTable(data, table);
      })
      .catch((error) => {
        console.error(error);
      });

    // 테이블 내의 셀 클릭 이벤트 리스너 추가
    table.addEventListener("click", (event) => {
      const target = event.target;
      if (target.tagName === "TD" && target.textContent !== "") {
        showModalDelete(target);
      }
    });
  } else {
    console.error("timeTable 요소를 찾을 수 없습니다.");
  }
});

// 모달창을 생성하는 함수
function showModalDelete(cell) {
  const modal = document.querySelector("#modal1");
  const modalContent = modal.querySelector(".modal-content");

  // Clear previous content
  modalContent.innerHTML = "";

  // Create elements to display course information
  const heading = document.createElement("h2");
  heading.textContent = "강의 정보";

  const courseName = document.createElement("p");
  courseName.textContent = `교과목명: ${cell.textContent}`;

  // Create delete button
  const deleteButton = document.createElement("button");
  deleteButton.textContent = "삭제";
  deleteButton.addEventListener("click", () => {
    deleteCourse(cell);
    modal.style.display = "none"; // 모달창 닫기
  });

  // Add elements to modal content
  modalContent.appendChild(heading);
  modalContent.appendChild(courseName);
  modalContent.appendChild(deleteButton);

  // Display the modal
  modal.style.display = "block";

  // 모달창 외부 클릭 이벤트 리스너 추가
  window.addEventListener("click", (event) => {
    if (event.target === modal) {
      modal.style.display = "none";
    }
  });
}


// Store the deleted cells information
const deletedCells = {};
console.log(deletedCells);

// 강의를 삭제하는 함수
function deleteCourse(cell) {
  const cellId = cell.id;
  const courseName = cell.textContent.trim();
  console.log(cellId);
  
  // Remove course from the table
  cell.style.backgroundColor = "";
  cell.textContent = "";
  cell.rowSpan = 1;

  // Restore the deleted cell if it exists in the deletedCells object
  const deletedCellInfo = deletedCells[cellId];
  if (deletedCellInfo) {
    const newRow = table.rows[deletedCellInfo.row];
    newRow.insertBefore(deletedCellInfo.cell, newRow.children[deletedCellInfo.cellIndex]);
    delete deletedCells[cellId];
  }

  // Remove course from the database
  const data = {
    courseName: courseName,
  };

  fetch("/timeTable/deleteCourse", {
    method: "DELETE",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  })
    .then((response) => response.json())
    .catch((error) => {
      console.error(error);
    });
}



// 실시간으로 검색하고 내용 출력
document.addEventListener("DOMContentLoaded", function () {
  const searchInput = document.getElementById("search-box");
  const courseListBody = document.getElementById("course-list-body");

  searchInput.addEventListener("keyup", function (event) {
    const searchTerm = event.target.value.toLowerCase();
    const courses = document.querySelectorAll("#course-list-body tr");
    let hasResults = false;
    let noResultsRow = document.getElementById("no-results");

    courses.forEach(function (course) {
      const courseNameElement = course.querySelector("td:nth-child(2)");
      const professorNameElement = course.querySelector("td:nth-child(5)");

      if (courseNameElement && professorNameElement) {
        const courseName = courseNameElement.textContent.toLowerCase();
        const professorName = professorNameElement.textContent.toLowerCase();

        if (
          courseName.includes(searchTerm) ||
          professorName.includes(searchTerm)
        ) {
          course.style.display = "table-row";
          hasResults = true;
        } else {
          course.style.display = "none";
        }
      }
    });

    if (!hasResults) {
      if (!noResultsRow) {
        noResultsRow = document.createElement("tr");
        noResultsRow.setAttribute("id", "no-results");
        const noResultsCell = document.createElement("td");
        noResultsCell.setAttribute("colspan", "6");
        noResultsCell.textContent = "일치하는 과목이 없습니다.";
        noResultsRow.appendChild(noResultsCell);
        courseListBody.appendChild(noResultsRow);
      } else {
        noResultsRow.style.display = "table-row";
        noResultsRow.querySelector("td").textContent =
          "일치하는 과목이 없습니다.";
      }
    } else if (noResultsRow) {
      noResultsRow.style.display = "none";
    }
  });
});
