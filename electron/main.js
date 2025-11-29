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

const APP_ID = "com.elixir.ventas";

// --- FUNCIONES DE VALIDACIÓN (En Español) ---

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

  if (Math.abs(priceBase * quantity - total) > 1) {
    throw new Error(
      "El total no coincide con el precio unitario y la cantidad."
    );
  }

  const date = new Date(data.date);
  if (isNaN(date.getTime())) {
    throw new Error("La fecha de la venta es inválida.");
  }

  return {
    ...data,
    price_base: priceBase,
    quantity: quantity,
    total: total,
  };
}

// --- WRAPPER DE MANEJO DE ERRORES IPC ---
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
    // OPTIMIZACIÓN 1: No mostrar hasta que esté listo
    show: false,
    // OPTIMIZACIÓN 2: Color de fondo igual al de la app (Slate-50 de Tailwind)
    // Esto evita destellos blancos si hay un micro-lag
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

  // OPTIMIZACIÓN 3: Evento "ready-to-show"
  // Electron emite esto cuando el HTML y CSS iniciales ya se pintaron en memoria.
  // Al mostrar la ventana aquí, el usuario ve la app instantáneamente cargada.
  win.once("ready-to-show", () => {
    win.show();
    // Opcional: Si quieres que se abra maximizada en pantallas pequeñas
    // win.maximize();
  });
}

app.whenReady().then(() => {
  app.setAppUserModelId(APP_ID);

  try {
    initDB();
  } catch (e) {
    console.error("CRITICAL: Fallo al iniciar la base de datos", e);
  }

  // --- DEFINICIÓN DE HANDLERS ---

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
    if (!data.id)
      throw new Error("Falta el ID de la presentación para actualizar.");
    const validData = validatePresentationData(data);
    return updatePresentation(validData.id, validData.name, validData.price);
  });

  handleIpc("delete-presentation", (event, id) => {
    if (!id) throw new Error("ID inválido para eliminar.");
    return deletePresentation(id);
  });

  handleIpc("add-sale", (event, data) => {
    const validSale = validateSaleData(data);
    return addSale(validSale);
  });

  createWindow();
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
