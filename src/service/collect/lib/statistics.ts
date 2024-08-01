import { logger } from "src/service/logger";
import { Data } from "src/types";

export function statistics(actualAnswers: Data, uniqueData: Data) {
  const oldDataLength = Object.keys(actualAnswers).length;
  const newDataLength = Object.keys(uniqueData).length;
  const offset = newDataLength - oldDataLength;

  logger('INFO', `Old data: ${oldDataLength}, New data: ${newDataLength}, Offset: ${offset}`);

  return offset;
}
