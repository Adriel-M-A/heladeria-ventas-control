import { app, dialog, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { handleIpc } from "../utils/ipcHelper.js";
import { backupDB, closeDB, connectDB } from "../db.js";

export function setupSystemHandlers() {
  handleIpc("backup-db", async () => {
    const { filePath } = await dialog.showSaveDialog({
      title: "Guardar Copia de Seguridad",
      defaultPath: `heladeria-backup-${new Date()
        .toISOString()
        .slice(0, 10)}.db`,
      filters: [{ name: "SQLite Database", extensions: ["db"] }],
    });

    if (!filePath) return { success: false };

    await backupDB(filePath);
    return { success: true, path: filePath };
  });

  handleIpc("restore-db", async () => {
    const { filePaths } = await dialog.showOpenDialog({
      title: "Seleccionar Archivo de Respaldo",
      properties: ["openFile"],
      filters: [{ name: "SQLite Database", extensions: ["db"] }],
    });

    if (!filePaths || filePaths.length === 0) return { success: false };

    const backupFile = filePaths[0];

    // 1. Cerrar conexión
    closeDB();

    const currentDbPath = app.isPackaged
      ? path.join(app.getPath("userData"), "heladeria.db")
      : path.join(app.getPath("userData"), "..", "heladeria.db"); // Ajuste path dev según estructura

    // En desarrollo el path suele ser diferente, asegúrate de que db.js y aquí usen la misma lógica o exporta dbPath.
    // Para simplificar y evitar errores de path en dev, asumimos que db.js gestiona el path internamente
    // pero aquí necesitamos sobreescribirlo.
    // MEJOR OPCIÓN: Delegar la ruta a una constante compartida si fuera necesario,
    // pero por ahora usaremos la misma lógica que tenías en main.js:
    const __dirname = path.resolve(); // En ESM root
    const targetPath = app.isPackaged
      ? path.join(app.getPath("userData"), "heladeria.db")
      : path.join(__dirname, "heladeria.db");

    try {
      fs.copyFileSync(backupFile, targetPath);
      connectDB();
      BrowserWindow.getAllWindows().forEach((win) => win.reload());
      return { success: true };
    } catch (error) {
      connectDB(); // Intentar reconectar si falla
      throw new Error("No se pudo restaurar: " + error.message);
    }
  });
}
