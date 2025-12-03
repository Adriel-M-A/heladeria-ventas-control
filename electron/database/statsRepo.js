import { getDB } from "../db.js";
import { getPeriodRange } from "../utils/dateUtils.js";

export function getStats() {
  const db = getDB();

  const { start: startOfDay } = getPeriodRange("today");

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

export function getReports(
  period,
  customRange,
  typeFilter = "all",
  isExpanded = false
) {
  const db = getDB();
  const cardPeriods = ["today", "yesterday", "week", "month"];
  const cards = {};

  const typeCondition =
    typeFilter !== "all" ? `AND type = '${typeFilter}'` : "";

  const queryTotal = (start, end) => {
    let sql =
      "SELECT COUNT(*) as count, SUM(total) as revenue FROM sales WHERE 1=1";

    if (start) sql += ` AND date >= '${start}'`;
    if (end) sql += ` AND date <= '${end}'`;

    sql += ` ${typeCondition}`;

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

  let baseConditions = [];
  if (selectedStart) baseConditions.push(`date >= '${selectedStart}'`);
  if (selectedEnd) baseConditions.push(`date <= '${selectedEnd}'`);

  const fullConditions = [...baseConditions];
  if (typeFilter !== "all") fullConditions.push(`type = '${typeFilter}'`);

  const fullWhere =
    fullConditions.length > 0
      ? "WHERE " + fullConditions.join(" AND ")
      : "WHERE 1=1";

  const payments = db
    .prepare(
      `SELECT payment_method, COUNT(*) as count, SUM(total) as revenue 
       FROM sales ${fullWhere} 
       GROUP BY payment_method`
    )
    .all();

  const paymentData = {
    efectivo: payments.find((p) => p.payment_method === "efectivo") || {
      count: 0,
      revenue: 0,
    },
    mercado_pago: payments.find((p) => p.payment_method === "mercado_pago") || {
      count: 0,
      revenue: 0,
    },
  };

  const presentations = db
    .prepare(
      `SELECT presentation_name as name, SUM(quantity) as units, SUM(total) as revenue 
       FROM sales ${fullWhere} 
       GROUP BY presentation_name 
       ORDER BY units DESC`
    )
    .all();

  let isDaily = false;
  let isMonthly = false;
  let isHourly = false;
  let timeFormat = "%H";

  if (period === "week") {
    if (isExpanded) {
      isHourly = true;
      timeFormat = "%Y-%m-%d %H";
    } else {
      isDaily = true;
      timeFormat = "%Y-%m-%d";
    }
  } else if (period === "month") {
    isDaily = true;
    timeFormat = "%Y-%m-%d";
  } else if (period === "custom") {
    if (customRange?.from && customRange?.to) {
      if (customRange.from === customRange.to) {
        timeFormat = "%H";
      } else {
        const from = new Date(customRange.from);
        const to = new Date(customRange.to);
        const diffTime = Math.abs(to - from);
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays > 180) {
          if (isExpanded) {
            isDaily = true;
            timeFormat = "%Y-%m-%d";
          } else {
            isMonthly = true;
            timeFormat = "%Y-%m";
          }
        } else {
          isDaily = true;
          timeFormat = "%Y-%m-%d";
        }
      }
    }
  }

  const trend = db
    .prepare(
      `SELECT strftime('${timeFormat}', date, 'localtime') as label, SUM(total) as total 
       FROM sales ${fullWhere} 
       GROUP BY label 
       ORDER BY label ASC`
    )
    .all();

  return {
    cards,
    details: {
      payments: paymentData,
      presentations,
      trend,
      isDaily,
      isMonthly,
      isHourly,
    },
  };
}
