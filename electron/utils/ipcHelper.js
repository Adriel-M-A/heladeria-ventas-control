import { ipcMain } from "electron";

export const handleIpc = (channel, handler) => {
  ipcMain.handle(channel, async (event, ...args) => {
    try {
      return await handler(event, ...args);
    } catch (error) {
      console.error(`[Error IPC] Canal: ${channel}`, error);
      throw new Error(
        error.message || "Ocurrió un error inesperado en el sistema."
      );
    }
  });
};
