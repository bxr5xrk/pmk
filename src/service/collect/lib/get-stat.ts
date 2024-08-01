import { api } from "src/api";
import { logger } from "src/service/logger";
import { Stat } from "src/types";

export async function getStat(headers: object, host: string) {
  try {
    const stat = await api.stat(headers, host);

    if (!stat?.stat?.length) {
      throw new Error('Error getting stat');
    }

    const stats: Stat[] = stat.stat;

    logger('INFO', `Received answers: ${stats.length}`);

    return stats;
  } catch (error) {
    if (error instanceof Error) {
      logger("ERROR", error.message);
    }

    return [];
  }
}