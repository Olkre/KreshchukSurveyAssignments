import Router from 'koa-router';
import ejs from 'ejs';

export default function routes(db) {
  const router = new Router();

  router.get('/', async (ctx) => {
    const entries = db.prepare('SELECT * FROM entries').all();
    ctx.body = await ejs.renderFile('views/index.ejs', { entries });
  });

  router.post('/entries', (ctx) => {
    const { text } = ctx.request.body;
    if (!text) ctx.throw(400, 'text is required');
    const { lastInsertRowid } = db.prepare('INSERT INTO entries (text) VALUES (?)').run(text);
    if (ctx.is('urlencoded')) return ctx.redirect('/');
    ctx.status = 201;
    ctx.body = { id: Number(lastInsertRowid), text };
  });

  router.get('/entries', (ctx) => {
    ctx.body = db.prepare('SELECT * FROM entries').all();
  });

  return router;
}
