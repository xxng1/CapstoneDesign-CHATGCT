import re
import sys
from kiwipiepy import Kiwi
from kiwipiepy.utils import Stopwords
import pandas as pd

text = sys.stdin.readline()

notification = pd.read_csv('./data.csv')
notification['점수'] = 0

# # # # 형태소 분석 모델 선언
kiwi = Kiwi(model_type='sbg', typos='basic')
stopwords = Stopwords()

# # # # # 입력받은 문장
message = text

a = kiwi.tokenize(message,stopwords=stopwords)

keylist = []

for i in a:
      keylist.append(i[0])
      if i[1] == 'NNG' or i[1] =='NNP' or i[1] == 'SL':
            for j in range(len(notification)):
                if i[0] in notification.loc[j]['공지제목']:
                    notification.loc[j,'점수'] += 1

if int(notification.loc[notification['점수'].idxmax()]['점수']) > 0 :   
    processed_message = "{0} 키워드로 검색한 내용입니다.".format(keylist)
    processed_link = notification.loc[notification['점수'].idxmax()]['링크']
    result = f'<a href="{processed_link}" target="_blank">{processed_link}</a>'
else:
    processed_message = "{0} 키워드로 검색한 내용이 없습니다. 다른 키워드를 입력해주세요".format(keylist)
    result = " "

print(processed_message +'\n' + result)
sys.stdout.flush()