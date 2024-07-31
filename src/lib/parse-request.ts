import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import parse from '@bany/curl-to-json';

const REQUEST_FILE_PATH = resolve(__dirname, 'request.txt');

export function parseRequest(): object | undefined {
  const requestFile = readFileSync(REQUEST_FILE_PATH, 'utf8');
  const parsedRequest = parse(requestFile);
  const headers = parsedRequest.header;

  return headers;
}