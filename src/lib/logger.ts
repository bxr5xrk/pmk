import chalk from "chalk";

export function logger(status: "ERROR" | "INFO", message: string) {
  if (status === 'ERROR') {
    console.error(`[ ${status} ]: ${message}`);
    return
  }

  console.log(chalk.green(`[ ${status} ]:`), chalk.white(message));
}
