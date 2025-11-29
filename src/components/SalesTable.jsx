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
import { ChevronLeft, ChevronRight, Trash2, AlertCircle } from "lucide-react"; // Iconos nuevos
import { cn, formatError } from "@/lib/utils";
import { toast } from "sonner"; // Para notificar

export default function SalesTable({ type = "local" }) {
  const [sales, setSales] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const pageSize = 10;

  const isPedidosYa = type === "pedidos_ya";

  useEffect(() => {
    setPage(1);
  }, [type]);

  const fetchSales = async () => {
    if (!window.electronAPI) return;
    try {
      const result = await window.electronAPI.getSales(type, page, pageSize);
      setSales(result.data);
      setTotalPages(result.totalPages);
    } catch (error) {
      console.error("Error al cargar ventas:", error);
      toast.error("Error al actualizar la tabla");
    }
  };

  // Se ejecuta al cambiar tipo o página
  useEffect(() => {
    fetchSales();
  }, [type, page]);

  // NUEVA LÓGICA DE CANCELACIÓN
  const handleCancelSale = async (id) => {
    // Usamos confirm nativo por rapidez, aunque podríamos usar un Dialog de UI
    if (
      !window.confirm(
        "¿Estás seguro de que deseas cancelar esta venta? Esta acción descontará el dinero de la caja."
      )
    ) {
      return;
    }

    try {
      await window.electronAPI.deleteSale(id);
      toast.success("Venta cancelada correctamente");
      // Recargamos la tabla para ver los cambios
      fetchSales();
    } catch (err) {
      console.error(err);
      toast.error(formatError(err));
    }
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

  const theme = {
    headerBg: isPedidosYa
      ? "bg-sale-delivery border-sale-delivery"
      : "bg-sale-local border-sale-local",
    tableHeaderRow: isPedidosYa
      ? "bg-sale-delivery/10 border-sale-delivery/20"
      : "bg-sale-local/10 border-sale-local/20",
    headerText: isPedidosYa ? "text-sale-delivery" : "text-sale-local",
    priceText: isPedidosYa ? "text-sale-delivery" : "text-sale-local",
    hoverRow: isPedidosYa
      ? "hover:bg-sale-delivery/5"
      : "hover:bg-sale-local/5",
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white flex flex-col h-full">
      <div
        className={cn(
          "px-6 py-3 border-b transition-colors duration-300",
          theme.headerBg
        )}
      >
        <h3 className="text-white font-medium text-sm">
          Historial de Ventas {isPedidosYa ? "PedidosYa" : "Local"}
        </h3>
      </div>

      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader>
            <TableRow
              className={cn("border-b transition-colors", theme.tableHeaderRow)}
            >
              <TableHead
                className={cn("w-[180px] font-semibold", theme.headerText)}
              >
                Fecha Venta
              </TableHead>
              <TableHead className={cn("font-semibold", theme.headerText)}>
                Presentación
              </TableHead>
              <TableHead className={cn("font-semibold", theme.headerText)}>
                Precio Base
              </TableHead>
              <TableHead className={cn("font-semibold", theme.headerText)}>
                Cantidad
              </TableHead>
              <TableHead
                className={cn("text-right font-semibold", theme.headerText)}
              >
                Precio Total
              </TableHead>
              <TableHead
                className={cn(
                  "text-right font-semibold w-[80px]",
                  theme.headerText
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
                    theme.hoverRow
                  )}
                >
                  <TableCell className="font-medium text-slate-700">
                    {formatDate(sale.date)}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {sale.presentation_name}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    $ {sale.price_base.toLocaleString("es-AR")}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {sale.quantity}
                  </TableCell>
                  <TableCell
                    className={cn("text-right font-bold", theme.priceText)}
                  >
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
                  colSpan={6}
                  className="h-24 text-center text-slate-500"
                >
                  <div className="flex flex-col items-center justify-center gap-2">
                    <AlertCircle className="w-6 h-6 text-slate-300" />
                    <p>No hay ventas registradas hoy.</p>
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
