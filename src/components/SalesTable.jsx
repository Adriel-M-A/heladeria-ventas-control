import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Trash2, AlertCircle } from "lucide-react";
import { cn, formatError } from "@/lib/utils";
import { toast } from "sonner";

export default function SalesTable({
  type = "local",
  period = "today",
  customRange = null,
}) {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    setPage(1);
  }, [type, period, customRange]);

  const fetchSales = async () => {
    if (!window.electronAPI) return;
    try {
      const result = await window.electronAPI.getSales(
        type,
        page,
        pageSize,
        period,
        customRange
      );
      setSales(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al actualizar la tabla");
    }
  };

  useEffect(() => {
    fetchSales();
  }, [type, page, period, customRange]);

  const handleCancelSale = async (id) => {
    toast("¿Cancelar esta venta?", {
      description:
        "El monto se descontará de la caja y afectará las estadísticas.",
      action: {
        label: "Confirmar",
        onClick: async () => {
          try {
            await window.electronAPI.deleteSale(id);
            toast.success("Venta cancelada correctamente");
            fetchSales();
          } catch (err) {
            console.error(err);
            toast.error(formatError(err));
          }
        },
      },
      cancel: { label: "Volver" },
      duration: 6000,
    });
  };

  const formatDate = (isoString) => {
    try {
      if (!isoString) return "-";
      const date = new Date(isoString);
      if (isNaN(date.getTime())) return isoString;
      return date.toLocaleString("es-AR", {
        day: "2-digit",
        month: "2-digit",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      });
    } catch (e) {
      return isoString;
    }
  };

  let themeClass = {
    header: "bg-sale-local border-sale-local",
    text: "text-sale-local",
    rowHover: "hover:bg-sale-local/5",
    headerRow: "bg-sale-local/10 border-sale-local/20",
  };

  let title = "Historial Local";

  if (type === "pedidos_ya") {
    themeClass = {
      header: "bg-sale-delivery border-sale-delivery",
      text: "text-sale-delivery",
      rowHover: "hover:bg-sale-delivery/5",
      headerRow: "bg-sale-delivery/10 border-sale-delivery/20",
    };
    title = "Historial PedidosYa";
  } else if (type === "all") {
    themeClass = {
      header: "bg-slate-800 border-slate-800",
      text: "text-slate-700",
      rowHover: "hover:bg-slate-50",
      headerRow: "bg-slate-100 border-slate-200",
    };
    title = "Historial General de Ventas";
  }

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white flex flex-col h-full">
      <div
        className={cn(
          "px-6 py-3 border-b transition-colors duration-300",
          themeClass.header
        )}
      >
        <h3 className="text-white font-medium text-sm">{title}</h3>
      </div>

      <div className="flex-1 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow
              className={cn("border-b transition-colors", themeClass.headerRow)}
            >
              <TableHead
                className={cn("w-[150px] font-semibold", themeClass.text)}
              >
                Fecha
              </TableHead>
              <TableHead className={cn("font-semibold", themeClass.text)}>
                Producto
              </TableHead>
              {type === "all" && (
                <TableHead className={cn("font-semibold", themeClass.text)}>
                  Canal
                </TableHead>
              )}
              <TableHead className={cn("font-semibold", themeClass.text)}>
                Pago
              </TableHead>
              <TableHead className={cn("font-semibold", themeClass.text)}>
                P. Unit
              </TableHead>
              <TableHead className={cn("font-semibold", themeClass.text)}>
                Cant.
              </TableHead>
              <TableHead
                className={cn("text-right font-semibold", themeClass.text)}
              >
                Total
              </TableHead>
              <TableHead
                className={cn(
                  "text-right font-semibold w-[60px]",
                  themeClass.text
                )}
              >
                Acción
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sales.length > 0 ? (
              sales.map((sale) => (
                <TableRow
                  key={sale.id}
                  className={cn(
                    "border-slate-100 transition-colors",
                    themeClass.rowHover
                  )}
                >
                  <TableCell className="font-medium text-slate-700">
                    {formatDate(sale.date)}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {sale.presentation_name}
                  </TableCell>
                  {type === "all" && (
                    <TableCell>
                      <span
                        className={cn(
                          "text-[10px] uppercase font-bold px-2 py-0.5 rounded border",
                          sale.type === "local"
                            ? "bg-sale-local/10 text-sale-local border-sale-local/20"
                            : "bg-sale-delivery/10 text-sale-delivery border-sale-delivery/20"
                        )}
                      >
                        {sale.type === "local" ? "Local" : "App"}
                      </span>
                    </TableCell>
                  )}
                  <TableCell>
                    <span
                      className={cn(
                        "text-[10px] font-bold px-2 py-0.5 rounded border",
                        sale.payment_method === "mercado_pago"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-emerald-50 text-emerald-700 border-emerald-200"
                      )}
                    >
                      {sale.payment_method === "mercado_pago"
                        ? "Mercado Pago"
                        : "Efectivo"}
                    </span>
                  </TableCell>
                  <TableCell className="text-slate-700">
                    $ {sale.price_base.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {sale.quantity}
                  </TableCell>
                  <TableCell className={cn("text-right font-bold")}>
                    $ {sale.total.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-400 hover:text-red-600 hover:bg-red-50"
                      title="Cancelar Venta"
                      onClick={() => handleCancelSale(sale.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={type === "all" ? 8 : 7}
                  className="h-24 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                    <p>No se encontraron ventas en este período.</p>
                  </div>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between px-4 py-4 border-t border-slate-100 bg-slate-50/50">
        <div className="text-xs text-slate-500 font-medium">
          Página {page} de {totalPages || 1}
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="h-8 px-3 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900"
          >
            <ChevronLeft className="h-4 w-4 mr-1" /> Anterior
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages || totalPages === 0}
            className="h-8 px-3 text-slate-600 border-slate-200 hover:bg-white hover:text-slate-900"
          >
            Siguiente <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  );
}
