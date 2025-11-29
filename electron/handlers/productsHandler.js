import { handleIpc } from "../utils/ipcHelper.js";
import * as repo from "../database/productsRepo.js";

function validateProduct(data) {
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    throw new Error("El nombre es obligatorio.");
  }
  const price = Number(data.price);
  if (isNaN(price) || price < 0) {
    throw new Error("El precio debe ser un número válido positivo.");
  }
  return { name: data.name.trim(), price };
}

export function setupProductHandlers() {
  handleIpc("get-presentations", () => repo.getPresentations());

  handleIpc("add-presentation", (event, data) => {
    const valid = validateProduct(data);
    return repo.addPresentation(valid.name, valid.price);
  });

  handleIpc("update-presentation", (event, data) => {
    if (!data.id) throw new Error("ID requerido.");
    const valid = validateProduct(data);
    return repo.updatePresentation(data.id, valid.name, valid.price);
  });

  handleIpc("delete-presentation", (event, id) => {
    if (!id) throw new Error("ID requerido.");
    return repo.deletePresentation(id);
  });
}
