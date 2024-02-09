import dotenv from 'dotenv';
import process from 'node:process';

const { PORT } = dotenv.config({ path: process.env.ENV_PATH! }).parsed!;
void fetch(`http://localhost:${PORT}/health`).then((r) => console.log(Number(r.status !== 200)));
