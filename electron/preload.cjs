const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  // Presentaciones
  getPresentations: () => ipcRenderer.invoke("get-presentations"),
  addPresentation: (data) => ipcRenderer.invoke("add-presentation", data),
  updatePresentation: (data) => ipcRenderer.invoke("update-presentation", data),
  deletePresentation: (id) => ipcRenderer.invoke("delete-presentation", id),

  // Ventas
  getSales: (type) => ipcRenderer.invoke("get-sales", type),
  addSale: (data) => ipcRenderer.invoke("add-sale", data),
  getStats: () => ipcRenderer.invoke("get-stats"),
});
