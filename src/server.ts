import fastify from 'fastify';
import cors from "@fastify/cors";
import { answer } from './service/answer';

const server = fastify()

server.register(cors);

server.get('/ping', async () => {
  return 'pong\n'
})

server.post('/', async (request) => {
  const curlCommand = request.body as string;

  const headerMatches = curlCommand.match(/-H '([^:]+): ([^']+)'/g);

  const headers: Record<string, string> = {};
  if (headerMatches) {
    headerMatches.forEach((header) => {
      const [key, value] = header.slice(4).split(': ');
      headers[key] = value;
    });
  }

  const host = `https://tests.if.ua/api`;
  answer(headers, host);

  return 'ok\n';
})

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})
