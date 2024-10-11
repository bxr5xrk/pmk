import { join } from "node:path";

export const REQUEST_FILE_PATH = join(__dirname, "..", "assets", 'request.txt');
export const COLLECT_ATTEMPTS = 7;

export const PATH_TO_API_COOKIE_FILE = join(__dirname, 'cookie-api.txt');
export const PATH_TO_WEB_COOKIE_FILE = join(__dirname, 'cookie-web.json');
export const URL = 'https://pmk.tests.if.ua/';
export const WAIT_TIME = 5000;
export const LOGIN = 'Senko_Ma@ifnmu.edu.ua';
export const PASSWORD = 'p1V5SN7ho';

export const baseHeaders = {
  'accept': 'application/json, text/plain, */*',
  'accept-language': 'en-GB,en;q=0.9',
  'content-type': 'application/json;charset=UTF-8',
  'dnt': '1',
  'origin': 'https://pmk.tests.if.ua',
  'priority': 'u=1, i',
  'referer': 'https://pmk.tests.if.ua/',
  // 'sec-ch-ua': '"Google Chrome";v="129", "Not=A?Brand";v="8", "Chromium";v="129"',
  'sec-ch-ua-mobile': '?0',
  // 'sec-ch-ua-platform': '"macOS"',
  'sec-fetch-dest': 'empty',
  'sec-fetch-mode': 'cors',
  'sec-fetch-site': 'same-origin',
}