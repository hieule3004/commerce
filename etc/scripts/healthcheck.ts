import process from 'node:process';
import dotenv from 'dotenv';

const { API_HTTP_SECURE, API_PORT } = dotenv.config({ path: process.env.ENV_PATH! }).parsed!;
void fetch(`${API_HTTP_SECURE ? 'https' : 'http'}://localhost:${API_PORT}/health`).then((r) =>
  console.log(Number(r.status !== 200)),
);
