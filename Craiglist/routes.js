import Router from 'koa-router';
import ejs from 'ejs';

export default function routes(db) {
  const router = new Router();

  // GET / (shows a list of categories)
  router.get('/', async (ctx) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    const postings = db.prepare('SELECT * FROM posts').all();
    ctx.body = await ejs.renderFile('views/index.ejs', { categories, postings });
  });

  // GET /posts [expected: category_id] (shows a list of titles)
  router.get('/posts/:category_id', (ctx) => {
    const { category_id } = ctx.params;

    var posts = db.prepare('SELECT * FROM posts WHERE category_id = ?').all(category_id);
    ctx.body = posts;
  });

  // GET /post  [expected: post_id] (shows a single post)
  router.get('/post/:post_id', (ctx) => {
    const { post_id } = ctx.params;

    var posts = db.prepare('SELECT * FROM posts WHERE id = ?').all(post_id);
    ctx.body = posts;
  });

  // GET /create [expected: category_id] (the form for adding a new post)
  router.get('/create', async (ctx) => {
    const categories = db.prepare('SELECT * FROM categories').all();
    ctx.body = await ejs.renderFile('views/create.ejs', { categories });
  });

  // POST /create [expected: all the fields] (saves the post)
  router.post('/create', (ctx) => {
    const { title, body, category_id } = ctx.request.body;
    console.log(title);
    console.log(body);
    console.log(category_id);

    ctx.body = title + " " + body;

    if (!category_id) ctx.throw(400, 'category is required');
    if (!title) ctx.throw(400, 'title is required');
    if (!body) ctx.throw(400, 'body is required');

    //const { lastInsertRowid } = db.prepare('INSERT INTO posts (category_id, title, body, createdts) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(title, body);
    //if (ctx.is('urlencoded')) return ctx.redirect('/');
    //ctx.status = 201;
    //ctx.body = { id: Number(lastInsertRowid), text };
  });

  return router;
}
