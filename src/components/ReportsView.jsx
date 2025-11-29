import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  PieChart,
  Clock,
  CalendarRange,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";

export default function ReportsView() {
  const [period, setPeriod] = useState("today");
  const [customRange, setCustomRange] = useState({
    from: new Date().toISOString().split("T")[0],
    to: new Date().toISOString().split("T")[0],
  });

  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadReports = async () => {
      setLoading(true);
      try {
        if (window.electronAPI) {
          const reportData = await window.electronAPI.getReports(
            period,
            customRange
          );
          setData(reportData);
        }
      } catch (error) {
        console.error("Error cargando reportes", error);
      } finally {
        setLoading(false);
      }
    };
    loadReports();
  }, [period, customRange]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setCustomRange((prev) => ({ ...prev, [name]: value }));
  };

  if (!data && !loading) return <div>No hay datos disponibles.</div>;

  const cardConfig = [
    { id: "yesterday", label: "Ayer", icon: <Clock className="w-4 h-4" /> },
    { id: "today", label: "Hoy", icon: <BarChart3 className="w-4 h-4" /> },
    {
      id: "week",
      label: "Esta Semana",
      icon: <Calendar className="w-4 h-4" />,
    },
    { id: "month", label: "Este Mes", icon: <Layers className="w-4 h-4" /> },
    {
      id: "custom",
      label: "Rango",
      icon: <CalendarRange className="w-4 h-4" />,
    },
  ];

  const currentTotal = data?.cards[period] || { count: 0, revenue: 0 };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      {/* HEADER & DATE PICKER */}
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Reportes y Estadísticas
          </h2>
          <p className="text-slate-500">
            Análisis de ventas por período y presentación
          </p>
        </div>

        {period === "custom" && (
          <div className="flex items-end gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm animate-in slide-in-from-right-5 fade-in">
            <div>
              <Label className="text-xs text-slate-500 ml-1">Desde</Label>
              <Input
                type="date"
                name="from"
                value={customRange.from}
                onChange={handleDateChange}
                className="h-8 w-36 text-sm"
              />
            </div>
            <div>
              <Label className="text-xs text-slate-500 ml-1">Hasta</Label>
              <Input
                type="date"
                name="to"
                value={customRange.to}
                onChange={handleDateChange}
                className="h-8 w-36 text-sm"
              />
            </div>
          </div>
        )}
      </div>

      {/* FILTROS / TARJETAS SUPERIORES */}
      {/* CORRECCIÓN DE RESPONSIVIDAD: 
          - Móvil: 2 columnas
          - Tablet/Laptop (md): 3 columnas (evita el aplastamiento)
          - Pantalla Grande (xl): 5 columnas
      */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
        {cardConfig.map((card) => {
          const stats = data?.cards[card.id] || { count: 0, revenue: 0 };
          const isSelected = period === card.id;

          return (
            <div
              key={card.id}
              onClick={() => setPeriod(card.id)}
              className={cn(
                "bg-white p-6 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm hover:shadow-md",
                isSelected
                  ? "border-blue-600 ring-1 ring-blue-600 bg-blue-50/10"
                  : "border-slate-200 hover:border-blue-300"
              )}
            >
              <div className="flex items-center gap-2 text-slate-500 mb-2">
                {card.icon}
                <span className="text-sm font-medium whitespace-nowrap">
                  {card.label}
                </span>
              </div>
              <div className="text-3xl font-bold text-slate-900">
                {stats.count}
              </div>
              <div className="text-sm font-medium text-slate-500 mt-1 truncate">
                $ {stats.revenue.toLocaleString("es-AR")}
              </div>
            </div>
          );
        })}
      </div>

      {/* SECCIÓN INFERIOR - DOS COLUMNAS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* COLUMNA IZQUIERDA: VENTAS POR TIPO */}
        <Card className="overflow-hidden border-slate-200 shadow-sm bg-white h-full">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <PieChart className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="text-slate-900 font-bold text-sm">
                Ventas por Tipo
              </h3>
              <p className="text-slate-500 text-xs">
                Distribución de ventas (
                {cardConfig.find((c) => c.id === period)?.label})
              </p>
            </div>
          </div>

          <div className="p-6 space-y-4">
            {/* Local */}
            <div className="flex items-center justify-between p-4 bg-blue-50/50 rounded-lg border border-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="font-medium text-slate-700">Local</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-blue-700">
                  {data?.details.channels.local.count || 0}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  ${" "}
                  {data?.details.channels.local.revenue.toLocaleString(
                    "es-AR"
                  ) || 0}
                </div>
              </div>
            </div>

            {/* PedidosYa */}
            <div className="flex items-center justify-between p-4 bg-rose-50/50 rounded-lg border border-rose-100">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500 shadow-sm" />
                <span className="font-medium text-slate-700">PedidosYa</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-rose-700">
                  {data?.details.channels.pedidosYa.count || 0}
                </div>
                <div className="text-xs font-medium text-slate-500">
                  ${" "}
                  {data?.details.channels.pedidosYa.revenue.toLocaleString(
                    "es-AR"
                  ) || 0}
                </div>
              </div>
            </div>

            {/* Total General */}
            <div className="flex items-center justify-between p-4 bg-slate-100 rounded-lg border border-slate-200 mt-2">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-slate-600 shadow-sm" />
                <span className="font-bold text-slate-900">Total General</span>
              </div>
              <div className="text-right">
                <div className="text-xl font-bold text-slate-900">
                  {currentTotal.count}
                </div>
                <div className="text-xs font-bold text-slate-600">
                  $ {currentTotal.revenue.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* COLUMNA DERECHA: ANÁLISIS POR PRESENTACIÓN */}
        <Card className="overflow-hidden border-slate-200 shadow-sm bg-white h-full">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="text-slate-900 font-bold text-sm">
                Análisis por Presentación
              </h3>
              <p className="text-slate-500 text-xs">
                Rendimiento ({cardConfig.find((c) => c.id === period)?.label})
              </p>
            </div>
          </div>

          <div className="p-0">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3 font-medium">Presentación</th>
                  <th className="px-6 py-3 font-medium text-center">
                    Unidades
                  </th>
                  <th className="px-6 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.details.presentations.length > 0 ? (
                  data.details.presentations.map((item, index) => (
                    <tr
                      key={item.name}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-6 py-4 font-medium text-slate-700 flex items-center gap-2">
                        {/* NOMBRE */}
                        {item.name}

                        {/* ESTRELLA (SOLO SI ES TOP 1) */}
                        {index === 0 && (
                          <Star className="w-4 h-4 text-amber-500 fill-current animate-in zoom-in spin-in-12 duration-500" />
                        )}
                      </td>
                      <td className="px-6 py-4 text-center text-slate-600">
                        {item.units}
                      </td>
                      <td className="px-6 py-4 text-right font-bold text-slate-900">
                        $ {item.revenue.toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-6 py-8 text-center text-slate-400"
                    >
                      No hay datos para este período.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </div>
  );
}
