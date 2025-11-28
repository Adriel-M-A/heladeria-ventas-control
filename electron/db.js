import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";

// Definir dónde se guardará el archivo .db
// En desarrollo: en la raíz del proyecto.
// En producción: en la carpeta de datos del usuario (AppData)
const dbPath = app.isPackaged
  ? path.join(app.getPath("userData"), "heladeria.db")
  : path.join(__dirname, "../../heladeria.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL"); // Optimización de velocidad

// Inicializar tablas
export function initDB() {
  // Tabla de Presentaciones (Productos)
  db.exec(`
    CREATE TABLE IF NOT EXISTS presentations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL
    )
  `);

  // Tabla de Ventas
  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL, -- 'local' o 'pedidos_ya'
      presentation_name TEXT NOT NULL,
      price_base INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total INTEGER NOT NULL,
      date TEXT NOT NULL -- Guardaremos fecha ISO
    )
  `);
}

// --- FUNCIONES PARA PRESENTACIONES ---

export function getPresentations() {
  const stmt = db.prepare("SELECT * FROM presentations ORDER BY id DESC");
  return stmt.all();
}

export function addPresentation(name, price) {
  const stmt = db.prepare(
    "INSERT INTO presentations (name, price) VALUES (?, ?)"
  );
  const info = stmt.run(name, price);
  return { id: info.lastInsertRowid, name, price };
}

export function updatePresentation(id, name, price) {
  const stmt = db.prepare(
    "UPDATE presentations SET name = ?, price = ? WHERE id = ?"
  );
  stmt.run(name, price, id);
  return { id, name, price };
}

export function deletePresentation(id) {
  const stmt = db.prepare("DELETE FROM presentations WHERE id = ?");
  stmt.run(id);
  return id;
}

// --- FUNCIONES PARA VENTAS ---

export function getSales(type) {
  // Si type es 'all', devuelve todo, sino filtra
  if (type && type !== "all") {
    const stmt = db.prepare(
      "SELECT * FROM sales WHERE type = ? ORDER BY id DESC"
    );
    return stmt.all(type);
  }
  const stmt = db.prepare("SELECT * FROM sales ORDER BY id DESC");
  return stmt.all();
}

export function addSale(sale) {
  const { type, presentation_name, price_base, quantity, total, date } = sale;
  const stmt = db.prepare(`
    INSERT INTO sales (type, presentation_name, price_base, quantity, total, date)
    VALUES (?, ?, ?, ?, ?, ?)
  `);
  const info = stmt.run(
    type,
    presentation_name,
    price_base,
    quantity,
    total,
    date
  );
  return { id: info.lastInsertRowid, ...sale };
}

export function getStats() {
  // Calcular totales por tipo
  const local = db
    .prepare(
      "SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE type = 'local'"
    )
    .get();
  const pedidosYa = db
    .prepare(
      "SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE type = 'pedidos_ya'"
    )
    .get();

  return {
    local: { count: local.count || 0, total: local.total || 0 },
    pedidosYa: { count: pedidosYa.count || 0, total: pedidosYa.total || 0 },
    general: {
      count: (local.count || 0) + (pedidosYa.count || 0),
      total: (local.total || 0) + (pedidosYa.total || 0),
    },
  };
}
