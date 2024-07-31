import { select } from "@inquirer/prompts";
import { api } from "src/api";

export async function selectCategoryId(headers: object, host: string) {
  let id = 0;

  while (true) {
    const categories = await api.getCategory(id, headers, host);

    if (!categories?.length) {
      break;
    }

    const category = await select({
      message: 'Select category',
      choices: categories.map(({ id, name }) => ({ value: id, name })),
    });

    id = Number(category);
  }

  return id;
}