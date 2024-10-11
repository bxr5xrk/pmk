import fastify from 'fastify';
import cors from "@fastify/cors";
import { answer } from './service/answer';
// import env from './platform/env';
// import Redis from "ioredis"

// const redis = new Redis(env.REDIS_CONNECTION_URL);

const server = fastify()

server.register(cors);

// server.get('/ping', async (request, reply) => {
//   reply.send('pong\n')
// })

// server.get('/increment', async (request, reply) => {
//   const userAgent = request.headers['user-agent'];

//   const key = `user-agent:${userAgent}`;
//   const value = await redis.get(key);

//   if (value) {
//     await redis.set(key, parseInt(value) + 1);
//   } else {
//     await redis.set(key, 1);
//   }

//   reply.send('ok\n');
// });

// server.get('/all', async (request, reply) => {
  
//   // const keys = await redis.keys('user-agent:*');
//   // const values = await redis.mget(keys);

//   // const result = keys.map((key, index) => {
//   //   return {
//   //     key,
//   //     value: values[index]
//   //   }
//   // });

//   // reply.send(result);

//   // get all keys
//   const keys = await redis.keys('*');
//   // get all values
//   const values = await redis.mget(keys);
//   // combine keys and values
//   const result = keys.map((key, index) => {
//     return {
//       key,
//       value: values[index]
//     }
//   });
//   // send response
//   reply.send(result);
// });

// server.get('/health', async (request, reply) => {
//   try {
//     await redis.ping();
//     reply.send('ok\n');
//   } catch (error) {
//     reply.send('error\n');
//   }
// });

// server.post('/', async (request, reply) => {
//   const headers = parsecURLHeaders(request.body as string);

//   const host = `https://tests.if.ua/api`;
//   answer(headers, host);

//   reply.send('ok\n').code(202);
// })

server.listen({ port: 8080 }, (err, address) => {
  if (err) {
    console.error(err)
    process.exit(1)
  }
  console.log(`Server listening at ${address}`)
})

// function parsecURLHeaders(curlCommand: string) {
//   const headerMatches = curlCommand.match(/-H '([^:]+): ([^']+)'/g);

//   const headers: Record<string, string> = {};
//   if (headerMatches) {
//     headerMatches.forEach((header) => {
//       const [key, value] = header.slice(4).split(': ');
//       headers[key] = value;
//     });
//   }

//   return headers;
// }

// on answer questions
// 1. get headers from request body cURL
// 2. send request to host with headers
// 3. create hash for this task and store it in redis
// 4. return hash to user, status 202
// 5. when task is done, store answer in redis with hash
// 6. user can get answer by hash from redis using GET request /answer/:hash
// 7. if answer is not ready, return status 202
// 8. if answer is ready, return answer with status 200
