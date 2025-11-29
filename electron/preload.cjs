const { contextBridge, ipcRenderer } = require("electron");

contextBridge.exposeInMainWorld("electronAPI", {
  getPresentations: () => ipcRenderer.invoke("get-presentations"),
  addPresentation: (data) => ipcRenderer.invoke("add-presentation", data),
  updatePresentation: (data) => ipcRenderer.invoke("update-presentation", data),
  deletePresentation: (id) => ipcRenderer.invoke("delete-presentation", id),
  getSales: (type) => ipcRenderer.invoke("get-sales", type),
  addSale: (data) => ipcRenderer.invoke("add-sale", data),
  getStats: () => ipcRenderer.invoke("get-stats"),
  getReports: (period) => ipcRenderer.invoke("get-reports", period),
});
