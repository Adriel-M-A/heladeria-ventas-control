import { useState } from "react";
import Layout from "@/components/Layout";
import RegisterSaleForm from "@/components/RegisterSaleForm";
import SalesTable from "@/components/SalesTable";
import DataManagement from "@/components/DataManagement";
import { CreditCard, DollarSign, TrendingUp, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

function App() {
  // Estado para controlar la vista actual: 'ventas' o 'datos'
  const [currentView, setCurrentView] = useState("ventas");

  // Estado para la pestaña de ventas
  const [activeSaleTab, setActiveSaleTab] = useState("local");

  return (
    <Layout currentView={currentView} onNavigate={setCurrentView}>
      {/* VISTA 1: VENTAS */}
      {currentView === "ventas" && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tight text-slate-900">
                Registrar Ventas
              </h2>
              <p className="text-slate-500">
                Complete el formulario para registrar una nueva venta
              </p>
            </div>
          </div>

          <div className="grid gap-6">
            <RegisterSaleForm />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-blue-600 font-medium text-sm">
                    Ventas Local
                  </span>
                  <CreditCard className="w-4 h-4 text-blue-500 opacity-70" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">3</span>
                  <div className="text-xs text-blue-600 font-medium mt-1 flex justify-between">
                    <span>Total</span>
                    <span>$ 61.600</span>
                  </div>
                </div>
              </div>

              <div className="bg-rose-50 border border-rose-100 rounded-xl p-6 flex flex-col justify-between h-32">
                <div className="flex justify-between items-start">
                  <span className="text-rose-600 font-medium text-sm">
                    Ventas PedidosYa
                  </span>
                  <TrendingUp className="w-4 h-4 text-rose-500 opacity-70" />
                </div>
                <div>
                  <span className="text-2xl font-bold text-slate-900">1</span>
                  <div className="text-xs text-rose-600 font-medium mt-1 flex justify-between">
                    <span>Total</span>
                    <span>$ 3.000</span>
                  </div>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between h-32 text-white">
                <div className="flex justify-between items-start">
                  <span className="text-slate-300 font-medium text-sm">
                    Total General
                  </span>
                  <DollarSign className="w-4 h-4 text-slate-400" />
                </div>
                <div>
                  <span className="text-2xl font-bold">4</span>
                  <div className="text-xs text-slate-300 font-medium mt-1 flex justify-between">
                    <span>Ingresos</span>
                    <span>$ 64.600</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit mx-auto">
              <button
                onClick={() => setActiveSaleTab("local")}
                className={cn(
                  "w-40 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  activeSaleTab === "local"
                    ? "bg-blue-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Ventas Local
              </button>
              <button
                onClick={() => setActiveSaleTab("pedidos_ya")}
                className={cn(
                  "w-40 px-4 py-1.5 text-sm font-medium rounded-md transition-all duration-200",
                  activeSaleTab === "pedidos_ya"
                    ? "bg-rose-600 text-white shadow-sm"
                    : "text-slate-600 hover:text-slate-900 hover:bg-slate-200/50"
                )}
              >
                Ventas PedidosYa
              </button>
            </div>

            <SalesTable type={activeSaleTab} />
          </div>
        </div>
      )}

      {/* VISTA 2: GESTIÓN DE DATOS */}
      {currentView === "datos" && (
        <div className="animate-in fade-in zoom-in-95 duration-300">
          <DataManagement />
        </div>
      )}

      {/* VISTA 3: REPORTES */}
      {currentView === "reportes" && (
        <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 animate-in fade-in zoom-in-95 duration-300">
          <div className="bg-slate-100 p-4 rounded-full mb-4">
            <FileText className="w-8 h-8 text-slate-300" />
          </div>
          <p className="text-lg font-medium text-slate-600">
            Sección de Reportes
          </p>
          <p className="text-sm text-slate-400">Próximamente disponible...</p>
        </div>
      )}
    </Layout>
  );
}

export default App;
