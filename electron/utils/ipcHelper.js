import { ipcMain } from "electron";
import log from "electron-log"; // Importar el logger

export const handleIpc = (channel, handler) => {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      // AQUÍ ESTÁ LA MAGIA:
      // Registramos el error en el archivo log.txt antes de lanzarlo al frontend
      log.error(`[IPC Error] Canal: ${channel}`, error);

      // Mantenemos el console.error para cuando desarrollas en tu PC
      console.error(`[Error IPC] Canal: ${channel}`, error);

      throw new Error(
        error.message || "Ocurrió un error inesperado en el sistema."
      );
    }
  });
};
