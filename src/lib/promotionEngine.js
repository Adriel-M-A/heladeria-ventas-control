import { getToday } from "@/lib/utils";

export function calculatePriceWithPromotions({
  presentation,
  promotions,
  quantity,
  channel, // 'local' | 'pedidos_ya'
}) {
  // 1. Valores base
  if (!presentation) {
    return { total: 0, baseTotal: 0, appliedPromo: null };
  }

  const price =
    channel === "pedidos_ya"
      ? presentation.price_delivery
      : presentation.price_local;

  const baseTotal = price * quantity;

  // 2. Datos de fecha actuales para validación
  const todayStr = getToday(); // Usamos tu utilidad centralizada
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 (Domingo) - 6 (Sábado)

  // 3. Filtrar promociones aplicables
  const validPromos = promotions.filter((p) => {
    // Coincidencia de producto
    if (p.presentation_id !== presentation.id) return false;

    // Estado activo
    if (p.is_active !== 1) return false;

    // Cantidad mínima
    if (quantity < p.min_quantity) return false;

    // Canal de venta (Local vs PedidosYa)
    if (p.channel && p.channel !== "all" && p.channel !== channel) return false;

    // Fechas (Inicio / Fin)
    if (p.start_date && todayStr < p.start_date) return false;
    if (p.end_date && todayStr > p.end_date) return false;

    // Días de la semana
    if (p.active_days && p.active_days !== "") {
      const activeDaysList = p.active_days.split(",").map(Number);
      if (!activeDaysList.includes(dayOfWeek)) return false;
    }

    return true;
  });

  // 4. Ordenar promociones (Prioridad a las de rango de fecha específico sobre las genéricas)
  validPromos.sort((a, b) => {
    const aHasDate = !!(a.start_date || a.end_date);
    const bHasDate = !!(b.start_date || b.end_date);

    if (aHasDate && !bHasDate) return -1;
    if (!aHasDate && bHasDate) return 1;
    return 0; // Se podría agregar más lógica de prioridad aquí (ej: mayor descuento)
  });

  const applicablePromo = validPromos.length > 0 ? validPromos[0] : null;

  // 5. Calcular Total Final
  let finalTotal = baseTotal;

  if (applicablePromo) {
    const packSize = applicablePromo.min_quantity;
    const numPacks = Math.floor(quantity / packSize);
    const remainder = quantity % packSize;

    if (applicablePromo.discount_type === "fixed_price") {
      // Ej: 2 unidades por $4500
      const comboPrice = applicablePromo.discount_value;
      finalTotal = numPacks * comboPrice + remainder * price;
    } else if (applicablePromo.discount_type === "percentage") {
      // Ej: 10% OFF en la segunda unidad (si el pack fuera de 2) o en el total del pack
      // Asumimos que el porcentaje aplica al bloque completo de 'min_quantity'
      const packBasePrice = packSize * price;
      const packDiscounted =
        packBasePrice * (1 - applicablePromo.discount_value / 100);
      finalTotal = numPacks * packDiscounted + remainder * price;
    } else if (applicablePromo.discount_type === "amount_off") {
      // Ej: $500 pesos menos llevando 2
      const packBasePrice = packSize * price;
      const packDiscounted = Math.max(
        0,
        packBasePrice - applicablePromo.discount_value
      );
      finalTotal = numPacks * packDiscounted + remainder * price;
    }
  }

  // Seguridad: nunca devolver negativo
  finalTotal = Math.max(0, finalTotal);

  return {
    total: finalTotal,
    baseTotal: baseTotal,
    appliedPromo: applicablePromo,
  };
}
