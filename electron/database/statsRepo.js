import { getDB } from "../db.js";
import { getStartDate, getPeriodRange } from "../utils/dateUtils.js";

export function getStats() {
  const db = getDB();
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
  const db = getDB();
  const cardPeriods = ["today", "yesterday", "week", "month"];
  const cards = {};

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

  // --- LÓGICA DE AGRUPACIÓN (HORA / DÍA / MES) ---
  let isDaily = false;
  let isMonthly = false;
  let timeFormat = "%H"; // Por defecto: Horas

  if (["week", "month"].includes(period)) {
    isDaily = true;
    timeFormat = "%Y-%m-%d";
  } else if (period === "custom") {
    if (customRange?.from && customRange?.to) {
      if (customRange.from === customRange.to) {
        // Mismo día: Por horas
        isDaily = false;
        timeFormat = "%H";
      } else {
        // Calcular diferencia en días
        const from = new Date(customRange.from);
        const to = new Date(customRange.to);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 180) {
          // Más de 6 meses (aprox 180 días): Agrupar por MES
          isMonthly = true;
          isDaily = false;
          timeFormat = "%Y-%m";
        } else {
          // Rango normal: Agrupar por DÍA
          isDaily = true;
          timeFormat = "%Y-%m-%d";
        }
      }
    }
  }

  const trend = db
    .prepare(
      `SELECT strftime('${timeFormat}', date, 'localtime') as label, SUM(total) as total FROM sales ${fullWhere} GROUP BY label ORDER BY label ASC`
    )
    .all();

  return {
    cards,
    details: {
      channels: channelData,
      presentations,
      trend,
      isDaily,
      isMonthly, // Enviamos este flag al frontend
    },
  };
}
