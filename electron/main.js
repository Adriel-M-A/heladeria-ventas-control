import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";
import { connectDB } from "./db.js";
// 1. Importar electron-log
import log from "electron-log";

// 2. Configuración de Logs
// Define el nivel de detalle y el formato en consola
log.transports.file.level = "info";
log.transports.console.format = "[{h}:{i}:{s} {level}] {text}";

// Opcional: Redirigir todos los console.log/error del sistema a los archivos de log
console.log = log.log;
Object.assign(console, log.functions);

// Importar configuradores de handlers
import { setupProductHandlers } from "./handlers/productsHandler.js";
import { setupPromotionHandlers } from "./handlers/promotionsHandler.js";
import { setupSalesHandlers } from "./handlers/salesHandler.js";
import { setupStatsHandlers } from "./handlers/statsHandler.js";
import { setupSystemHandlers } from "./handlers/systemHandler.js";
import { setupFlavorsHandlers } from "./handlers/flavorsHandler.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ID = "com.elixir.ventas";

// 3. Capturar errores inesperados (CRÍTICO para producción)
// Si la app crashea por algo raro, esto lo guardará en el archivo
process.on("uncaughtException", (error) => {
  log.error("CRITICAL: Uncaught Exception:", error);
});

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

  // win.webContents.openDevTools(); // Puedes comentar esto para la versión final

  win.once("ready-to-show", () => {
    win.maximize(); // Inicia maximizado para mejor experiencia
    win.show();
  });
}

app.whenReady().then(() => {
  log.info("🚀 Iniciando aplicación...");

  app.setAppUserModelId(APP_ID);

  // 1. Iniciar Base de Datos
  try {
    connectDB();
    log.info("Base de datos conectada exitosamente.");
  } catch (e) {
    log.error("CRITICAL: Fallo al iniciar la base de datos", e);
  }

  // 2. Configurar Handlers (Modularizado)
  setupProductHandlers();
  setupPromotionHandlers();
  setupSalesHandlers();
  setupStatsHandlers();
  setupSystemHandlers();
  setupFlavorsHandlers();

  // 3. Crear Ventana
  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
