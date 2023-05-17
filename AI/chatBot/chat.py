import sys
import openai

openai.api_key = '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'

def chat_with_gpt(prompt):
    try:
        response = openai.Completion.create(
          engine="text-davinci-003",
          prompt=prompt,
          max_tokens=150
        )
        return response.choices[0].text.strip()
    except Exception as e:
        print(f'Error during API call: {e}', file=sys.stderr)
        return ''

# 시작 대화
conversation = [
    {"role": "system", "content": "You are a helpful assistant."},
    {"role": "user", "content": "안녕하세요."}
]

while True:
    # 이전 대화를 포함한 prompt 생성
    prompt = "\n".join([f'{msg["role"]}: {msg["content"]}' for msg in conversation])

    print(f'Generated prompt: {prompt}', file=sys.stderr)  # Log prompt

    # GPT로부터 답변 생성
    output_text = chat_with_gpt(prompt)
    print(output_text)  # 출력

    # 대화에 GPT의 답변 추가
    conversation.append({"role": "assistant", "content": output_text})

    # 사용자의 다음 입력 받기
    input_text = sys.stdin.readline().strip()
    # 대화에 사용자의 입력 추가
    conversation.append({"role": "user", "content": input_text})

    # 토큰 수가 최대치를 넘지 않도록 이전 대화 메시지 삭제
    while len("\n".join([f'{msg["role"]}: {msg["content"]}' for msg in conversation])) > 4096:
        del conversation[0]
