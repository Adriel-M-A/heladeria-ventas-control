import { getDB } from "../db.js";

export function getPresentations() {
  const db = getDB();
  return db.prepare("SELECT * FROM presentations ORDER BY id DESC").all();
}

export function addPresentation(name, price_local, price_delivery) {
  const db = getDB();
  const stmt = db.prepare(
    "INSERT INTO presentations (name, price_local, price_delivery) VALUES (?, ?, ?)"
  );
  // Si no envían precio delivery, usamos el local por defecto
  const pDelivery = price_delivery !== undefined ? price_delivery : price_local;

  const info = stmt.run(name, price_local, pDelivery);
  return {
    id: info.lastInsertRowid,
    name,
    price_local,
    price_delivery: pDelivery,
  };
}

export function updatePresentation(id, name, price_local, price_delivery) {
  const db = getDB();
  const stmt = db.prepare(
    "UPDATE presentations SET name = ?, price_local = ?, price_delivery = ? WHERE id = ?"
  );
  stmt.run(name, price_local, price_delivery, id);
  return { id, name, price_local, price_delivery };
}

export function deletePresentation(id) {
  const db = getDB();
  db.prepare("DELETE FROM presentations WHERE id = ?").run(id);
  return id;
}
