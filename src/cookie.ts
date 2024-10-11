import { readFileSync, writeFileSync } from "node:fs";
import { LOGIN, PASSWORD, PATH_TO_API_COOKIE_FILE, PATH_TO_WEB_COOKIE_FILE, URL, WAIT_TIME } from "./const";
import { chromium } from 'playwright';
import { logger } from "./service/logger";
import type { Cookie, Page } from 'playwright';

export function getCookieForWeb(): Cookie[] {
  const data = readFileSync(PATH_TO_WEB_COOKIE_FILE, { encoding: 'utf8' });

  return JSON.parse(data || '[]');
}

export function getCookieForAPI(): string {
  const data = readFileSync(PATH_TO_API_COOKIE_FILE, { encoding: 'utf8' }).toString();

  return data || '';
}

export function setCookieForWeb(cookies: Cookie[]) {
  const data = JSON.stringify(cookies, null, 2);
  writeFileSync(PATH_TO_WEB_COOKIE_FILE, data);
}


export function setCookieForAPI(cookie: string) {
  writeFileSync(PATH_TO_API_COOKIE_FILE, cookie);
}


export function transformCookieFromWebToAPI(cookies?: Cookie[]) {
  if (!cookies) {
    return '';
  }

  const cookiesMap = new Map<string, string>();

  for (const cookie of cookies) {
    cookiesMap.set(cookie.name, cookie.value);
  }

  const cookie = `messages=${cookiesMap.get('messages')}; csrftoken=${cookiesMap.get('csrftoken')}; sessionid=${cookiesMap.get('sessionid')}; cf_clearance=${cookiesMap.get('cf_clearance')}`;

  return cookie;
}

async function wait(page: Page, time?: number) {
  const defaultTime = time || WAIT_TIME;

  console.log(`Waiting for ${defaultTime}ms`);
  await page.waitForTimeout(defaultTime);
}

export async function getCookieFromWeb(userAgent: string) {
  try {
    const cookies = getCookieForWeb();
    const browser = await chromium.launch({headless: false});
    const context = await browser.newContext({ userAgent });

    const page = await context.newPage();
    context.addCookies(cookies);
    console.log(`Navigating to ${URL}`);
    await page.goto(URL);

    console.log(page.url(), URL);
    if (page.url() !== URL) {
      logger('INFO', 'Need to login');

      await page.getByPlaceholder('Email address, phone number or Skype').fill(LOGIN);

      await page.getByText('Next').click();

      await page.getByPlaceholder('Password').fill(PASSWORD);

      await page.getByText('Sign in').click();

      await page.getByText('Yes').click();
      await wait(page, WAIT_TIME / 2);
      logger('INFO', 'Logged in');
    }

    await page.waitForURL(URL);

    const newCookies = await context.cookies();
    setCookieForWeb(newCookies);
    logger('INFO', 'Got cookies');

    await browser.close();
    logger('INFO', 'Browser closed');

    return newCookies;
  } catch (error) {
    console.error(error);
  }
}

