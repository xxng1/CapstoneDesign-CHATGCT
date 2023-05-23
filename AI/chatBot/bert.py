from transformers import pipeline

# 주어진 문서
context = "The Eiffel Tower is a wrought-iron lattice tower on the Champ de Mars in Paris, France. It is named after the engineer Gustave Eiffel, whose company designed and built the tower."

# 질문 생성
question_generator = pipeline('question-generation')
questions = question_generator(context)
for q in questions:
    print(f"Question: {q['question']}")
    print(f"Answer: {q['answer']}\n")

# 질문 답변
question_answerer = pipeline('question-answering')
question = "Who designed the Eiffel Tower?"
answer = question_answerer(question=question, context=context)
print(f"Question: {question}")
print(f"Answer: {answer['answer']}")
