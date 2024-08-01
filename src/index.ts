import chalk from "chalk";
import figlet from "figlet";
import { select } from "@inquirer/prompts";
import { parseRequest } from "./lib/parse-request";
import { selectCategoryId } from "./lib/select-category-id";
import { collect } from "./service/collect";
import { answer } from "./service/answer";
import { logger } from "./service/logger";
import { join } from "node:path";
import { readFileSync } from "node:fs";

async function main() {
  try {
    const version = readFileSync(join(__dirname, "VERSION"), { encoding: "utf8" });

    console.log(chalk.green(figlet.textSync("PMK TEST", { horizontalLayout: "full" })));
    console.log(chalk.green(`Version: ${version}`));
    console.log(chalk.green(`CopyRight (c) 2024 - ${new Date().getFullYear()} @bxr5xrk\n`));

    // ********** Parsing request start **********
    const headers = parseRequest();

    if (!headers) {
      throw new Error('Error parsing request');
    }
    // ********** Parsing request end **********

    // ********** Select host and variant start **********
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
    // ********** Select host and variant end **********

    // ********** Main logic start **********
    switch (selectedVariant) {
      case 'collect':
        const categoryId = await selectCategoryId(headers, host);
        await collect(categoryId, headers, host);
        break;
      case 'answer':
        await answer(headers, host);
        break;
    }
    // ********** Main logic end ********
  } catch (error) {
    if (error instanceof Error) {
      console.error("main ERROR:", error.message);
      return;
    }
  }
}

main().then(() => logger("INFO", 'Script finished successfully')).catch((error) => logger("ERROR", error.message));