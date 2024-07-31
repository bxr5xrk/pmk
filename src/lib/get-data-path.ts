import { resolve } from "node:path";

export function getDataPath(name: string) {
  return resolve(__dirname, "..", "data", `${name}.json`);
}
