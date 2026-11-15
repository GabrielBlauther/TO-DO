import { createDatabase } from './database';
import { createHandler } from './api';

const db = createDatabase(Bun.env.DATABASE_PATH || 'todo.db');
const server = Bun.serve({ port: Number(Bun.env.PORT || 3001), fetch: createHandler(db) });
console.log(`Backend em http://localhost:${server.port}`);
