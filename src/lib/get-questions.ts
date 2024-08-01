import { api } from "src/api";
import { Question } from "src/types";
import { getDataPath } from "./get-data-path";
import { logger } from "../service/logger";

interface GetQuestions {
  questions: Question[];
  category: string;
  filePath: string;
}

export async function getQuestions(headers: object, host: string): Promise<GetQuestions | null> {
  try {
    const test = await api.getTest(headers, host);

    if (!test?.questions?.length) {
      throw new Error('Error getting test');
    }

    const questions: Question[] = test.questions;
    const category = test.category;
    const filePath = getDataPath(category);

    logger('INFO', `${category} Received questions: ${questions?.length}`);

    return {
      questions,
      category,
      filePath
    }
  } catch (error) {
    console.error("getQuestions ERROR:", error);
    return null;
  }
}