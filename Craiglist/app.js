import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { DatabaseSync } from 'node:sqlite';
import routes from './routes.js';

const db = new DatabaseSync('data.db');
db.exec('CREATE TABLE IF NOT EXISTS entries (id INTEGER PRIMARY KEY, text TEXT NOT NULL)');

const router = routes(db);

new Koa()
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('Listening on http://localhost:3000'));
