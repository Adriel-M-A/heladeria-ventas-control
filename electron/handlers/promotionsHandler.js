import { handleIpc } from "../utils/ipcHelper.js";
import * as repo from "../database/promotionsRepo.js";

export function setupPromotionHandlers() {
  handleIpc("get-promotions", () => repo.getPromotions());

  handleIpc("add-promotion", (event, data) => {
    if (!data.name) throw new Error("Nombre requerido");
    if (!data.presentation_id) throw new Error("Producto requerido");
    return repo.addPromotion(data);
  });

  handleIpc("update-promotion", (event, data) => {
    if (!data.id) throw new Error("ID requerido");
    return repo.updatePromotion(data);
  });

  handleIpc("delete-promotion", (event, id) => {
    if (!id) throw new Error("ID requerido");
    return repo.deletePromotion(id);
  });
}
