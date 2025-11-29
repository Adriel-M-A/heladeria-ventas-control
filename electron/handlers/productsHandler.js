import { handleIpc } from "../utils/ipcHelper.js";
import * as repo from "../database/productsRepo.js";

function validateProduct(data) {
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    throw new Error("El nombre es obligatorio.");
  }

  const pLocal = Number(data.price_local);
  const pDelivery = Number(data.price_delivery);

  if (isNaN(pLocal) || pLocal < 0) {
    throw new Error("El precio local debe ser válido.");
  }

  if (isNaN(pDelivery) || pDelivery < 0) {
    throw new Error("El precio delivery debe ser válido.");
  }

  return {
    name: data.name.trim(),
    price_local: pLocal,
    price_delivery: pDelivery,
  };
}

export function setupProductHandlers() {
  handleIpc("get-presentations", () => repo.getPresentations());

  handleIpc("add-presentation", (event, data) => {
    const valid = validateProduct(data);
    return repo.addPresentation(
      valid.name,
      valid.price_local,
      valid.price_delivery
    );
  });

  handleIpc("update-presentation", (event, data) => {
    if (!data.id) throw new Error("ID requerido.");
    const valid = validateProduct(data);
    return repo.updatePresentation(
      data.id,
      valid.name,
      valid.price_local,
      valid.price_delivery
    );
  });

  handleIpc("delete-presentation", (event, id) => {
    if (!id) throw new Error("ID requerido.");
    return repo.deletePresentation(id);
  });
}
