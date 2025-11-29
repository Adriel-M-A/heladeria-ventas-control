import { getDB } from "../db.js";
import { getStartDate } from "../utils/dateUtils.js";

export function getSales(type, page = 1, pageSize = 10) {
  const db = getDB();
  const startOfDay = getStartDate("today");
  const offset = (page - 1) * pageSize;

  let query = "SELECT * FROM sales";
  let countQuery = "SELECT COUNT(*) as total FROM sales";
  const params = [];

  // Filtro base: Hoy en adelante
  const conditions = ["date >= ?"];
  params.push(startOfDay);

  if (type && type !== "all") {
    conditions.push("type = ?");
    params.push(type);
  }

  const where = " WHERE " + conditions.join(" AND ");
  query += where + " ORDER BY id DESC LIMIT ? OFFSET ?";
  countQuery += where;

  const stmt = db.prepare(query);
  const rows = stmt.all(...params, pageSize, offset);

  // Para count no pasamos limit/offset
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
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO sales (type, presentation_name, price_base, quantity, total, date)
    VALUES (@type, @presentation_name, @price_base, @quantity, @total, @date)
  `);
  const info = stmt.run(sale);
  return { id: info.lastInsertRowid, ...sale };
}

// NUEVA FUNCIÓN
export function deleteSale(id) {
  const db = getDB();
  const info = db.prepare("DELETE FROM sales WHERE id = ?").run(id);
  return info.changes > 0;
}
