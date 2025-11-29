import { app, BrowserWindow, ipcMain, dialog } from "electron";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import {
  initDB,
  connectDB,
  getPresentations,
  addPresentation,
  updatePresentation,
  deletePresentation,
  getSales,
  addSale,
  getStats,
  getReports,
  backupDB,
  closeDB,
  // IMPORTAR NUEVAS FUNCIONES
  getPromotions,
  addPromotion,
  updatePromotion,
  deletePromotion,
} from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const APP_ID = "com.elixir.ventas";

// ... (Las funciones validatePresentationData, validateSaleData y handleIpc se mantienen IGUAL)
function validatePresentationData(data) {
  if (!data.name || typeof data.name !== "string" || data.name.trim() === "") {
    throw new Error("El nombre de la presentación es obligatorio.");
  }
  const price = Number(data.price);
  if (isNaN(price) || price < 0) {
    throw new Error(
      "El precio debe ser un número válido y no puede ser negativo."
    );
  }
  return { ...data, name: data.name.trim(), price };
}

function validateSaleData(data) {
  // ... (tu validación actual de ventas)
  const allowedTypes = ["local", "pedidos_ya"];
  if (!allowedTypes.includes(data.type)) {
    throw new Error("El tipo de venta seleccionado no es válido.");
  }
  if (!data.presentation_name || typeof data.presentation_name !== "string") {
    throw new Error("El nombre del producto es obligatorio.");
  }
  const priceBase = Number(data.price_base);
  const quantity = Number(data.quantity);
  const total = Number(data.total);

  if (isNaN(priceBase) || priceBase < 0)
    throw new Error("El precio base es inválido.");
  if (isNaN(quantity) || quantity <= 0)
    throw new Error("La cantidad debe ser mayor a 0.");
  if (isNaN(total) || total < 0)
    throw new Error("El total no puede ser negativo.");

  // Ojo: Si hay promo, la validación estricta de (precio * cantidad == total) podría fallar.
  // La relajamos o la ajustamos si el total es menor (descuento)
  if (total > priceBase * quantity + 1) {
    // Solo error si el total es MAYOR a lo normal (cobrar de más sin razón)
    // Si es menor, asumimos que es una promo
    throw new Error("El total parece incorrecto.");
  }

  const date = new Date(data.date);
  if (isNaN(date.getTime()))
    throw new Error("La fecha de la venta es inválida.");

  return { ...data, price_base: priceBase, quantity, total };
}

const handleIpc = (channel, handler) => {
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
    win.show();
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId(APP_ID);

  try {
    connectDB();
  } catch (e) {
    console.error("CRITICAL: Fallo al iniciar la base de datos", e);
  }

  // --- HANDLERS ---
  handleIpc("get-presentations", () => getPresentations());
  handleIpc("get-sales", (event, type, page, pageSize) =>
    getSales(type, page, pageSize)
  );
  handleIpc("get-stats", () => getStats());
  handleIpc("get-reports", (event, period, customRange, typeFilter) =>
    getReports(period, customRange, typeFilter)
  );

  handleIpc("add-presentation", (event, data) => {
    const validData = validatePresentationData(data);
    return addPresentation(validData.name, validData.price);
  });

  handleIpc("update-presentation", (event, data) => {
    if (!data.id) throw new Error("Falta el ID de la presentación.");
    const validData = validatePresentationData(data);
    return updatePresentation(validData.id, validData.name, validData.price);
  });

  handleIpc("delete-presentation", (event, id) => {
    if (!id) throw new Error("ID inválido.");
    return deletePresentation(id);
  });

  handleIpc("add-sale", (event, data) => {
    const validSale = validateSaleData(data);
    return addSale(validSale);
  });

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
    closeDB();
    const currentDbPath = app.isPackaged
      ? path.join(app.getPath("userData"), "heladeria.db")
      : path.join(__dirname, "../heladeria.db");
    try {
      fs.copyFileSync(backupFile, currentDbPath);
      connectDB();
      BrowserWindow.getAllWindows().forEach((win) => win.reload());
      return { success: true };
    } catch (error) {
      connectDB();
      throw new Error(
        "No se pudo restaurar la base de datos: " + error.message
      );
    }
  });

  // --- HANDLERS PROMOCIONES ---
  handleIpc("get-promotions", () => getPromotions());
  handleIpc("add-promotion", (event, data) => {
    // Validaciones simples
    if (!data.name) throw new Error("Nombre requerido");
    if (!data.presentation_id) throw new Error("Producto requerido");
    return addPromotion(data);
  });
  handleIpc("update-promotion", (event, data) => updatePromotion(data));
  handleIpc("delete-promotion", (event, id) => deletePromotion(id));

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
