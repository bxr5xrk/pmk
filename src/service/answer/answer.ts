import { readFileSync } from "node:fs";
import { api } from "src/api";
import { getQuestions } from "src/lib/get-questions";
import { logger } from "src/service/logger";
import { Data } from "src/types";
import { collect } from "../collect";
import { wait } from "src/lib/wait";

export async function answer(headers: object, host: string) {
  const questionsRes = await getQuestions(headers, host);

  if (!questionsRes) {
    throw new Error('Error getting questions');
  }

  const { questions, filePath, category } = questionsRes;

  const actualAnswers = JSON.parse(readFileSync(filePath, 'utf8') ?? {}) as Data;

  if (!Object.keys(actualAnswers).length) {
    logger("INFO", `No answers found, collecting...`);

    await collect(Number(category), headers, host);
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
