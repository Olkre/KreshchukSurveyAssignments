import { getCutoffDate } from "./routes.js";

export function recreateDb(db) {
  db.exec('CREATE TABLE IF NOT EXISTS categories (id INTEGER PRIMARY KEY, name TEXT NOT NULL)');
  db.exec('CREATE TABLE IF NOT EXISTS posts (id INTEGER PRIMARY KEY, category_id INTEGER NOT NULL, title TEXT NOT NULL, body TEXT NOT NULL, createdts DATETIME NOT NULL)');

  // add initial data
  var categories = db.prepare('SELECT * FROM categories').all();

  if (categories.length === 0) {
    db.exec(`INSERT INTO categories (name)
      VALUES ('General'), ('Automotive'), ('Books'), ('Pets')`);
  }

  // log initial data
  var categories = db.prepare('SELECT * FROM categories').all();
  console.log(`Found ${categories.length} categories.`);

  // add some initials postings if empty
  var posts = db.prepare('SELECT * FROM posts').all();
  if (posts.length === 0) {
    db.exec(`INSERT INTO posts (category_id, title, body, createdts) VALUES
      (1, 'Coffee Machine', '$59.90', CURRENT_TIMESTAMP),
      (1, 'Vacuum', 'Lightly used', CURRENT_TIMESTAMP),
      (2, 'Jeep Cherokee', '2014, 120k miles', CURRENT_TIMESTAMP),
      (2, 'Honda Civic', '2024, 20k miles', CURRENT_TIMESTAMP),
      (3, 'Thinking Fast and Slow', 'Book by Daniel Kahneman. Meet in the library', CURRENT_TIMESTAMP),
      (3, 'Design Patterns', 'Book by Erich Gamma, Richard Helm, Ralph Johnson, John Vlissides. ', CURRENT_TIMESTAMP),
      (4, 'Puppy', 'American Foxhound ', CURRENT_TIMESTAMP)
      `);
    var posts = db.prepare('SELECT * FROM posts').all();
    console.log("Added " + posts.length + " posts.");
  } else {
    console.log("Found " + posts.length + " posts.");
  }

  // add unexpired posts if there isn't any
  const unexpired_posts = posts.filter(post => post.createdts >= getCutoffDate());
  if (unexpired_posts.length === 0) {
    db.exec(`INSERT INTO posts (category_id, title, body, createdts) VALUES
      (1, 'Dishwasher', '$99.90', CURRENT_TIMESTAMP),
      (2, 'Toyota Rav 4', '2020, 120k miles', CURRENT_TIMESTAMP),
      (3, 'Clean Code', 'Book by Robert Cecil Martin', CURRENT_TIMESTAMP),
      (4, 'Cat', 'Uknown breed. 3 months old ', CURRENT_TIMESTAMP)
      `);
    console.log("Added 4 unexpired posts");
  }

}
