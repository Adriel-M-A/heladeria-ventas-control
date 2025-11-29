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

// --- SISTEMA DE MIGRACIONES ---

const migrations = [
  // MIGRACIÓN 1: Estructura base
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
  // MIGRACIÓN 2: Tabla de Promociones
  (db) => {
    db.exec(`
      CREATE TABLE IF NOT EXISTS promotions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        presentation_id INTEGER NOT NULL,
        min_quantity INTEGER DEFAULT 1,
        discount_type TEXT NOT NULL, -- 'fixed_price', 'percentage', 'amount_off'
        discount_value INTEGER NOT NULL,
        active_days TEXT, -- '0,1,2,3,4,5,6' (0=Domingo)
        is_active INTEGER DEFAULT 1,
        FOREIGN KEY(presentation_id) REFERENCES presentations(id) ON DELETE CASCADE
      );
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

// --- GESTIÓN DE CONEXIÓN ---

export function connectDB() {
  if (db) return;
  try {
    db = new Database(dbPath);
    db.pragma("journal_mode = WAL");
    runMigrations();
  } catch (error) {
    console.error("Error al conectar con la base de datos:", error);
    throw error;
  }
}

export function initDB() {
  connectDB();
}

export function closeDB() {
  if (db && db.open) {
    db.close();
    db = null;
  }
}

// --- CONSULTAS ---

export function getPresentations() {
  if (!db) connectDB();
  return db.prepare("SELECT * FROM presentations ORDER BY id DESC").all();
}

export function addPresentation(name, price) {
  if (!db) connectDB();
  const info = db
    .prepare("INSERT INTO presentations (name, price) VALUES (?, ?)")
    .run(name, price);
  return { id: info.lastInsertRowid, name, price };
}

export function updatePresentation(id, name, price) {
  if (!db) connectDB();
  db.prepare("UPDATE presentations SET name = ?, price = ? WHERE id = ?").run(
    name,
    price,
    id
  );
  return { id, name, price };
}

export function deletePresentation(id) {
  if (!db) connectDB();
  db.prepare("DELETE FROM presentations WHERE id = ?").run(id);
  return id;
}

// --- NUEVO: CRUD DE PROMOCIONES ---

export function getPromotions() {
  if (!db) connectDB();
  // Traemos el nombre de la presentación también para mostrarlo fácil en la tabla
  return db
    .prepare(
      `
    SELECT p.*, pr.name as presentation_name 
    FROM promotions p 
    LEFT JOIN presentations pr ON p.presentation_id = pr.id 
    ORDER BY p.id DESC
  `
    )
    .all();
}

export function addPromotion(promo) {
  if (!db) connectDB();
  const stmt = db.prepare(`
    INSERT INTO promotions (name, presentation_id, min_quantity, discount_type, discount_value, active_days, is_active)
    VALUES (@name, @presentation_id, @min_quantity, @discount_type, @discount_value, @active_days, @is_active)
  `);
  const info = stmt.run(promo);
  return { id: info.lastInsertRowid, ...promo };
}

export function updatePromotion(promo) {
  if (!db) connectDB();
  const stmt = db.prepare(`
    UPDATE promotions SET 
      name = @name, 
      presentation_id = @presentation_id, 
      min_quantity = @min_quantity, 
      discount_type = @discount_type, 
      discount_value = @discount_value, 
      active_days = @active_days,
      is_active = @is_active
    WHERE id = @id
  `);
  stmt.run(promo);
  return promo;
}

export function deletePromotion(id) {
  if (!db) connectDB();
  db.prepare("DELETE FROM promotions WHERE id = ?").run(id);
  return id;
}

// --- VENTAS Y REPORTES (Igual que antes) ---

const getStartDate = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (period === "today") return today.toISOString();
  if (period === "yesterday") {
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString();
  }
  if (period === "week") {
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    return monday.toISOString();
  }
  if (period === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString();
  }
  return null;
};

export function getSales(type, page = 1, pageSize = 10) {
  if (!db) connectDB();
  const startOfDay = getStartDate("today");
  const offset = (page - 1) * pageSize;
  let query = "SELECT * FROM sales";
  let countQuery = "SELECT COUNT(*) as total FROM sales";
  const conditions = [];
  const params = [];

  conditions.push("date >= ?");
  params.push(startOfDay);

  if (type && type !== "all") {
    conditions.push("type = ?");
    params.push(type);
  }

  if (conditions.length > 0) {
    const where = " WHERE " + conditions.join(" AND ");
    query += where;
    countQuery += where;
  }

  query += " ORDER BY id DESC LIMIT ? OFFSET ?";

  const stmt = db.prepare(query);
  const rows = stmt.all(...params, pageSize, offset);
  const totalResult = db.prepare(countQuery).get(...params);

  return {
    data: rows,
    total: totalResult.total || 0,
    page,
    pageSize,
    totalPages: Math.ceil((totalResult.total || 0) / pageSize),
  };
}

export function addSale(sale) {
  if (!db) connectDB();
  const stmt = db.prepare(`
    INSERT INTO sales (type, presentation_name, price_base, quantity, total, date)
    VALUES (@type, @presentation_name, @price_base, @quantity, @total, @date)
  `);
  const info = stmt.run(sale);
  return { id: info.lastInsertRowid, ...sale };
}

export function getStats() {
  if (!db) connectDB();
  const startOfDay = getStartDate("today");
  const local = db
    .prepare(
      "SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE type = 'local' AND date >= ?"
    )
    .get(startOfDay);
  const pedidosYa = db
    .prepare(
      "SELECT COUNT(*) as count, SUM(total) as total FROM sales WHERE type = 'pedidos_ya' AND date >= ?"
    )
    .get(startOfDay);
  return {
    local: { count: local.count || 0, total: local.total || 0 },
    pedidosYa: { count: pedidosYa.count || 0, total: pedidosYa.total || 0 },
    general: {
      count: (local.count || 0) + (pedidosYa.count || 0),
      total: (local.total || 0) + (pedidosYa.total || 0),
    },
  };
}

export function getReports(period, customRange, typeFilter = "all") {
  if (!db) connectDB();
  const cardPeriods = ["today", "yesterday", "week", "month"];
  const cards = {};

  const getPeriodRange = (period, customRange) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    if (period === "today") return { start: today.toISOString(), end: null };
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
    if (period === "custom" && customRange?.from && customRange?.to) {
      const fromDate = new Date(customRange.from + "T00:00:00");
      const toDate = new Date(customRange.to + "T23:59:59.999");
      return { start: fromDate.toISOString(), end: toDate.toISOString() };
    }
    return { start: null, end: null };
  };

  const queryTotal = (start, end) => {
    let sql = "SELECT COUNT(*) as count, SUM(total) as revenue FROM sales";
    const conditions = [];
    if (start) conditions.push(`date >= '${start}'`);
    if (end) conditions.push(`date <= '${end}'`);
    if (conditions.length > 0) sql += " WHERE " + conditions.join(" AND ");
    const res = db.prepare(sql).get();
    return { count: res.count || 0, revenue: res.revenue || 0 };
  };

  cardPeriods.forEach((p) => {
    const { start, end } = getPeriodRange(p);
    cards[p] = queryTotal(start, end);
  });

  if (period === "custom") {
    const { start, end } = getPeriodRange("custom", customRange);
    cards["custom"] = queryTotal(start, end);
  } else {
    cards["custom"] = { count: 0, revenue: 0 };
  }

  const { start: selectedStart, end: selectedEnd } = getPeriodRange(
    period,
    customRange
  );
  let dateConditions = [];
  if (selectedStart) dateConditions.push(`date >= '${selectedStart}'`);
  if (selectedEnd) dateConditions.push(`date <= '${selectedEnd}'`);
  let dateWhere = "";
  if (dateConditions.length > 0)
    dateWhere = "WHERE " + dateConditions.join(" AND ");

  let fullConditions = [...dateConditions];
  if (typeFilter !== "all") fullConditions.push(`type = '${typeFilter}'`);
  let fullWhere = "";
  if (fullConditions.length > 0)
    fullWhere = "WHERE " + fullConditions.join(" AND ");

  const channels = db
    .prepare(
      `SELECT type, COUNT(*) as count, SUM(total) as revenue FROM sales ${dateWhere} GROUP BY type`
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
      `SELECT presentation_name as name, SUM(quantity) as units, SUM(total) as revenue FROM sales ${fullWhere} GROUP BY presentation_name ORDER BY units DESC`
    )
    .all();

  const isDaily = ["week", "month"].includes(period) || period === "custom";
  const timeFormat = isDaily ? "%Y-%m-%d" : "%H";
  const trend = db
    .prepare(
      `SELECT strftime('${timeFormat}', date, 'localtime') as label, SUM(total) as total FROM sales ${fullWhere} GROUP BY label ORDER BY label ASC`
    )
    .all();

  return {
    cards,
    details: { channels: channelData, presentations, trend, isDaily },
  };
}

export function backupDB(destination) {
  if (!db) connectDB();
  return db.backup(destination);
}
