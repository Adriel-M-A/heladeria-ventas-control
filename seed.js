import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "heladeria.db");

console.log(`🌱 Iniciando siembra de datos en: ${dbPath}`);

const db = new Database(dbPath);

// --- 1. REINICIO DE ESTRUCTURA ---
console.log("🧹 Reiniciando estructura de la base de datos...");

db.exec("DROP TABLE IF EXISTS sales;");
db.exec("DROP TABLE IF EXISTS promotions;");
db.exec("DROP TABLE IF EXISTS presentations;");
db.exec("DROP TABLE IF EXISTS settings;");

// Creamos las tablas con el ESQUEMA FINAL COMPLETO
db.exec(`
  CREATE TABLE presentations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    price_local INTEGER NOT NULL,
    price_delivery INTEGER NOT NULL
  );

  CREATE TABLE sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    type TEXT NOT NULL,
    presentation_name TEXT NOT NULL,
    price_base INTEGER NOT NULL,
    quantity INTEGER NOT NULL,
    total INTEGER NOT NULL,
    date TEXT NOT NULL
  );

  CREATE TABLE promotions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    presentation_id INTEGER NOT NULL,
    min_quantity INTEGER DEFAULT 1,
    discount_type TEXT NOT NULL, 
    discount_value INTEGER NOT NULL,
    active_days TEXT,
    start_date TEXT,
    end_date TEXT,
    channel TEXT DEFAULT 'all',
    is_active INTEGER DEFAULT 1,
    FOREIGN KEY(presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
  );

  CREATE TABLE settings (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL
  );
`);

// --- IMPORTANTE: MARCAR VERSIÓN DE BASE DE DATOS ---
// Esto evita que electron/db.js intente correr migraciones sobre tablas que ya están listas
db.pragma("user_version = 5");
console.log("✅ Versión de base de datos actualizada a 5.");

// --- 2. INSERTAR PRODUCTOS ---
console.log("🍦 Creando productos...");
const insertProd = db.prepare(
  "INSERT INTO presentations (name, price_local, price_delivery) VALUES (?, ?, ?)"
);

const p_kilo = insertProd.run("1 Kilo", 8000, 9500).lastInsertRowid;
const p_medio = insertProd.run("1/2 Kilo", 4500, 5200).lastInsertRowid;
const p_cuarto = insertProd.run("1/4 Kilo", 2500, 3000).lastInsertRowid;
insertProd.run("Cucurucho", 2000, 2000);
insertProd.run("Vasito", 1500, 1500);
insertProd.run("Postre Almendrado", 1200, 1500);

// --- 3. INSERTAR PROMOCIONES ---
console.log("🏷️  Creando promociones...");
const insertPromo = db.prepare(`
  INSERT INTO promotions (name, presentation_id, min_quantity, discount_type, discount_value, active_days, start_date, end_date, channel, is_active) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

// Promo Martes (Local)
insertPromo.run(
  "Martes de 1/4",
  p_cuarto,
  2,
  "fixed_price",
  4500,
  "2",
  null,
  null,
  "local",
  1
);

// Promo Semana (Por fecha, todos los canales)
const today = new Date().toISOString().split("T")[0];
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split("T")[0];
insertPromo.run(
  "Semana del Kilo",
  p_kilo,
  1,
  "percentage",
  10,
  "",
  today,
  nextWeekStr,
  "all",
  1
);

// Promo Pack (Solo Delivery)
insertPromo.run(
  "Pack Delivery 3x2",
  p_medio,
  3,
  "amount_off",
  5200,
  "",
  null,
  null,
  "pedidos_ya",
  1
);

// --- 4. INSERTAR VENTAS ---
console.log("💰 Generando ventas históricas...");
const insertSale = db.prepare(
  `INSERT INTO sales (type, presentation_name, price_base, quantity, total, date) VALUES (?, ?, ?, ?, ?, ?)`
);
const getDate = (d, h) => {
  const date = new Date();
  date.setDate(date.getDate() - d);
  date.setHours(h, 0, 0);
  return date.toISOString();
};

// Ventas de prueba
insertSale.run("local", "1 Kilo", 8000, 1, 8000, getDate(0, 10));
insertSale.run("pedidos_ya", "1 Kilo", 9500, 1, 8550, getDate(0, 12)); // Con desc 10%
insertSale.run("local", "1/4 Kilo", 2500, 2, 5000, getDate(0, 15));
insertSale.run("local", "Cucurucho", 2000, 1, 2000, getDate(0, 16));
insertSale.run("pedidos_ya", "1/2 Kilo", 5200, 1, 5200, getDate(0, 20));

// Ventas Ayer
insertSale.run("local", "1 Kilo", 8000, 2, 16000, getDate(1, 11));
insertSale.run("local", "Vasito", 1500, 3, 4500, getDate(1, 14));

console.log("✅ ¡Datos sembrados correctamente!");
