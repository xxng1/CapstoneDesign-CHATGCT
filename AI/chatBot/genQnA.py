import pandas as pd
import openai

openai.api_key = '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'

def chat(prompt):
    response = openai.Completion.create(
      engine="text-davinci-003",
      prompt=f"{prompt}\n\n이 텍스트에 기반한 질문과 대답이 다음과 같을 수 있습니다:",
      temperature=0.5,
      max_tokens=1000,
      n=10, # It will generate 3 different responses for each prompt
    )
    
    return [choice.text.strip() for choice in response.choices]

# CSV 파일을 읽습니다.
df = pd.read_csv('/home/t23108/svr/JH_PRACTICE/AI/crawling/notification.csv')

# 각 줄에 대해 질문을 생성합니다.
for index, row in df.iterrows():
    print(f"Row {index+1}:")
    print(row["NO"])
    questions = chat(row['content'])
    for i, question in enumerate(questions, start=1):
        print(f"Generated Question {i}: {question}")
    print()

