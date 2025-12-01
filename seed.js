import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "heladeria.db");

console.log(`🌱 Iniciando siembra de datos en: ${dbPath}`);

const db = new Database(dbPath);

console.log("🧹 Reiniciando estructura de la base de datos...");

db.exec("DROP TABLE IF EXISTS sales;");
db.exec("DROP TABLE IF EXISTS promotions;");
db.exec("DROP TABLE IF EXISTS presentations;");
db.exec("DROP TABLE IF EXISTS settings;");

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
    date TEXT NOT NULL,
    payment_method TEXT DEFAULT 'efectivo'
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

// Versión actualizada para coincidir con la migración 7
db.pragma("user_version = 7");
console.log("✅ Versión de base de datos actualizada a 7.");

console.log("🍦 Creando productos...");
const insertProd = db.prepare(
  "INSERT INTO presentations (name, price_local, price_delivery) VALUES (?, ?, ?)"
);

const productsData = [
  { name: "1 Kilo", price_local: 8000, price_delivery: 9500 },
  { name: "1/2 Kilo", price_local: 4500, price_delivery: 5200 },
  { name: "1/4 Kilo", price_local: 2500, price_delivery: 3000 },
  { name: "Cucurucho", price_local: 2000, price_delivery: 2000 },
  { name: "Vasito", price_local: 1500, price_delivery: 1500 },
];

const productsMap = {};

productsData.forEach((p) => {
  const info = insertProd.run(p.name, p.price_local, p.price_delivery);
  productsMap[p.name] = info.lastInsertRowid;
});

console.log("🏷️  Creando promociones...");
const insertPromo = db.prepare(`
  INSERT INTO promotions (name, presentation_id, min_quantity, discount_type, discount_value, active_days, start_date, end_date, channel, is_active) 
  VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
`);

insertPromo.run(
  "Martes de 1/4",
  productsMap["1/4 Kilo"],
  2,
  "fixed_price",
  4500,
  "2",
  null,
  null,
  "local",
  1
);

const todayDate = new Date().toISOString().split("T")[0];
const nextWeek = new Date();
nextWeek.setDate(nextWeek.getDate() + 7);
const nextWeekStr = nextWeek.toISOString().split("T")[0];
insertPromo.run(
  "Semana del Kilo",
  productsMap["1 Kilo"],
  1,
  "percentage",
  10,
  "",
  todayDate,
  nextWeekStr,
  "all",
  1
);

insertPromo.run(
  "Pack Delivery 3x2",
  productsMap["1/2 Kilo"],
  3,
  "amount_off",
  5200,
  "",
  null,
  null,
  "pedidos_ya",
  1
);

console.log("💰 Generando 300 ventas aleatorias...");

const insertSale = db.prepare(
  `INSERT INTO sales (type, presentation_name, price_base, quantity, total, date, payment_method) VALUES (@type, @presentation_name, @price_base, @quantity, @total, @date, @payment_method)`
);

const randomInt = (min, max) =>
  Math.floor(Math.random() * (max - min + 1)) + min;
const randomItem = (arr) => arr[Math.floor(Math.random() * arr.length)];

const getRandomDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - randomInt(0, 60));
  date.setHours(randomInt(12, 23), randomInt(0, 59), 0);
  return date.toISOString();
};

const saleTypes = ["local", "pedidos_ya"];
const paymentMethods = ["efectivo", "mercado_pago"];

const generateSales = db.transaction(() => {
  for (let i = 0; i < 300; i++) {
    const product = randomItem(productsData);
    const type = randomItem(saleTypes);
    const payment_method = randomItem(paymentMethods);
    const priceBase =
      type === "local" ? product.price_local : product.price_delivery;
    const quantity = randomInt(1, 4);
    const total = priceBase * quantity;
    const date = getRandomDate();

    insertSale.run({
      type,
      presentation_name: product.name,
      price_base: priceBase,
      quantity,
      total,
      date,
      payment_method,
    });
  }
});

generateSales();

console.log("✅ ¡Datos sembrados correctamente!");

db.close();
process.exit(0);
