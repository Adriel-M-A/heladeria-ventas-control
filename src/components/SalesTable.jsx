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

// Datos simulados (Mock Data) para cada tipo de venta
const SALES_DATA = {
  local: [
    {
      id: 1,
      date: "27/11/2025, 08:59 p. m.",
      presentation: "1/2 Kilo",
      basePrice: 2800,
      quantity: 10,
      total: 28000,
    },
    {
      id: 2,
      date: "27/11/2025, 08:50 p. m.",
      presentation: "1/2 Kilo",
      basePrice: 2800,
      quantity: 9,
      total: 25200,
    },
    {
      id: 3,
      date: "27/11/2025, 06:29 p. m.",
      presentation: "1/2 Kilo",
      basePrice: 2800,
      quantity: 3,
      total: 8400,
    },
  ],
  pedidos_ya: [
    {
      id: 4,
      date: "27/11/2025, 06:30 p. m.",
      presentation: "1/4 Kilo",
      basePrice: 1500,
      quantity: 2,
      total: 3000,
    },
  ],
};

export default function SalesTable({ type = "local" }) {
  const isPedidosYa = type === "pedidos_ya";
  // Seleccionamos los datos correctos según el tipo
  const data = isPedidosYa ? SALES_DATA.pedidos_ya : SALES_DATA.local;

  // Configuración de tema dinámico para la tabla
  const theme = {
    // Encabezado de la tarjeta
    headerBg: isPedidosYa
      ? "bg-rose-600 border-rose-700"
      : "bg-blue-600 border-blue-700",
    // Fila de encabezado de la tabla (dentro)
    tableHeaderRow: isPedidosYa
      ? "bg-rose-50 border-rose-100"
      : "bg-slate-50 border-slate-100",
    // Texto de las columnas del encabezado
    headerText: isPedidosYa ? "text-rose-700" : "text-blue-700",
    // Color del texto del precio total
    priceText: isPedidosYa ? "text-rose-600" : "text-blue-600",
    // Hover de las filas
    hoverRow: isPedidosYa ? "hover:bg-rose-50/40" : "hover:bg-slate-50/60",
  };

  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
      {/* Encabezado Azul/Rojo de la Tarjeta */}
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
            {data.length > 0 ? (
              data.map((sale) => (
                <TableRow
                  key={sale.id}
                  className={cn(
                    "border-slate-100 transition-colors",
                    theme.hoverRow
                  )}
                >
                  <TableCell className="font-medium text-slate-700">
                    {sale.date}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    {sale.presentation}
                  </TableCell>
                  <TableCell className="text-slate-700">
                    $ {sale.basePrice.toLocaleString("es-AR")}
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
