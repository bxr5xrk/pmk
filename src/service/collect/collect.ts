import { writeFileSync } from "fs";
import { api } from "src/api";
import { getQuestions } from "src/lib/get-questions";
import { logger } from "src/service/logger";
import { readJSON } from "src/lib/read-json";
import { COLLECT_ATTEMPTS } from "src/const";
import { wait } from "src/lib/wait";
import { statistics } from "./lib/statistics";
import { getUniqueData } from "./lib/get-unique-data";
import { mergeQuestionsWithAnswers } from "./lib/merge-questions-with-answers";
import { getStat } from "./lib/get-stat";
import { createTest } from "./lib/create-test";

export async function collect(id: number, headers: object, host: string) {
  try {
    let isNewResults = true;
    let attempts = COLLECT_ATTEMPTS;

    while (isNewResults || attempts > 0) {
      await createTest(id, headers, host);

      const questionsRes = await getQuestions(headers, host);

      if (!questionsRes) {
        throw new Error('Error getting questions');
      }

      const { questions, category, filePath } = questionsRes;

      await api.finish(headers, host);
      logger('INFO', `${category} Test finished`);

      const stats = await getStat(headers, host);

      const actualAnswers = readJSON(filePath);

      const data = mergeQuestionsWithAnswers(questions, stats, category);

      // merge with actual data
      const mergedData = { ...actualAnswers, ...data };
      const uniqueData = getUniqueData(mergedData);

      const offset = statistics(actualAnswers, uniqueData);

      isNewResults = offset > 0;

      if (offset === 0) {
        attempts--;
        logger('INFO', `No new results. Attempts left: ${attempts}`);
      }

      // write to file
      writeFileSync(filePath, JSON.stringify(uniqueData, null, 2));

      logger('INFO', `${category} Data saved, answers: ${Object.keys(uniqueData).length}\n`);

      // wait 1 second
      await wait(1000);
    }
  } catch (error) {
    if (error instanceof Error) {
      logger("ERROR", error.message);
    }
    return null;
  }
}