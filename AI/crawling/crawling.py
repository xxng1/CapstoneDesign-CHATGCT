import pandas as pd
import requests
from bs4 import BeautifulSoup
from datetime import datetime

# 시작 페이지입니다.
page = 1
# 크롤링을 계속할지 여부를 결정하는 플래그입니다.
continue_crawling = True

# 모든 데이터를 저장할 빈 리스트를 생성합니다.
all_data = []

while continue_crawling:
    url = f"https://www.gachon.ac.kr/commonNotice/kor/artclList.do?page={page}&srchColumn=&srchWord=&"
    response = requests.get(url)
    soup = BeautifulSoup(response.text, 'html.parser')

    # 공지사항 목록에서 각 공지사항의 ID를 추출합니다.
    notice_ids = [a['href'].split("'")[3] for a in soup.select('a[href^="javascript:jf_viewArtcl"]')]
    
    table = pd.read_html(response.text)[0]
    table['작성일'] = pd.to_datetime(table['작성일'], format='%Y.%m.%d')
    
    for idx, row in table.iterrows():
        if row['작성일'] < datetime(2023, 3, 1):
            continue_crawling = False
            break
        else:
            notice_id = notice_ids[idx]
            notice_url = f"https://www.gachon.ac.kr/commonNotice/kor/{notice_id}/artclView.do"
            notice_response = requests.get(notice_url)
            notice_soup = BeautifulSoup(notice_response.text, 'html.parser')
            
            # 세부 공지사항의 내용을 크롤링합니다.
            content = notice_soup.select_one('div.view-con').text.strip()

            # 해당 조건에 맞는 데이터를 all_data에 추가합니다.
            row_dict = row.to_dict()
            row_dict['url'] = notice_url
            row_dict['content'] = content
            all_data.append(row_dict)
        
    # 다음 페이지로 넘어갑니다.
    page += 1

# 리스트를 DataFrame으로 변환하고 CSV 파일로 저장합니다.
all_data_df = pd.DataFrame(all_data)
all_data_df.to_csv('notification.csv', index=False, encoding='utf-8-sig')