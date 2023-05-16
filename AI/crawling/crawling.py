import pandas as pd
import requests
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

    tables = pd.read_html(response.text)

    for i, table in enumerate(tables):
        # 날짜를 필터링하기 위해 '작성일' 열을 datetime 객체로 변환합니다.
        table['작성일'] = pd.to_datetime(table['작성일'], format='%Y.%m.%d')

        for idx, row in table.iterrows():
            # 가장 늦은 날짜가 2023년 3월 2일 이전이면 크롤링을 중단합니다.
            if row['작성일'] < datetime(2023, 3, 1):
                continue_crawling = False
                break
            else:
                # 해당 조건에 맞는 데이터를 all_data에 추가합니다.
                all_data.append(row.to_dict())

        if not continue_crawling:
            break

    # 다음 페이지로 넘어갑니다.
    page += 1

# 리스트를 DataFrame으로 변환하고 CSV 파일로 저장합니다.
all_data_df = pd.DataFrame(all_data)
all_data_df.to_csv('crawled_data.csv', index=False, encoding='utf-8-sig')
