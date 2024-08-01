import chalk from "chalk";

export function logger(status: "ERROR" | "INFO", message: string) {
  const statusText = status === "ERROR" ? chalk.red("ERROR") : chalk.green("INFO");
  const messageText = chalk.cyan(message);

  const date = new Date();
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const seconds = date.getSeconds();

  console.log(`[${hours}:${minutes}:${seconds}] ${statusText} : ${messageText}`);
}
