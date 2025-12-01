import { useState, useEffect } from "react";
import { toast } from "sonner";
import RegisterSaleForm from "@/components/RegisterSaleForm";
import SalesTable from "@/components/SalesTable";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SalesView() {
  const [activeSaleTab, setActiveSaleTab] = useState("local");

  const [stats, setStats] = useState({
    local: { count: 0, total: 0 },
    pedidosYa: { count: 0, total: 0 },
    general: { count: 0, total: 0 },
  });

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
        <RegisterSaleForm
          onSaleSuccess={handleSaleAdded}
          onTypeChange={setActiveSaleTab}
        />

        {/* TARJETAS LIMPIAS: SIN FONDOS EN ICONOS NI MONTOS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Tarjeta Local */}
          <div className="bg-sale-local/5 border border-sale-local/20 rounded-xl p-5 flex flex-col justify-between h-40 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-sale-local font-bold text-base uppercase tracking-wide">
                Local
              </span>
              {/* Icono limpio, sin recuadro */}
              <CreditCard className="w-5 h-5 text-sale-local" />
            </div>

            <div className="mb-1">
              <span className="text-2xl font-extrabold text-slate-800">
                {stats.local.count}
              </span>
              <span className="text-sm text-slate-500 font-medium ml-2">
                ventas
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-sale-local/10 pt-3">
              <span className="text-xs text-sale-local/70 font-semibold uppercase mb-1">
                Total Caja
              </span>
              {/* Monto limpio, alineado a la derecha */}
              <span className="text-xl font-bold text-sale-local">
                $ {stats.local.total.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Tarjeta PedidosYa */}
          <div className="bg-sale-delivery/5 border border-sale-delivery/20 rounded-xl p-5 flex flex-col justify-between h-40 shadow-sm transition-all hover:shadow-md">
            <div className="flex justify-between items-start">
              <span className="text-sale-delivery font-bold text-base uppercase tracking-wide">
                PedidosYa
              </span>
              <TrendingUp className="w-5 h-5 text-sale-delivery" />
            </div>

            <div className="mb-1">
              <span className="text-2xl font-extrabold text-slate-800">
                {stats.pedidosYa.count}
              </span>
              <span className="text-sm text-slate-500 font-medium ml-2">
                ventas
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-sale-delivery/10 pt-3">
              <span className="text-xs text-sale-delivery/70 font-semibold uppercase mb-1">
                Total App
              </span>
              <span className="text-xl font-bold text-sale-delivery">
                $ {stats.pedidosYa.total.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          {/* Tarjeta General */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between h-40 shadow-md text-white transition-all hover:shadow-lg">
            <div className="flex justify-between items-start">
              <span className="text-slate-300 font-bold text-base uppercase tracking-wide">
                General
              </span>
              <DollarSign className="w-5 h-5 text-emerald-400" />
            </div>

            <div className="mb-1">
              <span className="text-2xl font-extrabold text-white">
                {stats.general.count}
              </span>
              <span className="text-sm text-slate-400 font-medium ml-2">
                operaciones
              </span>
            </div>

            <div className="flex justify-between items-end border-t border-slate-700/50 pt-3">
              <span className="text-xs text-slate-400 font-semibold uppercase mb-1">
                Ingreso Neto
              </span>
              <span className="text-xl font-bold text-emerald-400">
                $ {stats.general.total.toLocaleString("es-AR")}
              </span>
            </div>
          </div>
        </div>

        {/* 2. Componente Tabs Reutilizado como Toggle con Colores Personalizados */}
        <div className="flex justify-center mt-2">
          <Tabs
            value={activeSaleTab}
            onValueChange={setActiveSaleTab}
            className="w-auto"
          >
            <TabsList className="grid w-full grid-cols-2 h-10 bg-slate-100 p-1">
              {/* Opción LOCAL: Azul al activarse */}
              <TabsTrigger
                value="local"
                className="px-8 data-[state=active]:bg-sale-local data-[state=active]:text-white transition-all duration-200"
              >
                Ventas Local
              </TabsTrigger>

              {/* Opción PEDIDOSYA: Rosa al activarse */}
              <TabsTrigger
                value="pedidos_ya"
                className="px-8 data-[state=active]:bg-sale-delivery data-[state=active]:text-white transition-all duration-200"
              >
                Ventas PedidosYa
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* CONTENEDOR CON ALTURA FIJA PARA FORZAR EL SCROLL EN LA TABLA */}
        <div className="h-[400px] w-full">
          <SalesTable type={activeSaleTab} key={lastSaleTime + activeSaleTab} />
        </div>
      </div>
    </div>
  );
}
