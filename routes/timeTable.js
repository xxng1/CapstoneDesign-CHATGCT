const express = require("express");
const router = express.Router();
const mysql = require("mysql");

// MySQL DB 연결
const connection = mysql.createConnection({
  host: "localhost", // DB서버 IP주소
  port: 3306, // DB서버 Port주소
  user: "dbid231", // DB접속 아이디
  password: "dbpass231", // DB암호
  database: "db23108", //사용할 DB명
});

//루트경로에서 실행
router.get("/", (req, res) => {
  let search = req.query.search || "";
  let department = req.query.department;

  // 기본 쿼리를 작성합니다. 처음에는 모든 과목을 선택합니다.
  let query = `SELECT * FROM courses`;

  // 검색어나 학과가 설정된 경우, 쿼리에 조건을 추가합니다.
  if (search || (department && department !== "전체 학과")) {
    query +=
      " WHERE (교과목명 LIKE '%" +
      search +
      "%' OR 담당교수 LIKE '%" +
      search +
      "%')";

    // 학과가 '전체 학과'가 아닌 경우, 학과 조건을 추가합니다.
    if (department && department !== "전체 학과") {
      query += " AND 개설조직 LIKE '%" + department + "%'";
    }
  }

  // 데이터베이스에서 쿼리를 실행하고 결과를 가져옵니다.
  connection.query(query, (err, result) => {
    // 쿼리 실행 중 오류가 발생한 경우 오류를 출력하고 처리합니다.
    if (err) throw err;

    // user table에서 로그인된 사용자의 이름을 가져옵니다.
    const nameQuery = `SELECT name FROM user WHERE loginid = ?`;
    connection.query(nameQuery, [req.session.login_id], (err, nameResult) => {
      if (err) throw err;

      let context = {
        courses: result,
        name: nameResult[0].name,
        // 다른 필요한 변수들도 여기에 추가해주세요.
      };
      // 결과를 사용하여 페이지를 렌더링합니다.
      res.render("user/timeTable", context);
    });
  });
});

//시간표 정보를 db에서 가져온다
router.get("/getCourse", (req, res) => {
  const query = `
    SELECT timeTable.강의시간, timeTable.교과목명, timeTable.이수, timeTable.담당교수, timeTable.학점, courses.강의실
    FROM timeTable
    JOIN courses ON timeTable.학수번호 = courses.학수번호
    WHERE timeTable.user_id = ?
  `;

  connection.query(query, [req.session.login_id], (err, results) => {
    if (err) {
      console.error(err);
      res.status(500).json({ message: "Failed to fetch course information." });
    } else {
      res.status(200).json(results);
    }
  });
});

//시간표 정보를 저장
router.post("/addCourse", (req, res) => {
  const course = req.body; // 클라이언트에서 전송된 데이터

  // 데이터베이스에 시간표 추가
  const query =
    "INSERT INTO timeTable (학수번호, 교과목명, 이수, 학점, 담당교수, 강의시간, user_id) VALUES (?, ?, ?, ?, ?, ?, ?)";
  const values = [
    course.학수번호,
    course.교과목명,
    course.이수,
    course.학점,
    course.담당교수,
    course.강의시간,
    req.session.login_id,
  ];
  connection.query(query, values, (err, result) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ message: "Failed to add course to the database." });
    } else {
      res.status(200).json({ message: "Course added to the database." });
    }
  });
});

// 강의를 timeTable에서 삭제
router.delete("/deleteCourse", (req, res) => {
  const data = req.body; // Get data from request body
  const courseName = data.courseName;

  const query = "DELETE FROM timeTable WHERE user_id = ? AND 교과목명 = ?";

  connection.query(query, [req.session.login_id, courseName], (err, result) => {
    if (err) {
      console.error(err);
      res
        .status(500)
        .json({ success: false, message: "강의 삭제에 실패하였습니다." });
    } else {
      res.json({ success: true, message: "강의 삭제가 완료되었습니다." });
    }
  });
});

module.exports = router;
