#import QuestionAnsweringModel
import logging 
from simpletransformers.question_answering import QuestionAnsweringModel, QuestionAnsweringArgs
import pandas as pd
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
import re
import torch
import tiktoken
from kiwipiepy import Kiwi
from kiwipiepy.utils import Stopwords


#pd.read_csv('notification.csv')
content = """1. 외교부 국립외교원은 2021년부터 대외교육기능을 확대하여 국민외교아카데미 과정을 신설하여 운영하고 있습니다. 
   ㅇ 국민외교아카데미는 국민에게 외교 전반에 대한 경험과 정보를 제공하여, 국민의 외교와 외교 정책에 대한 관심과 이해를 제고하고, 국민의 외교역량을 강화하기 위한 최초의 정부 주도 대국민 외교 학습·교육 프로그램
   ㅇ △청소년(고등학생) △대학생 △일반국민 △언론인 대상 프로그램 시행
2. 위 관련, 국립외교원은 2023년 제4기 국민외교아카데미 대학생 외교 연수 과정을 아래와 같이 개최할 예정이니, 많은 신청바랍니다.
 
  - 아       래 -

   ㅇ 기간 및 장소 : 2023.07.10.(월)-07.21.(금), 서울시 서초구 양재동 국민외교타운 5층 국민외교아카데미관(남부순환로 2558)
   ㅇ 참가 대상 : 2023년 7월 기준 국내 대학 재학생 전학년(전공 제한 없음, 휴학생 및 졸업예정자 포함)
   ㅇ 선발 인원 : 40명
   ㅇ 선발 기준 : 대학별 추천자 중 자기소개서 및 지원동기를 기준으로 학년, 성별 및 지역별 비율을 고려하여 선발
   ㅇ 선발 절차 
      ① 참가 희망자가 각 대학 관련 부서로 참가 신청서 제출 ※ 제출처 : js@gachon.ac.kr / 031-750-5052 (2023.06.02.(금)까지)
      ② 각 대학 관련 부서는 참가 신청서를 취합, 내용 확인 후 추천자를 선발, 국립외교원으로 제출
         - 제출 서류 : (학생별) 참가신청서 및 개인정보이용동의서
          ※ 금번 과정은 조별 실습 및 토론이 병행되기 때문에 대면 진행 예정이나, 지방 거주 학생 중 부득이하게 비대면 수강을 희망하는 경우,(붙임1) 양식에비대면 수강 필요 사유를 구체적으로 기재하여 제출요망
      ③ 접수된 각 대학 추천자 중 국민외교아카데미 운영위원회를 통해 40명 선발
   ㅇ 선발자 발표 : 2023.06.30.(금), 국립외교원 홈페이지 게시 및 개별 연락 예정
   ㅇ 대학생 외교 연수 과정 이수자에게는 국립외교원장 명의 수료증 부여 예정이며, 실습(워크숍) 우수자 시상 예정
   ㅇ 문의 : 국립외교원 기획협력과(knda_academy@mofa.go.kr, 02-3497-7788)

붙임  1. (학생별)국민외교아카데미 참가신청서(대학생 외교 연수 과정_학생 본인 작성) 1부.
      2. (학생별) 개인정보이용동의서(대학생 외교 연수 과정_학생 본인 작성) 1부.
      3. 대학생 외교 연수 과정 포스터 1부.  끝."
12315,[공지사항-기타공지] 「스마트 무당이 위치정보 서비스」 정식 OPEN 행사 개최 안내,정보운영팀,2023-05-11,963,0,https://www.gachon.ac.kr/commonNotice/kor/86395/artclView.do,"디지털정보처에서 알려드립니다.

「스마트 무당이 위치정보 서비스」 정식 OPEN 행사를 진행합니다.
참여 학생을 대상으로 소정의 기념품을 증정 할 예정이니 많은 관심과 참여 부탁드립니다.

  ■ 행사명 : 「스마트 무당이 위치정보 서비스」 정식 OPEN 행사
  ■ 주   관 : 총학생회, 디지털정보처
  ■ 일   시 : 2023.05.16.(화) 14:30
  ■ 장   소 : 가천관 1층 무한대상 앞
  ■ 기념품 : 카카오프렌즈 문구류, 토이류
                  (기념품 수량은 조기 소진될 수 있습니다.)


에코버스 위치정보 서비스 「스마트 무당이」는 P학기 프로젝트 작품을 상용화하는 것으로 학생들의 편의성 제공뿐만이 아닌 학습 동기 유발효과도 기대되는 결과물입니다.
많은 관심과 참여 부탁드립니다.

디지털정보처에서는 사용자의 편리한 서비스가 최우선이 되도록 노력하겠습니다.

-제39대 총학생회, 디지털정보처-"
"""
kiwi = Kiwi(model_type='sbg', typos='basic')
stopwords = Stopwords()
def Token(answer):
    answer_token = kiwi.tokenize(answer,stopwords=stopwords)
    
    answer_TOKEN = []
    
    for i in answer_token:
        if i[1] == "NNG" or (i[1] == "NNP") or i[1] == "SN" or i[1] == "SL" or (i[1] == "W_SERIAL") :
            answer_TOKEN.append(i[0])
    return answer_TOKEN


def create_chunks(text, chunk_size, overlap):
    tt_encoding = tiktoken.get_encoding("gpt2")
    tokens = tt_encoding.encode(text)
    total_tokens = len(tokens)
    
    chunks = []
    start = 0
    while start < total_tokens:
        end = start + chunk_size
        if end > total_tokens:
            end = total_tokens
        chunk = tokens[start:end]
        chunk_text = tt_encoding.decode(chunk)
        chunks.append(chunk_text)
        start = end - overlap

        if end == total_tokens:
            break

    return chunks

def clean_content(content):
    lines = content.split('\n')
    new_lines = [line for line in lines if line.strip()]  # 비어 있지 않은 줄만 선택
    new_content = "\n".join(new_lines)
    new_str = re.sub('[^A-Za-z0-9가-힣\s\-,(\)]', '', new_content)
    return new_str

def get_answer(question, context):
    inputs = tokenizer(question, context, return_tensors="pt")
    
    with torch.no_grad():
        outputs = model(**inputs)
        
    answer_start_index = outputs.start_logits.argmax()
    answer_end_index = outputs.end_logits.argmax()
    
    predict_answer_tokens = inputs.input_ids[0, answer_start_index : answer_end_index + 1]
    answer = tokenizer.decode(predict_answer_tokens, skip_special_tokens=True)
    
    return answer



# 사전 훈련된 BERT 토크나이저 로드

c_content = clean_content(content)

tokenizer = AutoTokenizer.from_pretrained("Kdogs/klue-finetuned-squad_kor_v1")

model = AutoModelForQuestionAnswering.from_pretrained("Kdogs/klue-finetuned-squad_kor_v1")

chunk_size = 300
overlap = 10


question = "국민외교아카데미 참가대상 알려줘"

content_tokens = tokenizer.tokenize(c_content)
Q_token = Token(question)
print(len(content_tokens))

if len(content_tokens) > 512:
    chunks = create_chunks(c_content, chunk_size, overlap)
    c=0
    for chunk in chunks:
        if all(index in chunk for index in Q_token):
            print(type(chunk))
            print(chunk[0])
            print(f"{c}번째 대답 : {get_answer(question, chunk)}")
        else:
            pass
        c+=1
    
else:
    print(get_answer(question, c_content))


