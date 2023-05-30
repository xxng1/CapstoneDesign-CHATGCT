from transformers import GPT2LMHeadModel, PreTrainedTokenizerFast, TrainingArguments, Trainer
from torch.utils.data import Dataset
import json

# 모델과 토크나이저 불러오기
tokenizer = PreTrainedTokenizerFast.from_pretrained("skt/kogpt2-base-v2",
    bos_token='</s>', eos_token='</s>', unk_token='<unk>',
    pad_token='<pad>', mask_token='<mask>') 
model = GPT2LMHeadModel.from_pretrained("skt/kogpt2-base-v2")

# 데이터셋 클래스 정의
class MyDataset(Dataset):
    def __init__(self, file_path, tokenizer):
        self.tokenizer = tokenizer
        with open(file_path, 'r', encoding='utf-8') as f:
            self.data = json.loads(f.read())

    def __len__(self):
        return len(self.data)

    def __getitem__(self, idx):
        item = self.data[idx]
        question, context = item['input'].split(' context: ')
        question = question.replace('question: ', '')
        print(context)
        inputs = self.tokenizer(question, context, truncation=True, padding='max_length', max_length=1024, return_tensors='pt')
        target = self.tokenizer(item['target'], truncation=True, padding='max_length', max_length=128, return_tensors='pt')['input_ids']
        inputs['labels'] = target
        return inputs


# Train과 validation 데이터셋 로드
train_dataset = MyDataset('/home/t23108/svr/JH_PRACTICE/AI/chatBot/trainData.json', tokenizer)
# val_dataset = MyDataset('path_to_val.json', tokenizer)

# 학습 설정
training_args = TrainingArguments(
    output_dir='./results',          # output directory
    num_train_epochs=3,              # total number of training epochs
    per_device_train_batch_size=16,  # batch size per device during training
    per_device_eval_batch_size=64,   # batch size for evaluation
    warmup_steps=500,                # number of warmup steps for learning rate scheduler
    weight_decay=0.01,               # strength of weight decay
    logging_dir='./logs',            # directory for storing logs
     report_to = [],                  # empty list to avoid reporting to any service
)

# Trainer 인스턴스 생성
trainer = Trainer(
    model=model,                         # the instantiated 🤗 Transformers model to be trained
    args=training_args,                  # training arguments, defined above
    train_dataset=train_dataset,         # training dataset
    # eval_dataset=val_dataset             # evaluation dataset
)

# 학습 시작
trainer.train()

# 다른 경로에 모델 저장
trainer.save_model()
