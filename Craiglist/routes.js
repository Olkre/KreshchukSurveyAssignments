import Router from 'koa-router';
import ejs from 'ejs';

export default function routes(db) {
  const router = new Router();

  router.get('/', async (ctx) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    const postings = db.prepare('SELECT * FROM posts').all();
    ctx.body = await ejs.renderFile('views/index.ejs', { categories, postings });
  });

  // insert a post
  router.post('/postings', (ctx) => {
    const { text } = ctx.request.body;
    if (!text) ctx.throw(400, 'text is required');
    const { lastInsertRowid } = db.prepare('INSERT INTO posts (name) VALUES (?)').run(text);
    if (ctx.is('urlencoded')) return ctx.redirect('/');
    ctx.status = 201;
    ctx.body = { id: Number(lastInsertRowid), text };
  });

  router.get('/categories', (ctx) => {
    ctx.body = db.prepare('SELECT * FROM categories').all();
  });

  router.get('/postings', (ctx) => {
    ctx.body = db.prepare('SELECT * FROM posts').all();
  });

  router.get('/posting/:id', (ctx) => {
    const post = db.prepare('SELECT * FROM posts WHERE id = ?').get(ctx.params.id);
    ctx.body = post;
  });


  return router;
}
