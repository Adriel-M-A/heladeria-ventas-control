import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart3,
  TrendingUp,
  Calendar,
  Layers,
  Wallet,
  Clock,
  CalendarRange,
  Star,
  Maximize2,
  Minimize2,
  ArrowRight,
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
import { cn, getToday } from "@/lib/utils";
import SalesTable from "./SalesTable";

export default function ReportsView() {
  const [period, setPeriod] = useState("today");
  const [activeType, setActiveType] = useState("all");
  const [isExpanded, setIsExpanded] = useState(false);

  const [customRange, setCustomRange] = useState({
    from: getToday(),
    to: getToday(),
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
            activeType,
            isExpanded
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
  }, [period, customRange, activeType, isExpanded]);

  const handleDateChange = (e) => {
    const { name, value } = e.target;
    setCustomRange((prev) => ({ ...prev, [name]: value }));
  };

  const formatXAxis = (tick) => {
    if (!tick) return "";
    if (tick.length > 10 && tick.includes(" ")) {
      const [datePart, hourPart] = tick.split(" ");
      const date = new Date(datePart + "T00:00:00");
      const dayName = date.toLocaleDateString("es-AR", { weekday: "short" });
      return `${dayName} ${hourPart}:00`;
    }
    if (data?.details?.isMonthly) {
      const [year, month] = tick.split("-");
      return `${month}/${year}`;
    }
    if (data?.details?.isDaily) {
      const date = new Date(tick + "T00:00:00");
      return date.toLocaleDateString("es-AR", {
        day: "2-digit",
        month: "2-digit",
      });
    }
    return `${tick}:00`;
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

  const totalPaymentRevenue =
    (data?.details?.payments?.efectivo?.revenue || 0) +
    (data?.details?.payments?.mercado_pago?.revenue || 0);

  return (
    <div className="space-y-6 duration-300 pb-8">
      <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Reportes y Estadísticas
          </h2>
          <p className="text-slate-500">
            Análisis de rendimiento financiero y operativo
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 items-end sm:items-center">
          <Tabs
            value={activeType}
            onValueChange={setActiveType}
            className="w-full sm:w-auto"
          >
            <TabsList className="grid w-full grid-cols-3 h-9 bg-slate-100 p-1 gap-1">
              <TabsTrigger
                value="all"
                className="text-xs data-[state=active]:bg-slate-800 data-[state=active]:text-white transition-all"
              >
                Todos
              </TabsTrigger>
              <TabsTrigger
                value="local"
                className="text-xs data-[state=active]:bg-sale-local data-[state=active]:text-white transition-all"
              >
                Local
              </TabsTrigger>
              <TabsTrigger
                value="pedidos_ya"
                className="text-xs data-[state=active]:bg-sale-delivery data-[state=active]:text-white transition-all"
              >
                PedidosYa
              </TabsTrigger>
            </TabsList>
          </Tabs>

          {period === "custom" && (
            <div className="flex items-center gap-2 bg-white p-2 rounded-lg border border-slate-200 shadow-sm animate-in fade-in slide-in-from-right-4">
              <div className="relative group">
                <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  Desde
                </span>
                <Input
                  type="date"
                  name="from"
                  value={customRange.from}
                  onChange={handleDateChange}
                  className="h-9 w-36 text-xs border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>

              <ArrowRight className="w-4 h-4 text-slate-300 shrink-0" />

              <div className="relative group">
                <span className="absolute -top-2 left-2 bg-white px-1 text-[10px] font-semibold text-slate-400 group-hover:text-blue-600 transition-colors">
                  Hasta
                </span>
                <Input
                  type="date"
                  name="to"
                  value={customRange.to}
                  onChange={handleDateChange}
                  className="h-9 w-36 text-xs border-slate-200 focus:border-blue-500 focus:ring-blue-500/20 transition-all"
                />
              </div>
            </div>
          )}
        </div>
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
                "p-5 rounded-xl border cursor-pointer transition-all duration-200 shadow-sm relative overflow-hidden flex flex-col justify-between h-32 group bg-white",
                isSelected
                  ? "border-slate-300 ring-1 ring-slate-100 shadow-md"
                  : "border-slate-200 hover:border-slate-300 hover:shadow-md"
              )}
            >
              <div>
                <div className="flex items-center gap-2 text-slate-500 mb-1">
                  {card.icon}
                  <span className="text-xs font-bold uppercase tracking-wider">
                    {card.label}
                  </span>
                </div>
                <div className="text-3xl font-bold text-slate-900 leading-none">
                  {stats.count}
                </div>
              </div>

              <div className="text-right">
                <div className="text-xl font-bold text-slate-600 truncate">
                  $ {stats.revenue.toLocaleString("es-AR")}
                </div>
              </div>

              {isSelected && (
                <div
                  className={cn(
                    "absolute bottom-0 left-0 h-1.5 w-full",
                    activeType === "local"
                      ? "bg-sale-local"
                      : activeType === "pedidos_ya"
                      ? "bg-sale-delivery"
                      : "bg-slate-800"
                  )}
                />
              )}
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start transition-all duration-300">
        <Card className="overflow-hidden border-slate-200 shadow-sm bg-white h-full flex flex-col">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
            <Wallet className="w-4 h-4 text-slate-500" />
            <div>
              <h3 className="text-slate-900 font-bold text-sm">
                Métodos de Pago
              </h3>
              <p className="text-slate-500 text-xs">Desglose de ingresos</p>
            </div>
          </div>

          <div className="p-6 space-y-4 flex-1">
            <div className="flex items-center justify-between p-4 rounded-lg border border-emerald-100 bg-emerald-50/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 shadow-sm" />
                <span className="font-medium text-slate-700">Efectivo</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-emerald-700">
                  {data?.details.payments.efectivo.count || 0}
                </div>
                <div className="text-xs font-medium text-emerald-600/80">
                  ${" "}
                  {data?.details.payments.efectivo.revenue.toLocaleString(
                    "es-AR"
                  ) || 0}
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 rounded-lg border border-blue-100 bg-blue-50/50">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-blue-500 shadow-sm" />
                <span className="font-medium text-slate-700">Mercado Pago</span>
              </div>
              <div className="text-right">
                <div className="text-lg font-bold text-blue-700">
                  {data?.details.payments.mercado_pago.count || 0}
                </div>
                <div className="text-xs font-medium text-blue-600/80">
                  ${" "}
                  {data?.details.payments.mercado_pago.revenue.toLocaleString(
                    "es-AR"
                  ) || 0}
                </div>
              </div>
            </div>

            {totalPaymentRevenue > 0 && (
              <div className="mt-4">
                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden flex">
                  <div
                    className="h-full bg-emerald-500 transition-all duration-500"
                    style={{
                      width: `${
                        (data.details.payments.efectivo.revenue /
                          totalPaymentRevenue) *
                        100
                      }%`,
                    }}
                  />
                  <div
                    className="h-full bg-blue-500 transition-all duration-500"
                    style={{
                      width: `${
                        (data.details.payments.mercado_pago.revenue /
                          totalPaymentRevenue) *
                        100
                      }%`,
                    }}
                  />
                </div>
                <div className="flex justify-between mt-1 text-[10px] text-slate-400 font-medium uppercase">
                  <span>Efectivo</span>
                  <span>Mercado Pago</span>
                </div>
              </div>
            )}
          </div>
        </Card>

        {!isExpanded && (
          <Card className="overflow-hidden border-slate-200 shadow-sm bg-white h-full flex flex-col animate-in fade-in zoom-in-95 duration-300">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center gap-2 shrink-0">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <div>
                <h3 className="text-slate-900 font-bold text-sm">Ranking</h3>
                <p className="text-slate-500 text-xs">Productos más vendidos</p>
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
        )}

        <Card
          className={cn(
            "border-slate-200 shadow-sm bg-white h-full flex flex-col p-0 overflow-hidden transition-all duration-300",
            isExpanded ? "lg:col-span-2" : "lg:col-span-1"
          )}
        >
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-blue-600" />
              <div>
                <h3 className="text-slate-900 font-bold text-sm">Tendencia</h3>
                <p className="text-slate-500 text-xs">
                  Ingresos (
                  {data?.details?.isHourly
                    ? "por hora"
                    : data?.details?.isMonthly
                    ? "mensual"
                    : "diario"}
                  )
                </p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-slate-400 hover:text-slate-700 hover:bg-white"
              onClick={() => setIsExpanded(!isExpanded)}
              title={isExpanded ? "Reducir vista" : "Expandir gráfico"}
            >
              {isExpanded ? (
                <Minimize2 className="w-4 h-4" />
              ) : (
                <Maximize2 className="w-4 h-4" />
              )}
            </Button>
          </div>

          <div className="relative w-full h-[300px] p-4">
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
                  labelFormatter={(label) => {
                    if (label.length > 10 && label.includes(" ")) {
                      const [datePart, hourPart] = label.split(" ");
                      const date = new Date(datePart + "T00:00:00");
                      return `${date.toLocaleDateString()} ${hourPart}:00`;
                    }
                    if (data?.details?.isMonthly) {
                      const date = new Date(label + "-02T00:00:00");
                      return date.toLocaleDateString("es-AR", {
                        month: "long",
                        year: "numeric",
                      });
                    }
                    if (data?.details?.isDaily) {
                      return new Date(label + "T00:00:00").toLocaleDateString();
                    }
                    return `${label}:00 Hs`;
                  }}
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

      <div className="h-[400px]">
        <SalesTable
          type={activeType}
          period={period}
          customRange={customRange}
        />
      </div>
    </div>
  );
}
