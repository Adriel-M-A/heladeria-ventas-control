import { getDB } from "../db.js";
import { getPeriodRange } from "../utils/dateUtils.js";

export function getSales(
  type,
  page = 1,
  pageSize = 10,
  period = "today",
  customRange = null
) {
  const db = getDB();
  const offset = (page - 1) * pageSize;

  // Obtenemos el rango de fechas dinámico
  const { start, end } = getPeriodRange(period, customRange);

  let query = "SELECT * FROM sales";
  let countQuery = "SELECT COUNT(*) as total FROM sales";
  const params = [];
  const conditions = [];

  // Filtro de Fecha (Inicio y Fin)
  if (start) {
    conditions.push("date >= ?");
    params.push(start);
  }
  if (end) {
    conditions.push("date <= ?");
    params.push(end);
  }

  // Filtro de Tipo (Canal)
  if (type && type !== "all") {
    conditions.push("type = ?");
    params.push(type);
  }

  if (conditions.length > 0) {
    const where = " WHERE " + conditions.join(" AND ");
    query += where;
    countQuery += where;
  }

  // CAMBIO CLAVE AQUÍ:
  // Antes: ORDER BY id DESC
  // Ahora: ORDER BY date DESC (fecha más nueva primero), id DESC (desempate)
  query += " ORDER BY date DESC, id DESC LIMIT ? OFFSET ?";

  const stmt = db.prepare(query);
  // Agregamos paginación a los parámetros
  const rows = stmt.all(...params, pageSize, offset);

  // Para el conteo total, usamos los mismos parámetros de filtro (sin limit/offset)
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

export function deleteSale(id) {
  const db = getDB();
  const info = db.prepare("DELETE FROM sales WHERE id = ?").run(id);
  return info.changes > 0;
}
