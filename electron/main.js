import { app, BrowserWindow } from "electron";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function createWindow() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  // CORRECCIÓN IMPORTANTE:
  // app.isPackaged devuelve 'true' si es un ejecutable (.exe)
  // devuelve 'false' si estamos ejecutando "npm run electron:dev"

  if (!app.isPackaged) {
    win.loadURL("http://localhost:5173");
    // Opcional: Abre las herramientas de desarrollador (F12) automáticamente para ver errores
    win.webContents.openDevTools();
  } else {
    // Modo producción (.exe)
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
