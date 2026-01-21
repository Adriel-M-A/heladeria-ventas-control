import { getDB } from "../db.js";

export function getFlavors() {
    const db = getDB();
    return db
        .prepare("SELECT * FROM flavors WHERE is_active = 1 ORDER BY name ASC")
        .all();
}

export function addFlavor(name) {
    const db = getDB();
    const stmt = db.prepare(
        "INSERT INTO flavors (name, stock, is_active) VALUES (?, 0, 1)"
    );
    const info = stmt.run(name);
    return {
        id: info.lastInsertRowid,
        name,
        stock: 0,
        is_active: 1,
    };
}

export function updateFlavorStock(id, newStock) {
    const db = getDB();
    const stmt = db.prepare("UPDATE flavors SET stock = ? WHERE id = ?");
    stmt.run(newStock, id);
    return { id, stock: newStock };
}

export function deleteFlavor(id) {
    const db = getDB();
    // Baja lógica para no perder historial si en el futuro se vincula a algo
    // O baja física si el cliente quiere limpiar. El plan decía lógica.
    db.prepare("UPDATE flavors SET is_active = 0 WHERE id = ?").run(id);
    // O alternativamente DELETE físico si queremos simplicidad total ya que no hay FKs
    // db.prepare("DELETE FROM flavors WHERE id = ?").run(id);
    return id;
}
