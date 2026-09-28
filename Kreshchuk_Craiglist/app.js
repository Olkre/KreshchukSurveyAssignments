import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { DatabaseSync } from 'node:sqlite';
import routes from './routes.js';
import { recreateDb } from './recreateDb.js';


const db = new DatabaseSync('data.sqlite3');

// initalize tables for categories and postings if they are missing
recreateDb(db);

const router = routes(db);

new Koa()
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('Listening on http://localhost:3000'));
