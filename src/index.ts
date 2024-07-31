import axios, { AxiosError } from "axios";
import fs, { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path";
import parse from '@bany/curl-to-json'
import { Question, Data, Stat, Category } from "./types";
import chalk from "chalk";
import figlet from "figlet";
import { select, input } from "@inquirer/prompts";

const REQUEST_FILE_PATH = resolve(__dirname, 'request.txt');

function getJsonPath(name: string) {
  return resolve(__dirname, "data", `${name}.json`);
}

function parseRequest(): object | undefined {
  const requestFile = fs.readFileSync(REQUEST_FILE_PATH, 'utf8');
  const parsedRequest = parse(requestFile);
  const headers = parsedRequest.header;

  return headers;
}



async function answerQuestions(headers: object) {
  const test = await getTest(headers);
  const questions: Question[] = test.questions;
  const category = test.category;
  const filePath = getJsonPath(category);

  logger('INFO', `${category} Received questions: ${questions?.length}`);

  const actualAnswers = JSON.parse(readFileSync(filePath, 'utf8')) as Data;

  for (let i = 0; i < questions.length; i++) {
    // for (const question of questions) {
    const question = questions[i];
    const questionId = question.id;

    const isAnswered = actualAnswers[questionId];

    if (!isAnswered) {
      logger("INFO", `No answer for question: ${question.text}`);

      continue;
    }

    const answer = isAnswered.answer;

    await request({
      data: { "question_id": questionId, "answer_id": answer.answerId, "isCheat": false, "cheatTime": 0 },
      headers,
      method: 'POST',
      name: 'answer',
      url: '/answer'
    });

    logger("INFO", `[${i + 1}/${questions.length}] Answered question: ${question.text}`);

    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  logger("INFO", `All questions answered`);
}



async function main() {
  try {
    console.log(chalk.green(figlet.textSync("PMK", { horizontalLayout: "full" })));

    const headers = parseRequest();

    if (!headers) {
      throw new Error('Error parsing request');
    }

    const selectHost = await select({
      message: 'Select host',
      choices: [
        { value: 'tests.if.ua', },
        { value: 'pmk.tests.if.ua' },
      ]
    });

    const host = `https://${selectHost}/api`;

    const selectedVariant = await select({
      message: 'Select variant',
      choices: [
        { value: 'collect', name: 'Collect results' },
        { value: 'answer', name: 'Answer questions' },
      ]
    });

    switch (selectedVariant) {
      case 'collect':
        const categoryId = await selectCategoryId(headers, host);
        await collectResults(categoryId, headers);
        break;
      case 'answer':
        await answerQuestions(headers);
        break;
    }

    // const category = 13955;
    // await collectResults(category, headers);

    // await answerQuestions(headers);
  } catch (error) {
    if (error instanceof Error) {
      console.error("main ERROR:", error.message);
      return;
    }
  }
}

main().then(() => logger("INFO", 'DONE')).catch(console.error);