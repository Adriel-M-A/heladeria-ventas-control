const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // --- PRODUCTOS ---
  getPresentations: () => ipcRenderer.invoke("get-presentations"),
  addPresentation: (data) => ipcRenderer.invoke("add-presentation", data),
  updatePresentation: (data) => ipcRenderer.invoke("update-presentation", data),
  deletePresentation: (id) => ipcRenderer.invoke("delete-presentation", id),

  // --- VENTAS ---
  // Nota: Ahora soporta paginación (page, pageSize)
  getSales: (type, page, pageSize) =>
    ipcRenderer.invoke("get-sales", type, page, pageSize),
  addSale: (data) => ipcRenderer.invoke("add-sale", data),
  deleteSale: (id) => ipcRenderer.invoke("delete-sale", id), // Función de cancelar venta

  // --- ESTADÍSTICAS Y REPORTES ---
  getStats: () => ipcRenderer.invoke("get-stats"),
  getReports: (period, customRange, typeFilter) =>
    ipcRenderer.invoke("get-reports", period, customRange, typeFilter),

  // --- SISTEMA (Backup/Restore) ---
  backupDB: () => ipcRenderer.invoke("backup-db"),
  restoreDB: () => ipcRenderer.invoke("restore-db"),

  // --- PROMOCIONES ---
  getPromotions: () => ipcRenderer.invoke("get-promotions"),
  addPromotion: (data) => ipcRenderer.invoke("add-promotion", data),
  updatePromotion: (data) => ipcRenderer.invoke("update-promotion", data),
  deletePromotion: (id) => ipcRenderer.invoke("delete-promotion", id),
});
