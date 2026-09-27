import Router from 'koa-router';
import ejs from 'ejs';

// 24 hours
const cutoffLength = 24 * 60 * 60 * 1000;

// what date is the earliest to show based on the cutoff length
const cutoffDate = new Date(Date.now() - cutoffLength)
  .toISOString()
  .slice(0, 19);

export default function routes(db) {
  const router = new Router();

  // GET / (shows a list of categories)
  router.get('/', async (ctx) => {
    const categories = db.prepare('SELECT * FROM categories ORDER BY name').all();
    const posts = db.prepare('SELECT * FROM posts WHERE createdts >= ? ORDER BY createdts DESC').all(cutoffDate);
    ctx.body = await ejs.renderFile('views/index.ejs', { categories, posts });
  });

  // GET /posts [expected: category_id] (shows a list of titles)
  router.get('/posts/:category_id', async (ctx) => {
    const { category_id } = ctx.params;

    var category = db.prepare('SELECT * FROM categories WHERE id = ?').get(category_id);
    var posts = db.prepare(`SELECT * FROM posts
                            WHERE category_id = ?
                            AND createdts >= ?
                            ORDER BY createdts DESC`).all(category_id, cutoffDate);

    ctx.body = await ejs.renderFile('views/posts.ejs', { category, posts });
  });

  // GET /post  [expected: post_id] (shows a single post)
  router.get('/post/:post_id', async (ctx) => {
    const { post_id } = ctx.params;

    var post = db.prepare('SELECT * FROM posts WHERE id = ?').get(post_id);
    post.expirests = new Date (new Date(post.createdts).getTime() + cutoffLength)

    console.log(new Date(post.createdts).getTime())
    console.log(cutoffLength)
    console.log(new Date (new Date(post.createdts).getTime() + cutoffLength))

    ctx.body = await ejs.renderFile('views/post.ejs', { post });
  });

  // GET /create [expected: category_id] (the form for adding a new post)
  router.get('/create', async (ctx) => {
    // parse as a number for valid comparison later
    const category_id = Number(ctx.query.category_id);

    const categories = db.prepare('SELECT * FROM categories').all();
    ctx.body = await ejs.renderFile('views/create.ejs', { category_id, categories });

  });

  // POST /create [expected: all the fields] (saves the post)
  router.post('/create', (ctx) => {
    const { title, body, category_id } = ctx.request.body;

    ctx.body = title + " " + body;

    if (!category_id) ctx.throw(400, 'category is required');
    if (!title) ctx.throw(400, 'title is required');
    if (!body) ctx.throw(400, 'body is required');

    const { lastInsertRowid } = db.prepare('INSERT INTO posts (category_id, title, body, createdts) VALUES (?, ?, ?, CURRENT_TIMESTAMP)').run(category_id, title, body);
    if (ctx.is('urlencoded')) return ctx.redirect('/');
    ctx.status = 201;
    ctx.body = { id: Number(lastInsertRowid), text };
  });

  return router;
}
