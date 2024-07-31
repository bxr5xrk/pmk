import chalk from "chalk";
import figlet from "figlet";
import { select } from "@inquirer/prompts";
import { parseRequest } from "./lib/parse-request";
import { selectCategoryId } from "./lib/select-category-id";
import { collect } from "./modules/collect";
import { answer } from "./modules/answer";
import { logger } from "./lib/logger";

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
        await collect(categoryId, headers, host);
        break;
      case 'answer':
        await answer(headers, host);
        break;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error("main ERROR:", error.message);
      return;
    }
  }
}

main().then(() => logger("INFO", 'DONE')).catch(console.error);