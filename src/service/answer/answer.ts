import { getQuestions } from "../../lib/get-questions";
import { logger } from "../../service/logger";
import { wait } from "../../lib/wait";
import { readJSON } from "../../lib/read-json";
import { api } from "../../api";

export async function answer(headers: object, host: string) {
  const questionsRes = await getQuestions(headers, host);

  if (!questionsRes) {
    throw new Error('Error getting questions');
  }

  const { questions, filePath } = questionsRes;

  const actualAnswers = readJSON(filePath);

  if (!Object.keys(actualAnswers).length) {
    logger("INFO", `No answers found, collect answers first`);

    return;
  }

  for (let i = 0; i < questions.length; i++) {
    const question = questions[i];
    const questionId = question.id;
    const isAnswered = actualAnswers[questionId];

    if (!isAnswered) {
      logger("INFO", `No answer for question: ${question.text}`);

      continue;
    }

    await api.answerQuestion(headers, host, questionId, isAnswered.answer.answerId);

    logger("INFO", `[${i + 1}/${questions.length}] Answered question: ${question.text}`);

    // wait 1 second
    await wait(1000);
  }

  logger("INFO", `All questions answered`);
}
