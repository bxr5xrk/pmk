import chalk from "chalk";

export function logger(status: "ERROR" | "INFO", message: string) {
  const statusText = status === "ERROR" ? chalk.red("ERROR") : chalk.green("INFO");
  const messageText = chalk.cyan(message);

  const date = new Date();
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const seconds = String(date.getSeconds()).padStart(2, '0');

  console.log(`[${hours}:${minutes}:${seconds}] ${statusText} : ${messageText}`);
}
