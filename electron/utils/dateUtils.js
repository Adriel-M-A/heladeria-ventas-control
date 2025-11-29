export const getStartDate = (period) => {
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
    const diff = today.getDate() - day + (day === 0 ? -6 : 1); // Ajuste para que Lunes sea inicio
    const monday = new Date(today.setDate(diff));
    return monday.toISOString();
  }
  if (period === "month") {
    const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
    return firstDay.toISOString();
  }
  return null;
};

export const getPeriodRange = (period, customRange) => {
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
