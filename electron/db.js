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

// --- HELPER DE FECHAS (Movido arriba para uso global) ---
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

// --- LOGICA DE RANGOS DE FECHAS (Actualizada para Custom) ---
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

  // --- NUEVA LÓGICA: RANGO PERSONALIZADO ---
  if (period === "custom" && customRange?.from && customRange?.to) {
    // Crear fecha desde el string YYYY-MM-DD
    // Agregamos 'T00:00:00' para asegurar que se interprete como inicio del día local
    const fromDate = new Date(customRange.from + "T00:00:00");

    // Para el final, usamos el día siguiente a las 00:00 o el mismo día a las 23:59:59
    // Usaremos el mismo día a las 23:59:59.999
    const toDate = new Date(customRange.to + "T23:59:59.999");

    return {
      start: fromDate.toISOString(),
      end: toDate.toISOString(),
    };
  }

  return { start: null, end: null };
};

export function getReports(period, customRange) {
  // 1. Calcular totales para las tarjetas predefinidas
  const cardPeriods = ["today", "yesterday", "week", "month"];
  const cards = {};

  const queryTotal = (start, end) => {
    let sql = "SELECT COUNT(*) as count, SUM(total) as revenue FROM sales";
    const conditions = [];
    if (start) conditions.push(`date >= '${start}'`);
    if (end) conditions.push(`date <= '${end}'`); // Cambiado a <= para incluir el último milisegundo

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

  // Calcular la tarjeta "Custom" dinámicamente si está seleccionada
  if (period === "custom") {
    const { start, end } = getPeriodRange("custom", customRange);
    cards["custom"] = queryTotal(start, end);
  } else {
    // Si no está seleccionada, poner ceros o lo que sea, se actualizará al seleccionar
    cards["custom"] = { count: 0, revenue: 0 };
  }

  // 2. Obtener detalles para los gráficos
  const { start: selectedStart, end: selectedEnd } = getPeriodRange(
    period,
    customRange
  );

  let whereClause = "";
  const conditions = [];
  if (selectedStart) conditions.push(`date >= '${selectedStart}'`);
  if (selectedEnd) conditions.push(`date <= '${selectedEnd}'`);

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
