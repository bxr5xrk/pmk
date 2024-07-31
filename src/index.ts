import axios, { AxiosError } from "axios";
import fs, { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path";
import parse from '@bany/curl-to-json'
import { Question, Data, Stat, Category } from "./types";
import chalk from "chalk";
import figlet from "figlet";
import { select, input } from "@inquirer/prompts";

const REQUEST_FILE_PATH = resolve(__dirname, 'request.txt');

function parseRequest(): object | undefined {
  const requestFile = fs.readFileSync(REQUEST_FILE_PATH, 'utf8');
  const parsedRequest = parse(requestFile);
  const headers = parsedRequest.header;

  return headers;
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