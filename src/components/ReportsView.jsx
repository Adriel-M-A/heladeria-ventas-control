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
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { cn } from "@/lib/utils";

export default function ReportsView() {
  const [period, setPeriod] = useState("today");
  const [activeType, setActiveType] = useState("all");

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
            customRange,
            activeType
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
  }, [period, customRange, activeType]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setCustomRange((prev) => ({ ...prev, [name]: value }));
  };

  const formatXAxis = (tick) => {
    if (!data?.details?.isDaily) {
      return `${tick}:00`;
    }
    const date = new Date(tick + "T00:00:00");
    return date.toLocaleDateString("es-AR", {
      day: "2-digit",
      month: "2-digit",
    });
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
                  ? "border-blue-500 ring-1 ring-blue-500 bg-blue-50/10"
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start h-full">
        {/* COLUMNA 1: VENTAS POR TIPO (INTERACTIVA) */}
        <Card className="overflow-hidden border-slate-200 shadow-sm bg-white h-full flex flex-col">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <PieChart className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="text-slate-900 font-bold text-sm">
                Ventas por Tipo
              </h3>
              <p className="text-slate-500 text-xs">Selecciona para filtrar</p>
            </div>
          </div>

          <div className="p-6 space-y-4 flex-1">
            {/* Opción LOCAL */}
            <div
              onClick={() => setActiveType("local")}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 group relative overflow-hidden",
                activeType === "local"
                  ? "bg-sale-local text-white border-sale-local shadow-md transform scale-[1.02]"
                  : "bg-sale-local/10 border-sale-local/20 hover:bg-sale-local/20"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shadow-sm",
                    activeType === "local" ? "bg-white" : "bg-sale-local"
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    activeType === "local" ? "text-white" : "text-slate-700"
                  )}
                >
                  Local
                </span>
              </div>
              <div className="text-right relative z-10">
                <div
                  className={cn(
                    "text-xl font-bold",
                    activeType === "local" ? "text-white" : "text-sale-local"
                  )}
                >
                  {data?.details.channels.local.count || 0}
                </div>
                <div
                  className={cn(
                    "text-xs font-medium",
                    activeType === "local" ? "text-blue-100" : "text-slate-500"
                  )}
                >
                  ${" "}
                  {data?.details.channels.local.revenue.toLocaleString(
                    "es-AR"
                  ) || 0}
                </div>
              </div>
            </div>

            {/* Opción PEDIDOSYA */}
            <div
              onClick={() => setActiveType("pedidos_ya")}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 group relative overflow-hidden",
                activeType === "pedidos_ya"
                  ? "bg-sale-delivery text-white border-sale-delivery shadow-md transform scale-[1.02]"
                  : "bg-sale-delivery/10 border-sale-delivery/20 hover:bg-sale-delivery/20"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shadow-sm",
                    activeType === "pedidos_ya"
                      ? "bg-white"
                      : "bg-sale-delivery"
                  )}
                />
                <span
                  className={cn(
                    "font-medium",
                    activeType === "pedidos_ya"
                      ? "text-white"
                      : "text-slate-700"
                  )}
                >
                  PedidosYa
                </span>
              </div>
              <div className="text-right relative z-10">
                <div
                  className={cn(
                    "text-xl font-bold",
                    activeType === "pedidos_ya"
                      ? "text-white"
                      : "text-sale-delivery"
                  )}
                >
                  {data?.details.channels.pedidosYa.count || 0}
                </div>
                <div
                  className={cn(
                    "text-xs font-medium",
                    activeType === "pedidos_ya"
                      ? "text-rose-100"
                      : "text-slate-500"
                  )}
                >
                  ${" "}
                  {data?.details.channels.pedidosYa.revenue.toLocaleString(
                    "es-AR"
                  ) || 0}
                </div>
              </div>
            </div>

            {/* Opción TOTAL GENERAL */}
            <div
              onClick={() => setActiveType("all")}
              className={cn(
                "flex items-center justify-between p-4 rounded-lg border cursor-pointer transition-all duration-200 mt-auto relative overflow-hidden",
                activeType === "all"
                  ? "bg-slate-800 text-white border-slate-900 shadow-md transform scale-[1.02]"
                  : "bg-slate-100 border-slate-200 hover:bg-slate-200"
              )}
            >
              <div className="flex items-center gap-3 relative z-10">
                <div
                  className={cn(
                    "w-3 h-3 rounded-full shadow-sm",
                    activeType === "all" ? "bg-white" : "bg-slate-600"
                  )}
                />
                <span
                  className={cn(
                    "font-bold",
                    activeType === "all" ? "text-white" : "text-slate-900"
                  )}
                >
                  Total General
                </span>
              </div>
              <div className="text-right relative z-10">
                <div
                  className={cn(
                    "text-xl font-bold",
                    activeType === "all" ? "text-white" : "text-slate-900"
                  )}
                >
                  {currentTotal.count}
                </div>
                <div
                  className={cn(
                    "text-xs font-bold",
                    activeType === "all" ? "text-slate-300" : "text-slate-600"
                  )}
                >
                  $ {currentTotal.revenue.toLocaleString("es-AR")}
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* COLUMNA 2: ANÁLISIS POR PRESENTACIÓN */}
        <Card className="overflow-hidden border-slate-200 shadow-sm bg-white h-full flex flex-col">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="text-slate-900 font-bold text-sm">Ranking</h3>
              <p className="text-slate-500 text-xs">
                {activeType === "all"
                  ? "Todos los canales"
                  : activeType === "local"
                  ? "Solo Local"
                  : "Solo PedidosYa"}
              </p>
            </div>
          </div>

          <div className="p-0 flex-1 overflow-auto max-h-[400px]">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-white border-b border-slate-100 sticky top-0 z-10">
                <tr>
                  <th className="px-4 py-3 font-medium">Nombre</th>
                  <th className="px-4 py-3 font-medium text-center">Unid.</th>
                  <th className="px-4 py-3 font-medium text-right">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {data?.details.presentations.length > 0 ? (
                  data.details.presentations.map((item, index) => (
                    <tr
                      key={item.name}
                      className="hover:bg-slate-50/50 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 flex items-center gap-2">
                        {index === 0 && (
                          <Star className="w-3 h-3 text-amber-500 fill-current shrink-0" />
                        )}
                        <span
                          className="truncate max-w-[100px]"
                          title={item.name}
                        >
                          {item.name}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center text-slate-600">
                        {item.units}
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-slate-900">
                        ${item.revenue.toLocaleString("es-AR")}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td
                      colSpan={3}
                      className="px-4 py-8 text-center text-slate-400"
                    >
                      Sin datos para este filtro.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </Card>

        {/* COLUMNA 3: TENDENCIA DE VENTAS */}
        <Card className="border-slate-200 shadow-sm bg-white h-full flex flex-col p-0 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <div>
              <h3 className="text-slate-900 font-bold text-sm">Tendencia</h3>
              <p className="text-slate-500 text-xs">
                Ingresos ({data?.details?.isDaily ? "día" : "hora"})
              </p>
            </div>
          </div>

          <div className="p-4 flex-1 min-h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data?.details?.trend || []}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#e2e8f0"
                />
                <XAxis
                  dataKey="label"
                  tickFormatter={formatXAxis}
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  dy={10}
                  interval="preserveStartEnd"
                />
                <YAxis
                  stroke="#64748b"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  tickFormatter={(value) => `$${value}`}
                  width={60}
                />
                <Tooltip
                  cursor={{ fill: "#f1f5f9" }}
                  contentStyle={{
                    borderRadius: "8px",
                    border: "none",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    fontSize: "12px",
                  }}
                  formatter={(value) => [
                    `$ ${value.toLocaleString("es-AR")}`,
                    "Ingresos",
                  ]}
                  labelFormatter={(label) =>
                    data?.details?.isDaily
                      ? new Date(label + "T00:00:00").toLocaleDateString()
                      : `${label}:00 Hs`
                  }
                />
                <Bar
                  dataKey="total"
                  fill={
                    activeType === "pedidos_ya"
                      ? "var(--color-sale-delivery)"
                      : activeType === "local"
                      ? "var(--color-sale-local)"
                      : "#1e293b"
                  }
                  radius={[4, 4, 0, 0]}
                  barSize={30}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>
    </div>
  );
}
