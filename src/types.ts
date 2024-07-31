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

export type Data = Record<string, {
  questionText: string;
  categoryId: string;
  answer: {
    answerId: string;
    answerText: string;
  }
}>

export interface Category {
  id: string;
  name: string;
}

export interface CreateStudentRes {
  student?: {
    id?: string;
  }
}

export interface GetTestRes {
  category: string;
  questions: Question[];
}

export interface GetStatRes {
  stat: Stat[];
}