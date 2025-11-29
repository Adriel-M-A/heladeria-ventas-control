import { getDB } from "../db.js";

export function getPromotions() {
  const db = getDB();
  return db
    .prepare(
      `
    SELECT p.*, pr.name as presentation_name 
    FROM promotions p 
    LEFT JOIN presentations pr ON p.presentation_id = pr.id 
    ORDER BY p.id DESC
  `
    )
    .all();
}

export function addPromotion(promo) {
  const db = getDB();
  const stmt = db.prepare(`
    INSERT INTO promotions (
      name, presentation_id, min_quantity, discount_type, discount_value, 
      active_days, start_date, end_date, is_active
    )
    VALUES (
      @name, @presentation_id, @min_quantity, @discount_type, @discount_value, 
      @active_days, @start_date, @end_date, @is_active
    )
  `);
  const info = stmt.run(promo);
  return { id: info.lastInsertRowid, ...promo };
}

export function updatePromotion(promo) {
  const db = getDB();
  const stmt = db.prepare(`
    UPDATE promotions SET 
      name = @name, 
      presentation_id = @presentation_id, 
      min_quantity = @min_quantity, 
      discount_type = @discount_type, 
      discount_value = @discount_value, 
      active_days = @active_days,
      start_date = @start_date,
      end_date = @end_date,
      is_active = @is_active
    WHERE id = @id
  `);
  stmt.run(promo);
  return promo;
}

export function deletePromotion(id) {
  const db = getDB();
  db.prepare("DELETE FROM promotions WHERE id = ?").run(id);
  return id;
}
