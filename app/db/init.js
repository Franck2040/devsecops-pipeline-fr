// app/db/init.js
// Initialisation SQLite et seed minimal.

const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'incidents.sqlite');

module.exports = function initDb() {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(DB_PATH, (err) => {
      if (err) return reject(err);
      db.run(
        `CREATE TABLE IF NOT EXISTS incidents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          title TEXT NOT NULL,
          description TEXT,
          created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )`,
        (err2) => {
          if (err2) return reject(err2);
          db.run(
            "INSERT OR IGNORE INTO incidents (id, title, description) VALUES (1, 'Tentative de phishing', 'Email suspect signale par RH')"
          );
          resolve(db);
        }
      );
    });
  });
};
