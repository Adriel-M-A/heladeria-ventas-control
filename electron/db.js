import Database from "better-sqlite3";
import path from "path";
import { app } from "electron";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

const getStartDate = (period) => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  if (period === "today") {
    return today.toISOString();
  }
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

export function getSales(type) {
  const startOfDay = getStartDate("today");

  if (type && type !== "all") {
    const stmt = db.prepare(
      "SELECT * FROM sales WHERE type = ? AND date >= ? ORDER BY id DESC"
    );
    return stmt.all(type, startOfDay);
  }
  const stmt = db.prepare(
    "SELECT * FROM sales WHERE date >= ? ORDER BY id DESC"
  );
  return stmt.all(startOfDay);
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

    return {
      start: fromDate.toISOString(),
      end: toDate.toISOString(),
    };
  }

  return { start: null, end: null };
};

// MODIFICADO: Acepta typeFilter ("all", "local", "pedidos_ya")
export function getReports(period, customRange, typeFilter = "all") {
  const cardPeriods = ["today", "yesterday", "week", "month"];
  const cards = {};

  const queryTotal = (start, end) => {
    let sql = "SELECT COUNT(*) as count, SUM(total) as revenue FROM sales";
    const conditions = [];
    if (start) conditions.push(`date >= '${start}'`);
    if (end) conditions.push(`date <= '${end}'`);

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

  // 1. WHERE base (Solo fechas) -> Para los totales de canales
  let dateConditions = [];
  if (selectedStart) dateConditions.push(`date >= '${selectedStart}'`);
  if (selectedEnd) dateConditions.push(`date <= '${selectedEnd}'`);

  let dateWhere = "";
  if (dateConditions.length > 0) {
    dateWhere = "WHERE " + dateConditions.join(" AND ");
  }

  // 2. WHERE completo (Fechas + Filtro de Tipo) -> Para Ranking y Tendencias
  let fullConditions = [...dateConditions];
  if (typeFilter !== "all") {
    fullConditions.push(`type = '${typeFilter}'`);
  }

  let fullWhere = "";
  if (fullConditions.length > 0) {
    fullWhere = "WHERE " + fullConditions.join(" AND ");
  }

  // Usamos dateWhere (sin filtrar tipo) para mostrar siempre los totales correctos en la tarjeta de selección
  const channels = db
    .prepare(
      `
    SELECT type, COUNT(*) as count, SUM(total) as revenue 
    FROM sales 
    ${dateWhere} 
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

  // Usamos fullWhere (filtrado por tipo) para el Ranking
  const presentations = db
    .prepare(
      `
    SELECT presentation_name as name, SUM(quantity) as units, SUM(total) as revenue 
    FROM sales 
    ${fullWhere} 
    GROUP BY presentation_name 
    ORDER BY units DESC
  `
    )
    .all();

  const isDaily = ["week", "month"].includes(period) || period === "custom";
  const timeFormat = isDaily ? "%Y-%m-%d" : "%H";

  // Usamos fullWhere (filtrado por tipo) para la Tendencia
  const trend = db
    .prepare(
      `
    SELECT strftime('${timeFormat}', date, 'localtime') as label, SUM(total) as total
    FROM sales 
    ${fullWhere} 
    GROUP BY label 
    ORDER BY label ASC
  `
    )
    .all();

  return {
    cards,
    details: {
      channels: channelData,
      presentations,
      trend,
      isDaily,
    },
  };
}
