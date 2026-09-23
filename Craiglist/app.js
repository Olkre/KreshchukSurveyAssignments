import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import { DatabaseSync } from 'node:sqlite';
import routes from './routes.js';

// initalize tables for categories and postings
const db = new DatabaseSync('data.sqlite3');
db.exec('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
db.exec('CREATE TABLE IF NOT EXISTS postings (id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, createdts DATETIME NOT NULL)');

// add initial data
var categories = db.prepare('SELECT * FROM categories').all();

if (categories.length === 0) {
  db.exec(`INSERT INTO categories (name)
    VALUES ('General'), ('Automotive'), ('Books')`);
}

// log initial data
var categories = db.prepare('SELECT * FROM categories').all();
// console.log(categories);
// console.log("count" + categories.length);

// add some initials postings if empty
var posts = db.prepare('SELECT * FROM posts').all();
if (posts.length === 0) {
  db.exec(`INSERT INTO posts (category_id, title, body, createdts)
    VALUES (1, 'coffee machine', 'nice', CURRENT_TIMESTAMP),
    (2, 'jeep cherokee', '2014', CURRENT_TIMESTAMP),
    (3, 'thinking smart and slow', 'some guy', CURRENT_TIMESTAMP)
    `);
}
// console.log(posts);
// console.log("count" + posts.length);


const router = routes(db);

new Koa()
  .use(bodyParser())
  .use(router.routes())
  .use(router.allowedMethods())
  .listen(3000, () => console.log('Listening on http://localhost:3000'));
