import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Card } from "@/components/ui/card";

// Datos de ejemplo para visualizar (Mock Data)
const recentSales = [
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
];

export default function SalesTable() {
  return (
    <Card className="overflow-hidden border-slate-200 shadow-sm bg-white">
      {/* Encabezado Azul */}
      <div className="bg-blue-600 px-6 py-3 border-b border-blue-700">
        <h3 className="text-white font-medium text-sm">
          Historial de Ventas Local
        </h3>
      </div>

      <div className="p-0">
        <Table>
          <TableHeader className="bg-slate-50">
            <TableRow className="border-slate-100 hover:bg-slate-50">
              <TableHead className="w-[200px] text-blue-600 font-semibold">
                Fecha Venta
              </TableHead>
              <TableHead className="text-blue-600 font-semibold">
                Presentación
              </TableHead>
              <TableHead className="text-blue-600 font-semibold">
                Precio Base
              </TableHead>
              <TableHead className="text-blue-600 font-semibold">
                Cantidad
              </TableHead>
              <TableHead className="text-right text-blue-600 font-semibold">
                Precio Total
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {recentSales.map((sale) => (
              <TableRow
                key={sale.id}
                className="border-slate-100 hover:bg-slate-50/50"
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
                <TableCell className="text-right font-bold text-blue-600">
                  $ {sale.total.toLocaleString("es-AR")}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
