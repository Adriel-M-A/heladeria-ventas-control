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
  getReports,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// CAMBIO 1: Actualizar el ID de la app (coincide con package.json)
const APP_ID = "com.elixir.ventas";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    // CAMBIO 2: Título inicial de la ventana
    title: "Elixir Ventas",
    frame: true,
    autoHideMenuBar: true,
    icon: path.join(__dirname, "../public/icon.ico"),
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      sandbox: false,
      preload: path.join(__dirname, "preload.cjs"),
    },
  });

  win.setMenu(null);

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  app.setAppUserModelId(APP_ID);

  initDB();

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
  ipcMain.handle("get-reports", (event, period, customRange) =>
    getReports(period, customRange)
  );

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
