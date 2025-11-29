import { getDB } from "../db.js";

export function getPresentations() {
  const db = getDB();
  return db.prepare("SELECT * FROM presentations ORDER BY id DESC").all();
}

export function addPresentation(name, price) {
  const db = getDB();
  const info = db
    .prepare("INSERT INTO presentations (name, price) VALUES (?, ?)")
    .run(name, price);
  return { id: info.lastInsertRowid, name, price };
}

export function updatePresentation(id, name, price) {
  const db = getDB();
  db.prepare("UPDATE presentations SET name = ?, price = ? WHERE id = ?").run(
    name,
    price,
    id
  );
  return { id, name, price };
}

export function deletePresentation(id) {
  const db = getDB();
  db.prepare("DELETE FROM presentations WHERE id = ?").run(id);
  return id;
}
