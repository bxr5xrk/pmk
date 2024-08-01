import { api } from "src/api";
import { logger } from "src/service/logger";

export async function createTest(id: number, headers: object, host: string) {
  try {
    const student = await api.createStudent(id, headers, host);

    if (!student?.student?.id) {
      throw new Error('Error starting test');
    }

    logger('INFO', `${id} Test created`);
  } catch (error) {
    if (error instanceof Error) {
      logger("ERROR", error.message);
    }
    return null;
  }
}