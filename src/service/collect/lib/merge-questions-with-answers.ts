import { Data, Question, Stat } from "src/types";
import { getMap } from "./get-map";

export function mergeQuestionsWithAnswers(questions: Question[], stats: Stat[], category: string): Data {
  const questionsMap = getMap(questions, question => question.id);
  const statsMap = getMap(stats, stat => stat.question_id);

  return Object.entries(questionsMap).reduce((acc, [questionId, question]) => {
    const stat = statsMap[questionId];
    const answer = question.answers.find(answer => answer.id === stat.true_answer_id);

    if (answer) {
      acc[questionId] = {
        questionText: question.text,
        categoryId: String(category),
        answer: {
          answerId: answer.id,
          answerText: answer.text,
        }
      };
    }

    return acc;
  }, {} as Data);
}