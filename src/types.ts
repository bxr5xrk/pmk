export interface Answer {
  id: string;
  text: string;
}

export interface Question {
  id: string;
  text: string;
  answers: Answer[];
}

export interface Stat {
  id: string;
  question_id: string;
  true_answer_id: string;
}

export type Data = Record<number, {
  questionText: string;
  categoryId: string;
  answer: {
    answerId: string;
    answerText: string;
  }
}>