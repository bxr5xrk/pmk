import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { logger } from "src/service/logger";
import { Data } from "src/types";

export function readJSON(name: string) {
  try {
    if (!existsSync(name)) {
      writeFileSync(name, '{}', 'utf8');
    }

    const data = readFileSync(name, 'utf8');

    return (JSON.parse(data) ?? {}) as Data;
  } catch (error) {
    if (error instanceof Error) {
      logger("ERROR", error.message);
    }

    return {};
  }
}