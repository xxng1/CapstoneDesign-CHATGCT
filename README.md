# 졸업프로젝트 웹사이트

이 웹사이트는 대학 공지사항에 대한 질문-응답 시스템과 개설 강좌 추천 서비스, 시간표 관리 시스템을 제공합니다.

## 1. 프로젝트 목표 & 팀원 소개

### 프로젝트 목표

- 이 프로젝트는 구현 뿐만 아니라 클라우드 환경에서 애플리케이션을 CI/CD를 통해 배포하는 경험을 목표로 진행되었습니다.

### 팀원 소개

- 양권상, 박상웅, 전병현, 전재환

## 2. 사용 기술

### DeepLearning

- Language: Python
- Model: bert

### Back-end

- Stack: JavaScript, Node.js, Express, MySQL
- Libraries: express-session, express-mysql-session, ejs, child_process, ...

### Front-end

- Stack: JavaScript, ejs, ...
- Libraries: ..., ...

### Deployment

- 학교 서버 이용

### Github Branch Management

- 브랜치 관리 전략은 Github Flow를 사용
- 모든 브랜치는 Pull Request를 통해 팀원의 리뷰 후 메인에 merge

## 3. 주요 기능

1. **질문-응답 시스템**: 사용자의 질문에 답변하기 위해 BERT 모델을 이용하여 학습된 대학 공지 데이터셋을 기반으로 하는 시스템입니다.
2. **개설 강좌 추천 서비스**: 사용자의 선호도 와 과목의 이수를 고려하여 개설 강좌를 추천해주는 시스템입니다.
3. **시간표 관리 시스템**: 개인 시간표를 관리할 수 있는 시스템입니다.

## 4. 실행화면

![Main Screen](public/images/main_screen.png)

## 5. 설치 방법

# 프로젝트 클론
git clone https://github.com/xxng1/CapstoneDesign_CHATGCT.git

# 프로젝트 디렉토리로 이동
cd your-project-name

# 필요한 패키지 설치
npm install

# 서버 실행
npm start

# 웹 브라우저에서 다음 주소로 접속
http://ceprj.gachon.ac.kr:60008/

## 6. 라이센스
이 프로젝트는 MIT 라이센스를 따릅니다.

