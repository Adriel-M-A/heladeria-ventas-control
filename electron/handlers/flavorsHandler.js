import { handleIpc } from "../utils/ipcHelper.js";
import * as repo from "../database/flavorsRepo.js";

function validateFlavor(data) {
    if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
        throw new Error("El nombre es obligatorio.");
    }
    return {
        name: data.name.trim(),
    };
}

export function setupFlavorsHandlers() {
    handleIpc("flavors:get-all", () => repo.getFlavors());

    handleIpc("flavors:create", (event, data) => {
        const valid = validateFlavor(data);
        return repo.addFlavor(valid.name);
    });

    handleIpc("flavors:update-stock", (event, { id, stock }) => {
        if (!id) throw new Error("ID requerido.");
        if (typeof stock !== "number" || stock < 0) {
            throw new Error("Stock inválido.");
        }
        return repo.updateFlavorStock(id, stock);
    });

    handleIpc("flavors:delete", (event, id) => {
        if (!id) throw new Error("ID requerido.");
        return repo.deleteFlavor(id);
    });
}
