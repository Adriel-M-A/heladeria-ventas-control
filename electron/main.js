import { app, BrowserWindow, ipcMain } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import {
  initDB,
  getPresentations,
  addPresentation,
  updatePresentation,
  deletePresentation,
  getSales,
  addSale,
  getStats,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false, // Por seguridad
      contextIsolation: true, // Por seguridad (usamos preload)
      preload: path.join(__dirname, "preload.js"),
    },
  });

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // 1. Inicializar la Base de Datos
  initDB();

  // 2. Configurar los manejadores de eventos (IPC)

  // --- Presentaciones ---
  ipcMain.handle("get-presentations", () => getPresentations());
  ipcMain.handle("add-presentation", (event, data) =>
    addPresentation(data.name, data.price)
  );
  ipcMain.handle("update-presentation", (event, data) =>
    updatePresentation(data.id, data.name, data.price)
  );
  ipcMain.handle("delete-presentation", (event, id) => deletePresentation(id));

  // --- Ventas ---
  ipcMain.handle("get-sales", (event, type) => getSales(type));
  ipcMain.handle("add-sale", (event, data) => addSale(data));
  ipcMain.handle("get-stats", () => getStats());

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
