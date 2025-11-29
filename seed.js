import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, "heladeria.db");

const db = new Database(dbPath);

console.log("🌱 Iniciando carga de datos de prueba...");

// --- PASO 0: CREAR TABLAS SI NO EXISTEN (Esto soluciona tu error) ---
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
`);
console.log("✅ Estructura de tablas verificada.");

// 1. LIMPIAR DATOS EXISTENTES
db.exec("DELETE FROM sales");
db.exec("DELETE FROM presentations");
db.exec("DELETE FROM sqlite_sequence"); // Reinicia los IDs a 1

// 2. CREAR PRESENTACIONES
const presentations = [
  { name: "1/4 Kilo", price: 2500 },
  { name: "1/2 Kilo", price: 4500 },
  { name: "1 Kilo", price: 8000 },
  { name: "Cucurucho", price: 1200 },
  { name: "Vasito", price: 800 },
  { name: "Batido", price: 3000 },
];

const insertPresentation = db.prepare(
  "INSERT INTO presentations (name, price) VALUES (@name, @price)"
);

for (const p of presentations) {
  insertPresentation.run(p);
}
console.log(`✅ Se crearon ${presentations.length} presentaciones base.`);

// 3. GENERAR VENTAS ALEATORIAS
const SALES_TO_GENERATE = 500;
const TYPES = ["local", "pedidos_ya"];

function getRandomDate(daysBack) {
  const date = new Date();
  date.setDate(date.getDate() - Math.floor(Math.random() * daysBack));
  const hour = Math.floor(Math.random() * (23 - 11 + 1)) + 11;
  const minute = Math.floor(Math.random() * 60);
  date.setHours(hour, minute, 0, 0);
  return date.toISOString();
}

const insertSale = db.prepare(`
  INSERT INTO sales (type, presentation_name, price_base, quantity, total, date)
  VALUES (@type, @presentation_name, @price_base, @quantity, @total, @date)
`);

const allPresentations = db.prepare("SELECT * FROM presentations").all();

const generateSales = db.transaction(() => {
  for (let i = 0; i < SALES_TO_GENERATE; i++) {
    const type = Math.random() > 0.3 ? "local" : "pedidos_ya";
    const presentation =
      allPresentations[Math.floor(Math.random() * allPresentations.length)];
    const quantity = Math.floor(Math.random() * 3) + 1;
    const total = presentation.price * quantity;
    const date = getRandomDate(60);

    insertSale.run({
      type,
      presentation_name: presentation.name,
      price_base: presentation.price,
      quantity,
      total,
      date,
    });
  }
});

generateSales();

console.log(`✅ Se generaron ${SALES_TO_GENERATE} ventas históricas.`);
console.log("🚀 ¡Base de datos poblada con éxito!");
