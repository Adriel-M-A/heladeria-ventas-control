import { app, dialog, BrowserWindow } from "electron";
import fs from "fs";
import path from "path";
import { handleIpc } from "../utils/ipcHelper.js";
import { backupDB, closeDB, connectDB } from "../db.js";

export function setupSystemHandlers() {
  handleIpc("backup-db", async () => {
    // CORRECCIÓN: Usamos fecha local para el nombre del archivo
    const todayLocal = new Date().toLocaleDateString("sv-SE");

    const { filePath } = await dialog.showSaveDialog({
      title: "Guardar Copia de Seguridad",
      defaultPath: `heladeria-backup-${todayLocal}.db`,
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

    // 1. Cerrar conexión para liberar el archivo
    closeDB();

    // 2. Definir la ruta destino correctamente según el entorno
    const __dirname = path.resolve(); // En ESM root
    const targetPath = app.isPackaged
      ? path.join(app.getPath("userData"), "heladeria.db")
      : path.join(__dirname, "heladeria.db");

    try {
      // 3. Sobrescribir el archivo de base de datos
      fs.copyFileSync(backupFile, targetPath);

      // 4. Reconectar y recargar la interfaz
      connectDB();
      BrowserWindow.getAllWindows().forEach((win) => win.reload());
      return { success: true };
    } catch (error) {
      connectDB(); // Intentar reconectar si falla para no dejar la app rota
      throw new Error("No se pudo restaurar: " + error.message);
    }
  });
}
