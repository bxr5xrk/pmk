import { writeFileSync } from "fs";
import { api } from "src/api";
import { getDataPath } from "src/lib/get-data-path";
import { logger } from "src/lib/logger";
import { readJSON } from "src/lib/read-json";
import { Data, Question, Stat } from "src/types";

export async function collect(id: number, headers: object, host: string) {
  try {
    let isNewResults = true;

    while (isNewResults) {
      await createTest(id, headers, host);

      const questionsRes = await getQuestions(headers, host);

      if (!questionsRes) {
        throw new Error('Error getting questions');
      }

      const { questions, category, filePath } = questionsRes;

      await api.finish(headers, host);
      logger('INFO', `${category} Test finished`);

      const stats = await getStat(headers, host);

      const actualAnswers = readJSON(filePath);

      const data = mergeQuestionsWithAnswers(questions, stats, category);

      // merge with actual data
      const mergedData = { ...actualAnswers, ...data };
      const uniqueData = getUniqueData(mergedData);

      statistics(actualAnswers, uniqueData, isNewResults);

      // write to file
      writeFileSync(filePath, JSON.stringify(uniqueData, null, 2));

      logger('INFO', `${category} Data saved`);
    }
  } catch (error) {
    console.error("collectResults ERROR:", error);
    return null;
  }
}

function statistics(actualAnswers: Data, uniqueData: Data, isNewResults: boolean) {
  const oldDataLength = Object.keys(actualAnswers).length;
  const newDataLength = Object.keys(uniqueData).length;
  const offset = newDataLength - oldDataLength;

  isNewResults = offset > 0;

  logger('INFO', `Old data: ${oldDataLength}, New data: ${newDataLength}, Offset: ${offset}`);
}

function getUniqueData(data: Data): Data {
  return Object.entries(data).reduce((acc, [key, value]) => {
    if (!acc[key]) {
      acc[key] = value;
    }
    return acc;
  }, {} as Data);
}

function mergeQuestionsWithAnswers(questions: Question[], stats: Stat[], category: string): Data {
  const questionsMap = getMap(questions, question => question.id);
  const statsMap = getMap(stats, stat => stat.question_id);

  return Object.entries(questionsMap).reduce((acc, [questionId, question]) => {
    const stat = statsMap[questionId];
    const answer = question.answers.find(answer => answer.id === stat.true_answer_id);

    if (answer) {
      acc[questionId] = {
        questionText: question.text,
        categoryId: String(category),
        answer: {
          answerId: answer.id,
          answerText: answer.text,
        }
      };
    }

    return acc;
  }, {} as Data);
}

interface GetQuestions {
  questions: Question[];
  category: string;
  filePath: string;
}

async function getStat(headers: object, host: string) {
  try {
    const stat = await api.stat(headers, host);

    if (!stat?.stat?.length) {
      throw new Error('Error getting stat');
    }

    const stats: Stat[] = stat.stat;

    logger('INFO', `Received answers: ${stats.length}`);

    return stats;
  } catch (error) {
    console.error("getStats ERROR:", error);
    return [];
  }
}

function getMap<T>(arr: T[], key: (item: T) => string): Record<string, T> {
  return arr.reduce((acc, item) => {
    acc[key(item)] = item;
    return acc;
  }, {} as Record<string, T>);
}

async function getQuestions(headers: object, host: string): Promise<GetQuestions | null> {
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

async function createTest(id: number, headers: object, host: string) {
  try {
    const student = await api.createStudent(id, headers, host);

    if (!student?.student?.id) {
      throw new Error('Error starting test');
    }

    logger('INFO', `${id} Test created`);
  } catch (error) {
    console.error("createTest ERROR:", error);
    return null;
  }
}