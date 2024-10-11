import fastify from 'fastify';
import cors from "@fastify/cors";
import { answer } from './service/answer';
import { getCookieForAPI, getCookieFromWeb, setCookieForAPI, transformCookieFromWebToAPI } from './cookie';
import { getAllHeaders } from './headers';
import { URL } from './const';
import { logger } from './service/logger';

const port = Number(process.env.PORT) || 4000;
const server = fastify()
server.register(cors);

server.get('/', async (request, reply) => {
  const userAgent = (request.query as { userAgent: string }).userAgent;

  if (!userAgent) {
    reply.send('User-Agent is required\n').code(400);
    return;
  }

  const decodedUserAgent = decodeURIComponent(userAgent);
  logger('INFO', `User-Agent: ${decodedUserAgent}`);

  let cookie = getCookieForAPI();

  if (!cookie) {
    const cookieFromWeb = await getCookieFromWeb(decodedUserAgent);
    const cookieForAPI = transformCookieFromWebToAPI(cookieFromWeb);
    setCookieForAPI(cookieForAPI);
    cookie = cookieForAPI;
  }

  logger('INFO', `Cookie: ${cookie}`);

  const headers = getAllHeaders(cookie, decodedUserAgent);

  answer(headers, URL + 'api');

  reply.send('happy cheating)\n').code(202);
})

server.listen({ port, host: "0.0.0.0" }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})