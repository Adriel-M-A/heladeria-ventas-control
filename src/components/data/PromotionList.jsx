import { Card, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, Calendar, Store, Bike, Globe } from "lucide-react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function PromotionList({ promotions, onEdit, onDelete }) {
  const handleDeleteClick = (id) => {
    toast("¿Estás seguro de eliminar esta promoción?", {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: () => onDelete(id),
      },
      cancel: { label: "Cancelar" },
      duration: 5000,
    });
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
      <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
        <div>
          <h3 className="text-lg font-semibold text-slate-900">
            Promociones Activas
          </h3>
          <p className="text-sm text-slate-500">
            Listado de reglas configuradas
          </p>
        </div>
      </CardHeader>

      <div className="p-0 overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="hover:bg-slate-50/50">
              <TableHead className="w-[25%]">Promoción</TableHead>
              <TableHead className="w-[15%]">Canal de Venta</TableHead>
              <TableHead className="w-[20%]">Beneficio</TableHead>
              <TableHead className="w-[25%]">Vigencia</TableHead>
              <TableHead className="text-right w-[15%]">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {promotions.map((p) => {
              const formatDate = (d) =>
                new Date(d + "T00:00:00").toLocaleDateString("es-AR", {
                  day: "2-digit",
                  month: "2-digit",
                });

              // --- LÓGICA VIGENCIA ---
              let dateText = "";
              if (p.start_date || p.end_date) {
                const start = p.start_date
                  ? formatDate(p.start_date)
                  : "Inicio";
                const end = p.end_date ? formatDate(p.end_date) : "Siempre";
                dateText =
                  p.start_date && p.end_date && p.start_date === p.end_date
                    ? `Solo el ${start}`
                    : `${start} -> ${end}`;
              }

              const dayText = p.active_days
                ? p.active_days
                    .split(",")
                    .map((d) => daysMap[d])
                    .join(", ")
                : "Todos los días";

              let timingDisplay = dayText;
              if (dateText) {
                timingDisplay = (
                  <div className="flex flex-col">
                    <span className="font-medium text-slate-700 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-blue-500" /> {dateText}
                    </span>
                    <span className="text-[10px] text-slate-400 pl-4">
                      {dayText}
                    </span>
                  </div>
                );
              }

              // --- LÓGICA BENEFICIO ---
              let detail = "";
              if (p.discount_type === "percentage")
                detail = `${p.discount_value}% OFF`;
              if (p.discount_type === "fixed_price")
                detail = `$${p.discount_value} Combo`;
              if (p.discount_type === "amount_off")
                detail = `-$${p.discount_value} desc.`;

              // --- LÓGICA CANAL DE VENTA (BADGES) ---
              let channelBadge = null;
              if (p.channel === "local") {
                channelBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-sale-local/10 text-sale-local border border-sale-local/20 w-fit">
                    <Store className="w-3 h-3" /> Local
                  </span>
                );
              } else if (p.channel === "pedidos_ya") {
                channelBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-sale-delivery/10 text-sale-delivery border border-sale-delivery/20 w-fit">
                    <Bike className="w-3 h-3" /> PedidosYa
                  </span>
                );
              } else {
                channelBadge = (
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-xs font-medium bg-slate-100 text-slate-600 border border-slate-200 w-fit">
                    <Globe className="w-3 h-3" /> Todos
                  </span>
                );
              }

              return (
                <TableRow
                  key={p.id}
                  className={cn(
                    "hover:bg-slate-50/50 transition-colors",
                    !p.is_active && "opacity-50 grayscale"
                  )}
                >
                  {/* COLUMNA 1: PROMOCIÓN (Solo texto) */}
                  <TableCell>
                    <div className="font-bold text-slate-800">{p.name}</div>
                    <div className="text-xs text-slate-500 mt-0.5">
                      {p.presentation_name}{" "}
                      <span className="text-slate-300">|</span> Min:{" "}
                      {p.min_quantity} u.
                    </div>
                  </TableCell>

                  {/* COLUMNA 2: CANAL (Solo Badge) */}
                  <TableCell>{channelBadge}</TableCell>

                  {/* COLUMNA 3: BENEFICIO */}
                  <TableCell>
                    <span className="inline-flex items-center px-2.5 py-1 rounded-md text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-100">
                      {detail}
                    </span>
                  </TableCell>

                  {/* COLUMNA 4: VIGENCIA */}
                  <TableCell className="text-xs text-slate-600 font-medium">
                    {timingDisplay}
                  </TableCell>

                  {/* COLUMNA 5: ACCIONES */}
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                        onClick={() => onEdit(p)}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                        onClick={() => handleDeleteClick(p.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              );
            })}
            {promotions.length === 0 && (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="h-32 text-center text-slate-400"
                >
                  No hay promociones activas actualmente.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}

// CAMBIO AQUÍ: Array de días actualizado para coincidir con el formulario
const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
