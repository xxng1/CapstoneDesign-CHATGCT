from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import sys
import pandas as pd
from transformers import AutoTokenizer, AutoModelForQuestionAnswering
from kiwipiepy import Kiwi
from kiwipiepy.utils import Stopwords
import re
import torch
import tiktoken


tokenizer = AutoTokenizer.from_pretrained("Kdogs/klue-finetuned-squad_kor_v1")

model = AutoModelForQuestionAnswering.from_pretrained("Kdogs/klue-finetuned-squad_kor_v1")

question = sys.stdin.readline()

data = pd.read_csv('/home/t23108/svr/JH_PRACTICE/AI/crawling/notification.csv')

def clean_content(content):
    lines = content.split('\n')
    new_lines = [line for line in lines if line.strip()]  # 비어 있지 않은 줄만 선택
    new_content = "\n".join(new_lines)
    new_str = re.sub('[^A-Za-z0-9가-힣\s\-,(\).:]', '', new_content)
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

def Find_Title(df, max_score):
    same_score = df.loc[df['점수'] == max_score, ['제목']]
    top_score_list = same_score['제목'].tolist()
    return top_score_list

def Similar(noti_list,question):
    tfidf_vectorizer = TfidfVectorizer()
    noti_list.append(question)  # 입력 문장을 리스트에 추가
    
    # 문장들을 벡터화
    tfidf_matrix = tfidf_vectorizer.fit_transform(noti_list)
    
    # 입력 문장과 다른 문장들 간의 코사인 유사도 계산
    similarity_scores = cosine_similarity(tfidf_matrix[-1], tfidf_matrix[:-1])
    
    # 코사인 유사도가 높은 상위 3개 문장의 인덱스 가져오기
    top3_indices = similarity_scores.argsort()[0][-3:][::-1]
    
    # 상위 3개 문장 반환
    top3_sentences = [noti_list[i] for i in top3_indices]
    
    return top3_sentences

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

def main(question, data):
    kiwi = Kiwi(model_type='sbg', typos='basic')
    stopwords = Stopwords()
    
    tokens = kiwi.tokenize(question,stopwords=stopwords)
    
    token_list = []
    
    data['점수'] = 0
    
    for i in tokens:
        if i[1] == 'NNG' or i[1] =='NNP' or i[1] == 'SL':
            token_list.append(i[0])
            for j in range(len(data)):
                if i[0] in data.loc[j]['제목']:
                    data.loc[j,'점수'] += 1

    chunk_size = 500
    overlap = 10
    chat_response_list = []

    if int(data.loc[data['점수'].idxmax()]['점수']) > 0 :
        max_value = max(data['점수'])
        if ((data['점수'] == max_value).sum()) == 1:
            processed_message = "📌  {0} 키워드로 검색한 내용입니다.".format(token_list)
            processed_messange_2 = f"✨  공지제목 : [{data.loc[data['점수'].idxmax()]['제목']}]✨"
            small_content = clean_content(data.iloc[data['점수'].idxmax()]['content'])
  
            processed_link = data.loc[data['점수'].idxmax()]['url']
            result = f'<a href="{processed_link}" target="_blank"><img src="https://www.gachon.ac.kr/sites/kor/images/sub/slogan_1.png" alt="링크 이미지"></a>'
            token_lenth = str(len(tokenizer.tokenize(small_content)))        
 
            if len(tokenizer.tokenize(small_content)) > 512:
                chunks = create_chunks(small_content, chunk_size, overlap)
                for chunk in chunks:
                    if all(index in chunk for index in token_list):
                        chat_response_list.append("-" + get_answer(question, chunk) + "\n")
                    else:
                        pass
                
                chatBotMessage = f"👉 ChatGCT가 찾은 정보입니다. <br>❗️{chat_response_list} ❗️"
                processed_link = data.loc[data['점수'].idxmax()]['url']
                result = f'<a href="{processed_link}" target="_blank"><img src="https://www.gachon.ac.kr/sites/kor/images/sub/slogan_1.png" alt="링크 이미지"></a>'
                print(processed_message+ "<br><br>" + chatBotMessage + "<br><br>" +processed_messange_2 +"<br><br>" + "<br><br>"+ result)
              
            else:
                chat_response = get_answer(question,small_content)
                chatBotMessage = f"👉 ChatGCT가 찾은 정보입니다. <br>❗️{chat_response} ❗️"
                processed_link = data.loc[data['점수'].idxmax()]['url']
                result = f'<a href="{processed_link}" target="_blank"><img src="https://www.gachon.ac.kr/sites/kor/images/sub/slogan_1.png" alt="링크 이미지"></a>'
                print(processed_message+ "<br><br>"+chatBotMessage + "<br><br>" +processed_messange_2 + "<br><br>" +  "<br><br>"+ result)
        else:
            processed_message = "📌  {0} 키워드로 검색한 내용이 다수입니다".format(token_list)
            noti_list = Find_Title(data,max_value)
            similar_list = Similar(noti_list,question)
            
            for i in range(len(data['제목'])):
                if data.iloc[i]['제목'] == similar_list[0]:
                    top_similar = data.iloc[i]
            
            processed_messange_2 = f"✨ 유사도 분석결과 [{top_similar['제목']}] 공지사항이 가장 유사도가 높습니다!! ✨ "
            small_content = clean_content(top_similar['content'])

            processed_link = top_similar['url']
            result = f'<a href="{processed_link}" target="_blank"><img src="https://www.gachon.ac.kr/sites/kor/images/sub/slogan_1.png" alt="링크 이미지"></a>'

           
            if len(tokenizer.tokenize(small_content)) > 512:
                chunks = create_chunks(small_content, chunk_size, overlap)
                for chunk in chunks:
                    if all(index in chunk for index in token_list):
                        chat_response_list.append("-" + get_answer(question, chunk) + "\n")
                    else:
                        pass
                    
                chatBotMessage = f"👉 ChatGCT가 찾은 정보입니다. <br>❗️{chat_response_list} ❗️"
                processed_link = data.loc[data['점수'].idxmax()]['url']
                result = f'<a href="{processed_link}" target="_blank"><img src="https://www.gachon.ac.kr/sites/kor/images/sub/slogan_1.png" alt="링크 이미지"></a>'
                print(processed_message+ "<br><br>" + chatBotMessage + "<br><br>" +processed_messange_2 + "<br><br>" + "<br><br>"+ result)
            
            else:
                chat_response = get_answer(question,small_content)
                chatBotMessage = f"👉 ChatGCT가 찾은 정보입니다. <br>❗️{chat_response} ❗️"
                processed_link = top_similar['url']
                result = f'<a href="{processed_link}" target="_blank"><img src="https://www.gachon.ac.kr/sites/kor/images/sub/slogan_1.png" alt="링크 이미지"></a>'
                print(processed_message+ "<br><br>"+ chatBotMessage + "<br><br>" + processed_messange_2 + "<br><br>" + "<br><br>"+ result )
    else:
        processed_message = "📌  질문과 일치하는 공지를 찾지 못했습니다.😭 <br> ✔️수강신청 ✔️학사공지 관련 다른 공지를 물어봐주시면 찾아볼게요!😆"
        print(processed_message)
    

main(question, data)
