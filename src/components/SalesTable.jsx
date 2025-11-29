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
import { cn } from "@/lib/utils";

export default function SalesTable({ type = "local" }) {
  const [sales, setSales] = useState([]);
  const isPedidosYa = type === "pedidos_ya";

  useEffect(() => {
    if (!window.electronAPI) return;
    const fetchSales = async () => {
      try {
        const data = await window.electronAPI.getSales(type);
        setSales(data);
      } catch (error) {
        console.error("Error al cargar ventas:", error);
      }
    };
    fetchSales();
  }, [type]);

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
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
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

      <div className="p-0">
        <Table>
          <TableHeader>
            <TableRow
              className={cn("border-b transition-colors", theme.tableHeaderRow)}
            >
              <TableHead
                className={cn("w-[200px] font-semibold", theme.headerText)}
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
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-24 text-center text-slate-500"
                >
                  No hay ventas registradas.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
