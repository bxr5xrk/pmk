import axios from "axios";
import fs, { existsSync, readFileSync, writeFileSync } from "node:fs"
import { resolve } from "node:path";
import parse from '@bany/curl-to-json'
import { Question, Data, Stat } from "./types";
import chalk from "chalk";
import figlet from "figlet";

const HOST = 'https://tests.if.ua/api';

function logger(status: "ERROR" | "INFO", message: string) {
  if (status === 'ERROR') {
    console.error(`[ ${status} ]: ${message}`);
    return
  }

  console.log(chalk.green(`[ ${status} ]:`), chalk.white(message));
}

interface RequestProps {
  url: string; method: 'GET' | 'POST', data: object, headers?: object;
  name: string;
}

async function request(props: RequestProps) {
  const { url, method, data, headers, name } = props;

  try {
    const res = await axios.request({
      url: `${HOST}${url}`,
      method,
      data,
      headers
    });

    return res.data;
  } catch (error) {
    console.error(`${name} ERROR:`, `${error.response.statusText} ${error.response.data}`);
    return null;
  }
}

function getCategory(id: number, headers?: object) {
  return request({
    data: { id, "lang": 1 },
    headers,
    method: 'POST',
    name: 'getCategory',
    url: '/category'
  })
}


async function createStudent(category: number, headers?: object) {
  return request({
    data: { category, "lang": 1, "name": "csd", "last_name": "csd", "group": "csd" },
    headers,
    method: 'POST',
    name: 'createStudent',
    url: '/createstudent'
  })
}

async function getTest(headers?: object) {
  return request({
    data: {},
    headers,
    method: 'POST',
    name: 'getTest',
    url: '/gettest'
  })
}

async function getStatus() {
  try {
    const createStudent = await axios.request({
      url: 'https://pmk.tests.if.ua/api/getstatus',
      method: 'POST',
      data: {},
      // headers
    });

    return createStudent.data;
  } catch (error) {
    console.error("getStatus ERROR:", `${error.response.statusText} ${error.response.data}`);
    return null;
  }
}

async function finish(headers?: object) {
  return request({
    data: {},
    headers,
    method: 'POST',
    name: 'finish',
    url: '/finish'
  })
}

async function stat(headers?: object) {
  return request({
    data: {},
    headers,
    method: 'POST',
    name: 'stat',
    url: '/Stat'
  })
}

const REQUEST_FILE_PATH = resolve(__dirname, 'request.txt');
const DATA_FILE_PATH = resolve(__dirname, 'data.json');

function getJsonPath(name: string) {
  return resolve(__dirname, `${name}.json`);
}

function parseRequest(): object | undefined {
  const requestFile = fs.readFileSync(REQUEST_FILE_PATH, 'utf8');
  const parsedRequest = parse(requestFile);
  const headers = parsedRequest.header;

  return headers;
}

function readData() {
  try {
    if (!existsSync(DATA_FILE_PATH)) {
      writeFileSync(DATA_FILE_PATH, '{}', 'utf8');
    }

    const data = readFileSync(DATA_FILE_PATH, 'utf8');

    return (JSON.parse(data) ?? {}) as Data;
  } catch (error) {
    console.error("readData ERROR:", error);

    return {};
  }
}

function readOrCreateJSON(name: string) {
  try {
    if (!existsSync(name)) {
      writeFileSync(name, '{}', 'utf8');
    }

    const data = readFileSync(name, 'utf8');

    return (JSON.parse(data) ?? {}) as Data;
  } catch (error) {
    console.error("readOrCreateJSON ERROR:", error);

    return {};
  }
}

async function collectResults(id: number, headers?: object) {
  try {
    let isNewResults = true;

    while (isNewResults) {
      const student = await createStudent(id, headers);
      if (!student?.student?.id) {
        throw new Error('Error starting test');
      }

      logger('INFO', `${id} Test created`);

      const test = await getTest(headers);
      const questions: Question[] = test.questions;
      const category = test.category;
      const filePath = getJsonPath(category);

      logger('INFO', `${category} Received questions: ${questions?.length}`);

      await finish(headers);

      logger('INFO', `${category} Test finished`);

      const statRes = await stat(headers);
      const stats: Stat[] = statRes.stat;
      writeFileSync(resolve(__dirname, 'answers.json'), JSON.stringify(statRes, null, 2));

      logger('INFO', `${category} Received answers: ${stats.length}`);

      const actualAnswers = readOrCreateJSON(filePath);
      // const actualAnswers = readData();

      // questions map
      const questionsMap = questions.reduce((acc, question) => {
        acc[question.id] = question;
        return acc;
      }, {} as Record<string, Question>);

      // stats map
      const statsMap = stats.reduce((acc, stat) => {
        acc[stat.question_id] = stat;
        return acc;
      }, {} as Record<string, Stat>);

      // merge questions with answers
      const data: Data = Object.entries(questionsMap).reduce((acc, [questionId, question]) => {
        const stat = statsMap[questionId];
        const answer = question.answers.find(answer => answer.id === stat.true_answer_id);

        if (answer) {
          acc[questionId] = {
            questionText: question.text,
            categoryId: category.toString(),
            answer: {
              answerId: answer.id,
              answerText: answer.text,
            }
          };
        }

        return acc;
      }, {} as Data);

      // merge with actual data
      const mergedData = { ...actualAnswers, ...data };

      const uniqueData = Object.entries(mergedData).reduce((acc, [key, value]) => {
        if (!acc[key]) {
          acc[key] = value;
        }
        return acc;
      }, {} as Data);

      const oldDataLength = Object.keys(actualAnswers).length;
      const newDataLength = Object.keys(uniqueData).length;
      const offset = newDataLength - oldDataLength;

      isNewResults = offset > 0;

      logger('INFO', `Old data: ${oldDataLength}, New data: ${newDataLength}, Offset: ${offset}`);

      // write to file
      writeFileSync(filePath, JSON.stringify(uniqueData, null, 2));

      logger('INFO', `${category} Data saved`);
    }
  } catch (error) {
    console.error("collectResults ERROR:", error);
    return null;
  }
}

async function answerQuestions(headers: object) {
  const test = await getTest(headers);
  const questions: Question[] = test.questions;
  const category = test.category;
  const filePath = getJsonPath(category);

  logger('INFO', `${category} Received questions: ${questions?.length}`);

  const actualAnswers = JSON.parse(readFileSync(filePath, 'utf8')) as Data;

  for (let i = 0; i < questions.length; i++) {
    // for (const question of questions) {
    const question = questions[i];
    const questionId = question.id;

    const isAnswered = actualAnswers[questionId];

    if (!isAnswered) {
      logger("INFO", `No answer for question: ${question.text}`);

      continue;
    }

    const answer = isAnswered.answer;

    await request({
      data: { "question_id": questionId, "answer_id": answer.answerId, "isCheat": false, "cheatTime": 0 },
      headers,
      method: 'POST',
      name: 'answer',
      url: '/answer'
    });

    logger("INFO", `[${i + 1}/${questions.length}] Answered question: ${question.text}`);

    // wait 1 second
    await new Promise(resolve => setTimeout(resolve, 1000));
  }

  logger("INFO", `All questions answered`);
}

async function main() {
  try {
    console.log(chalk.green(figlet.textSync("PMK", { horizontalLayout: "full" })));

    const headers = parseRequest();

    if (!headers) {
      throw new Error('Error parsing request');
    }

    // const category = await getCategory(6308, headers);
    // console.log('category', category);

    // const category = 13955;
    // await collectResults(category, headers);

    await answerQuestions(headers);

    // const category = await getCategory(4544);
    // console.log('category', category);

    // const student = await createStudent(8704);
    // console.log('student', student);

    // const status = await getStatus();
    // console.log('status', status);

    // const test = await getTest(headers);
    // console.log('test', test);
    // fs.writeFileSync(questionsPath, JSON.stringify(test.questions, null, 2));

    // const answer = await axios.request({
    //   url: 'https://pmk.tests.if.ua/api/answer',
    //   method: 'POST',
    //   data: { "question_id": "688490", "answer_id": "3359549", "isCheat": false, "cheatTime": 0 },
    //   headers
    // });
    //    console.log({ answer: answer.data });


    // const answer = await axios.request({
    //   url: 'https://pmk.tests.if.ua/api/finish',
    //   method: 'POST',
    //   data: {},
    //   headers
    // });
    // console.log({ answer: answer.data });


    // const finishTest = await finish();
    // console.log('finishTest', finishTest);

    // const statTest = await stat();
    // fs.writeFileSync(answersPath, JSON.stringify(statTest, null, 2));

    // const stat = await axios.request({
    //   url: 'https://pmk.tests.if.ua/api/Stat',
    //   method: 'POST',
    //   data: {},
    //   headers
    // });

    // fs.writeFileSync(filePath, JSON.stringify(stat.data, null, 2));
  } catch (error) {
    logger('ERROR', error.message);
  }
}

main().then(() => logger("INFO", 'DONE')).catch(console.error);

// const createStudent = await axios.request({
//   url: 'https://pmk.tests.if.ua/api/createstudent',
//   method: 'POST',
//   data: { "category": "7775", "lang": 1 },
//   headers
// })

// console.log({ createStudent: createStudent.data });

// const getTest = await axios.request({
//   url: 'https://pmk.tests.if.ua/api/gettest',
//   method: 'POST',
//   data: { "category": "7775", "lang": 1 },
//   headers
// });

// console.log({ getTest: getTest.data });

// const answer = await axios.request({
//   url: 'https://pmk.tests.if.ua/api/answer',
//   method: 'POST',
//   data: { "question_id": "608452", "answer_id": "2963011", "isCheat": false, "cheatTime": 0 },
//   headers
// });

// https://pmk.tests.if.ua/api/finish

// https://pmk.tests.if.ua/api/Stat


// async function createStudent(category: number, headers?: object) {
//   try {
//     const createStudent = await axios.request({
//       url: 'https://pmk.tests.if.ua/api/createstudent',
//       method: 'POST',
//       data: { category, "lang": 1 },
//       headers
//     });

//     return createStudent.data;
//   } catch (error) {
//     console.error("createStudent ERROR:", `${error.response.statusText} ${error.response.data}`);
//     return null;
//   }
// }


// async function getCategory(id: number, headers?: object) {
//   try {
//     const createStudent = await axios.request({
//       url: 'https://pmk.tests.if.ua/api/category',
//       method: 'POST',
//       data: { id, "lang": 1 },
//       headers
//     });

//     return createStudent.data;
//   } catch (error) {
//     console.error("createStudent ERROR:", `${error.response.statusText} ${error.response.data}`);
//     return null;
//   }
// }



// async function getTest(headers?: object) {
//   try {
//     const res = await axios.request({
//       url: 'https://pmk.tests.if.ua/api/gettest',
//       method: 'POST',
//       data: "{}",
//       headers
//     });

//     return res.data;
//   } catch (error) {
//     console.error("getTest ERROR:", `${error.response.statusText} ${error.response.data}`);
//     return null;
//   }
// }


// async function finish(headers?: object) {
//   try {
//     const finishRes = await axios.request({
//       url: 'https://pmk.tests.if.ua/api/finish',
//       method: 'POST',
//       data: {},
//       headers
//     });

//     return finishRes.data;
//   } catch (error) {
//     console.error("finish ERROR:", `${error.response.statusText} ${error.response.data}`);
//     return null;
//   }
// }

// async function stat(headers?: object) {
//   try {
//     const statRes = await axios.request({
//       url: 'https://pmk.tests.if.ua/api/Stat',
//       method: 'POST',
//       data: {},
//       headers
//     });

//     return statRes.data;
//   } catch (error) {
//     console.error("stat ERROR:", `${error.response.statusText} ${error.response.data}`);
//     return null;
//   }
// }