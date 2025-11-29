import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dbPath = app.isPackaged
  ? path.join(app.getPath("userData"), "heladeria.db")
  : path.join(__dirname, "../heladeria.db");

let db = null;

const migrations = [
  (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS presentations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        price INTEGER NOT NULL
      );
      CREATE TABLE IF NOT EXISTS sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        presentation_name TEXT NOT NULL,
        price_base INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        total INTEGER NOT NULL,
        date TEXT NOT NULL
      );
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );
    `);
  },
  (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        presentation_id INTEGER NOT NULL,
        min_quantity INTEGER DEFAULT 1,
        discount_type TEXT NOT NULL,
        discount_value INTEGER NOT NULL,
        active_days TEXT,
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY(presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
      );
    `);
  },
  (db) => {
    db.exec(`
      ALTER TABLE promotions ADD COLUMN start_date TEXT;
      ALTER TABLE promotions ADD COLUMN end_date TEXT;
    `);
  },
];

function runMigrations() {
  if (!db) return;
  const currentVersion = db.pragma("user_version", { simple: true });
  console.log(`[DB] Versión actual: ${currentVersion}`);

  let newVersion = currentVersion;

  for (let i = currentVersion; i < migrations.length; i++) {
    const nextVersion = i + 1;
    console.log(`[DB] Aplicando migración v${nextVersion}...`);
    const runMigration = db.transaction(() => {
      migrations[i](db);
      db.pragma(`user_version = ${nextVersion}`);
    });
    try {
      runMigration();
      newVersion = nextVersion;
    } catch (err) {
      console.error(`[DB] CRITICAL: Error en migración v${nextVersion}:`, err);
      throw err;
    }
  }
  console.log(`[DB] Base de datos en versión ${newVersion}`);
}

export function connectDB() {
  if (db) return db;
  try {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    runMigrations();
    return db;
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    throw error;
  }
}

export function getDB() {
  if (!db) return connectDB();
  return db;
}

export function closeDB() {
  if (db && db.open) {
    db.close();
    db = null;
  }
}

export function backupDB(destination) {
  const database = getDB();
  return database.backup(destination);
}
