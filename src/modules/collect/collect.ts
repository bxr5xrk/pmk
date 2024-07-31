
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
