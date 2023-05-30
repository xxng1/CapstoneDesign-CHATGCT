import pandas as pd
import openai
import json
from transformers import GPT2Tokenizer
import tiktoken
import os
import signal
import sys

openai.api_key = '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'

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

def generate_questions(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=f"{prompt}\n\n이 텍스트에 기반한 질문과 대답이 다음과 같을 수 있습니다:",
        temperature=1,
        max_tokens=1000,  
        n=10,
    )
    return [choice.text.strip() for choice in response.choices]

def signal_handler(sig, frame):
    with open('t5_data.json', 'w', encoding='utf-8') as f:
        json.dump(t5_data, f, ensure_ascii=False, indent=2)
    sys.exit(0)

signal.signal(signal.SIGINT, signal_handler)

notification_df = pd.read_csv('/home/t23108/svr/JH_PRACTICE/AI/crawling/notification.csv')

chunk_size = 3000
overlap = 50
tt_encoding = tiktoken.get_encoding("gpt2")

t5_data = []

try:
    for index, row in notification_df.iterrows():
        title = row["제목"]
        content = row['content']
        tokens = tt_encoding.encode(content)
        if len(tokens) > 4096:
            chunks = create_chunks(content, chunk_size, overlap)
            for chunk in chunks:
                generated_questions = generate_questions(chunk)
                for i, qa in enumerate(generated_questions, start=1):
                    qa_split = qa.split('\n')

                    if len(qa_split) == 2:
                        question = qa_split[0][2:].strip()
                        answer = qa_split[1][2:].strip()

                        t5_data.append({
                            "input": f"question: {question} context: {chunk}",
                            "target": answer,
                        })
                        print(i)
                        print(json.dumps(t5_data, indent=2, ensure_ascii=False))
        else:
            generated_questions = generate_questions(content)
            for i, qa in enumerate(generated_questions, start=1):
                qa_split = qa.split('\n')

                if len(qa_split) == 2:
                    question = qa_split[0][2:].strip()
                    answer = qa_split[1][2:].strip()
                    
                    t5_data.append({
                        "input": f"question: {question} context: {content}",
                        "target": answer,
                    })
                    print(i)
                    print(json.dumps(t5_data, indent=2, ensure_ascii=False))

except Exception as e:
    print("An error occurred:", str(e))

finally:
    with open('t5_data.json', 'w', encoding='utf-8') as f:
        json.dump(t5_data, f, ensure_ascii=False, indent=2)



