import pandas as pd
import openai
from transformers import GPT2Tokenizer
import tiktoken

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

        # Break the loop if end is equal to total_tokens
        if end == total_tokens:
            break

    return chunks



def generate_questions(prompt):
    response = openai.Completion.create(
        engine="text-davinci-003",
        prompt=f"{prompt}\n\n이 텍스트에 기반한 질문과 대답이 다음과 같을 수 있습니다:",
        temperature=0.5,
        max_tokens=500,  
        n=10,
    )
    return [choice.text.strip() for choice in response.choices]

notification_df = pd.read_csv('/home/t23108/svr/JH_PRACTICE/AI/crawling/notification.csv')

chunk_size = 3500  # Adjust chunk size as needed
overlap = 50  # Adjust overlap as needed
tt_encoding = tiktoken.get_encoding("gpt2")  # Define the tokenizer here

for index, row in notification_df.iterrows():
    print(f"Row {index+1}:")
    print(row["NO"])
    content = row['content']
    tokens = tt_encoding.encode(content)
    if len(tokens) > 4096:
        chunks = create_chunks(content, chunk_size, overlap)
        for chunk in chunks:
            generated_questions = generate_questions(chunk)
            for i, question in enumerate(generated_questions, start=1):
                print(f"Generated Question {i}: {question}")
    else:
        generated_questions = generate_questions(content)
        for i, question in enumerate(generated_questions, start=1):
            print(f"Generated Question {i}: {question}")
