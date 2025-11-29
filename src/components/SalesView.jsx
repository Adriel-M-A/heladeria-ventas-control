import { useState, useEffect } from "react";
import { toast } from "sonner";
import RegisterSaleForm from "@/components/RegisterSaleForm";
import SalesTable from "@/components/SalesTable";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { cn } from "@/lib/utils";

export default function SalesView() {
  const [activeSaleTab, setActiveSaleTab] = useState("local");

  // Estado para las estadísticas
  const [stats, setStats] = useState({
    local: { count: 0, total: 0 },
    pedidosYa: { count: 0, total: 0 },
    general: { count: 0, total: 0 },
  });

  // Estado para forzar la recarga de la tabla
  const [lastSaleTime, setLastSaleTime] = useState(Date.now());

  const fetchStats = async () => {
    if (!window.electronAPI) return;
    try {
      const data = await window.electronAPI.getStats();
      setStats(data);
    } catch (err) {
      console.error(err);
      toast.error("Error cargando estadísticas.");
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const handleSaleAdded = () => {
    fetchStats();
    setLastSaleTime(Date.now());
  };

  return (
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
        <RegisterSaleForm onSaleSuccess={handleSaleAdded} />

        {/* Tarjetas de Estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-blue-600 font-medium text-sm">
                Ventas Local
              </span>
              <CreditCard className="w-4 h-4 text-blue-500 opacity-70" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">
                {stats.local.count}
              </span>
              <div className="text-xs text-blue-600 font-medium mt-1 flex justify-between">
                <span>Total</span>
                <span>$ {stats.local.total.toLocaleString("es-AR")}</span>
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
              <span className="text-2xl font-bold text-slate-900">
                {stats.pedidosYa.count}
              </span>
              <div className="text-xs text-rose-600 font-medium mt-1 flex justify-between">
                <span>Total</span>
                <span>$ {stats.pedidosYa.total.toLocaleString("es-AR")}</span>
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
              <span className="text-2xl font-bold">{stats.general.count}</span>
              <div className="text-xs text-slate-300 font-medium mt-1 flex justify-between">
                <span>Ingresos</span>
                <span>$ {stats.general.total.toLocaleString("es-AR")}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs de la tabla */}
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

        <SalesTable type={activeSaleTab} key={lastSaleTime + activeSaleTab} />
      </div>
    </div>
  );
}
