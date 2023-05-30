from transformers import GPT2LMHeadModel, PreTrainedTokenizerFast

# 저장된 모델과 토크나이저 로드
model_path = "./results"  # 저장된 모델의 경로
tokenizer = PreTrainedTokenizerFast.from_pretrained("skt/kogpt2-base-v2",
    bos_token='</s>', eos_token='</s>', unk_token='<unk>',
    pad_token='<pad>', mask_token='<mask>') 
model = GPT2LMHeadModel.from_pretrained(model_path)

# 대화 함수 정의
def chat(model, tokenizer, input_text, max_length=100):
    input_ids = tokenizer.encode(input_text, return_tensors="pt")
    gen_ids = model.generate(input_ids,
                             max_length=max_length,
                             repetition_penalty=2.0,
                             pad_token_id=tokenizer.pad_token_id,
                             eos_token_id=tokenizer.eos_token_id,
                             bos_token_id=tokenizer.bos_token_id,
                             use_cache=True)
    response = tokenizer.decode(gen_ids[0, :].tolist())
    return response


# 대화 반복
while True:
    user_input = input("사용자: ")
    if user_input.lower() == "종료":
        print("대화를 종료합니다.")
        break
    response = chat(model, tokenizer, user_input)
    print("챗봇:", response)
