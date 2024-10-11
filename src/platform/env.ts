function assertEnvValue(envValue: any) {
  if (!envValue) {
    throw new Error(`Environment variable not set: ${envValue}`);
  }
  return envValue;
}

export default {
  REDIS_CONNECTION_URL: assertEnvValue(process.env.REDIS_CONNECTION_URL),
  // UPSTASH_REDIS_REST_URL: assertEnvValue(process.env.UPSTASH_REDIS_REST_URL),
  // UPSTASH_REDIS_REST_TOKEN: assertEnvValue(process.env.UPSTASH_REDIS_REST_TOKEN),
}