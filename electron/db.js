import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CORRECCIÓN AQUÍ: Usamos "../" para apuntar a la raíz del proyecto
const dbPath = app.isPackaged
  ? path.join(app.getPath("userData"), "heladeria.db")
  : path.join(__dirname, "../heladeria.db");

const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initDB() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS presentations (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      price INTEGER NOT NULL
    )
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS sales (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL,
      presentation_name TEXT NOT NULL,
      price_base INTEGER NOT NULL,
      quantity INTEGER NOT NULL,
      total INTEGER NOT NULL,
      date TEXT NOT NULL
    )
  `);
}

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

export function getSales(type) {
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

// Lógica de fechas corregida para Reportes
const getPeriodRange = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "today") {
    return { start: today.toISOString(), end: null };
  }
  if (period === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return { start: yesterday.toISOString(), end: today.toISOString() };
  }
  if (period === "week") {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return { start: monday.toISOString(), end: null };
  }
  if (period === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return { start: firstDay.toISOString(), end: null };
  }
  return { start: null, end: null };
};

export function getReports(period) {
  const cardPeriods = ["today", "yesterday", "week", "month", "total"];
  const cards = {};

  const queryTotal = (start, end) => {
    let sql = "SELECT COUNT(*) as count, SUM(total) as revenue FROM sales";
    const conditions = [];
    if (start) conditions.push(`date >= '${start}'`);
    if (end) conditions.push(`date < '${end}'`);

    if (conditions.length > 0) {
      sql += " WHERE " + conditions.join(" AND ");
    }

    const res = db.prepare(sql).get();
    return { count: res.count || 0, revenue: res.revenue || 0 };
  };

  cardPeriods.forEach((p) => {
    const { start, end } = getPeriodRange(p);
    cards[p] = queryTotal(start, end);
  });

  const { start: selectedStart, end: selectedEnd } = getPeriodRange(period);

  let whereClause = "";
  const conditions = [];
  if (selectedStart) conditions.push(`date >= '${selectedStart}'`);
  if (selectedEnd) conditions.push(`date < '${selectedEnd}'`);

  if (conditions.length > 0) {
    whereClause = "WHERE " + conditions.join(" AND ");
  }

  const channels = db
    .prepare(
      `
    SELECT type, COUNT(*) as count, SUM(total) as revenue 
    FROM sales 
    ${whereClause} 
    GROUP BY type
  `
    )
    .all();

  const channelData = {
    local: channels.find((c) => c.type === "local") || { count: 0, revenue: 0 },
    pedidosYa: channels.find((c) => c.type === "pedidos_ya") || {
      count: 0,
      revenue: 0,
    },
  };

  const presentations = db
    .prepare(
      `
    SELECT presentation_name as name, SUM(quantity) as units, SUM(total) as revenue 
    FROM sales 
    ${whereClause} 
    GROUP BY presentation_name 
    ORDER BY units DESC
  `
    )
    .all();

  return {
    cards,
    details: {
      channels: channelData,
      presentations,
    },
  };
}
