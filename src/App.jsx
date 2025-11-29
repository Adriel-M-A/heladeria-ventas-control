import { useState } from "react";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
// Importamos las Vistas
import SalesView from "@/components/SalesView";
import DataManagement from "@/components/DataManagement";
import ReportsView from "@/components/ReportsView";

function App() {
  const [currentView, setCurrentView] = useState("ventas");

  // Diccionario de vistas para renderizado limpio
  const renderView = () => {
    switch (currentView) {
      case "ventas":
        return <SalesView />;
      case "datos":
        return <DataManagement />;
      case "reportes":
        return <ReportsView />;
      default:
        return <SalesView />;
    }
  };

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {/* Componente global de notificaciones */}
      <Toaster position="top-right" richColors />

      {/* Renderizado de la vista actual */}
      {renderView()}
    </Layout>
  );
}

export default App;
