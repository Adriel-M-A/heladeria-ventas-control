import { handleIpc } from "../utils/ipcHelper.js";
import * as repo from "../database/salesRepo.js";

function validateSale(data) {
  if (!["local", "pedidos_ya"].includes(data.type))
    throw new Error("Tipo de venta inválido.");
  if (!data.presentation_name) throw new Error("Producto obligatorio.");

  const priceBase = Number(data.price_base);
  const quantity = Number(data.quantity);
  const total = Number(data.total);

  if (isNaN(priceBase) || priceBase < 0)
    throw new Error("Precio base inválido.");
  if (isNaN(quantity) || quantity <= 0) throw new Error("Cantidad inválida.");
  if (isNaN(total) || total < 0) throw new Error("Total inválido.");

  if (total > priceBase * quantity + 10) {
    throw new Error("El total parece incorrecto (demasiado alto).");
  }

  return { ...data, price_base: priceBase, quantity, total };
}

export function setupSalesHandlers() {
  // AHORA RECIBE period Y customRange
  handleIpc(
    "get-sales",
    (event, type, page, pageSize, period = "today", customRange = null) =>
      repo.getSales(type, page, pageSize, period, customRange)
  );

  handleIpc("add-sale", (event, data) => {
    const valid = validateSale(data);
    return repo.addSale(valid);
  });

  handleIpc("delete-sale", (event, id) => {
    if (!id) throw new Error("ID de venta requerido.");
    return repo.deleteSale(id);
  });
}
