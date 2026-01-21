import { useState } from "react";
import { Toaster } from "sonner";
import Layout from "@/components/Layout";
import SalesView from "@/components/SalesView";
import DataManagement from "@/components/DataManagement";
import ReportsView from "@/components/ReportsView";
import SettingsView from "@/components/SettingsView";
import FlavorsView from "@/components/FlavorsView";

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
      case "sabores":
        return <FlavorsView />;
      case "configuracion":
        return <SettingsView />;
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
