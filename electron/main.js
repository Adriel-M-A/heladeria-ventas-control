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
    // frame: true, // Por defecto es true. Lo dejamos así para tener bordes y botón de cerrar.
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  // ESTA LÍNEA ES LA CLAVE: Elimina la barra "File, Edit, View..."
  win.setMenu(null);

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    // Si quieres abrir las herramientas de desarrollador (F12) manualmente:
    // win.webContents.openDevTools();
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  // Inicializar BD
  initDB();

  // IPC Handlers
  ipcMain.handle("get-presentations", () => getPresentations());
  ipcMain.handle("add-presentation", (event, data) =>
    addPresentation(data.name, data.price)
  );
  ipcMain.handle("update-presentation", (event, data) =>
    updatePresentation(data.id, data.name, data.price)
  );
  ipcMain.handle("delete-presentation", (event, id) => deletePresentation(id));
  ipcMain.handle("get-sales", (event, type) => getSales(type));
  ipcMain.handle("add-sale", (event, data) => addSale(data));
  ipcMain.handle("get-stats", () => getStats());

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
