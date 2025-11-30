import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";

// Importar configuradores de handlers
import { setupProductHandlers } from "./handlers/productsHandler.js";
import { setupPromotionHandlers } from "./handlers/promotionsHandler.js";
import { setupSalesHandlers } from "./handlers/salesHandler.js";
import { setupStatsHandlers } from "./handlers/statsHandler.js";
import { setupSystemHandlers } from "./handlers/systemHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ID = "com.elixir.ventas";

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Elixir Ventas",
    frame: true,
    autoHideMenuBar: true,
    show: false,
    backgroundColor: "#f8fafc",
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

  win.once("ready-to-show", () => {
    win.maximize();
    win.show();
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId(APP_ID);

  // 1. Iniciar Base de Datos
  try {
    connectDB();
  } catch (e) {
    console.error("CRITICAL: Fallo al iniciar la base de datos", e);
  }

  // 2. Configurar Handlers (Modularizado)
  setupProductHandlers();
  setupPromotionHandlers();
  setupSalesHandlers();
  setupStatsHandlers();
  setupSystemHandlers();

  // 3. Crear Ventana
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
