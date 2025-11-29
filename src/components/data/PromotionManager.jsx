import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, Calendar, XCircle } from "lucide-react";
import { formatError, cn } from "@/lib/utils";
import { usePromotions } from "@/hooks/usePromotions";
import { useProducts } from "@/hooks/useProducts";

export default function PromotionManager() {
  const {
    promotions,
    fetchPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotions();
  const { presentations, fetchPresentations } = useProducts();

  const [promoForm, setPromoForm] = useState({
    name: "",
    presentation_id: "",
    min_quantity: "1",
    discount_type: "fixed_price",
    discount_value: "",
    active_days: [],
    start_date: "",
    end_date: "",
    is_active: "1",
  });
  const [editingPromoId, setEditingPromoId] = useState(null);

  useEffect(() => {
    fetchPromotions();
    fetchPresentations();
  }, [fetchPromotions, fetchPresentations]);

  const hasDates = !!promoForm.start_date || !!promoForm.end_date;
  const hasDays = promoForm.active_days.length > 0;

  const toggleDay = (dayIndex) => {
    if (hasDates) return;
    setPromoForm((prev) => {
      const days = prev.active_days.includes(dayIndex)
        ? prev.active_days.filter((d) => d !== dayIndex)
        : [...prev.active_days, dayIndex];
      return { ...prev, active_days: days };
    });
  };

  const handleDateChange = (field, value) => {
    if (hasDays && value !== "") return;
    setPromoForm((prev) => ({ ...prev, [field]: value }));
  };

  const clearDates = () =>
    setPromoForm((prev) => ({ ...prev, start_date: "", end_date: "" }));
  const clearDays = () =>
    setPromoForm((prev) => ({ ...prev, active_days: [] }));

  const handleSubmit = async () => {
    if (
      !promoForm.name ||
      !promoForm.presentation_id ||
      !promoForm.discount_value
    ) {
      return toast.warning("Complete los campos obligatorios");
    }
    const payload = {
      ...promoForm,
      min_quantity: Number(promoForm.min_quantity),
      discount_value: Number(promoForm.discount_value),
      active_days: promoForm.active_days.join(","),
      start_date: promoForm.start_date || null,
      end_date: promoForm.end_date || null,
      is_active: Number(promoForm.is_active),
    };

    let success = false;
    if (editingPromoId) {
      success = await updatePromotion({ id: editingPromoId, ...payload });
    } else {
      success = await addPromotion(payload);
    }

    if (success) {
      resetPromoForm();
    }
  };

  const resetPromoForm = () => {
    setPromoForm({
      name: "",
      presentation_id: "",
      min_quantity: "1",
      discount_type: "fixed_price",
      discount_value: "",
      active_days: [],
      start_date: "",
      end_date: "",
      is_active: "1",
    });
    setEditingPromoId(null);
  };

  const editPromo = (p) => {
    setEditingPromoId(p.id);
    setPromoForm({
      name: p.name,
      presentation_id: p.presentation_id.toString(),
      min_quantity: p.min_quantity.toString(),
      discount_type: p.discount_type,
      discount_value: p.discount_value.toString(),
      active_days: p.active_days ? p.active_days.split(",").map(Number) : [],
      start_date: p.start_date || "",
      end_date: p.end_date || "",
      is_active: p.is_active.toString(),
    });
  };

  // --- SOLUCIÓN DEL BUG DE FOCO ---
  // Reemplazamos window.confirm por un toast interactivo que no bloquea la ventana
  const handleDelete = (id) => {
    toast("¿Estás seguro de eliminar esta promoción?", {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          // Lógica de eliminación dentro del callback del botón "Eliminar"
          const success = await deletePromotion(id);
          if (success && editingPromoId === id) {
            resetPromoForm();
          }
        },
      },
      cancel: {
        label: "Cancelar",
      },
      duration: 5000, // Damos tiempo para decidir
    });
  };

  const daysMap = ["D", "L", "M", "M", "J", "V", "S"];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-white border-slate-200 shadow-sm sticky top-6">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingPromoId ? "Editar Promoción" : "Nueva Promoción"}
            </h3>
            <p className="text-sm text-slate-500">
              Reglas de descuento automáticas
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la Promo</Label>
              <Input
                value={promoForm.name}
                onChange={(e) =>
                  setPromoForm({ ...promoForm, name: e.target.value })
                }
                placeholder="Ej: Martes 2x$4500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Producto</Label>
                <Select
                  value={promoForm.presentation_id}
                  onValueChange={(v) =>
                    setPromoForm({ ...promoForm, presentation_id: v })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue placeholder="Elegir..." />
                  </SelectTrigger>
                  <SelectContent>
                    {presentations.map((p) => (
                      <SelectItem key={p.id} value={p.id.toString()}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Cant. Combo</Label>
                <Input
                  type="number"
                  value={promoForm.min_quantity}
                  onChange={(e) =>
                    setPromoForm({ ...promoForm, min_quantity: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo Descuento</Label>
                <Select
                  value={promoForm.discount_type}
                  onValueChange={(v) =>
                    setPromoForm({ ...promoForm, discount_type: v })
                  }
                >
                  <SelectTrigger className="bg-white border-slate-200">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fixed_price">
                      $ Precio del Combo
                    </SelectItem>
                    <SelectItem value="percentage">% Off por Combo</SelectItem>
                    <SelectItem value="amount_off">
                      $ Desc. por Combo
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Valor</Label>
                <Input
                  type="number"
                  value={promoForm.discount_value}
                  onChange={(e) =>
                    setPromoForm({
                      ...promoForm,
                      discount_value: e.target.value,
                    })
                  }
                  placeholder="Ej: 4500"
                />
              </div>
            </div>

            {/* SELECCIÓN DE REGLA DE TIEMPO */}
            <div className="space-y-4 border-t border-slate-100 pt-4 mt-2">
              <Label className="text-xs text-slate-500 font-bold uppercase tracking-wide">
                Validez (Elige una opción)
              </Label>

              {/* OPCIÓN 1: RANGO DE FECHAS */}
              <div
                className={cn(
                  "space-y-2 transition-opacity",
                  hasDays ? "opacity-40 pointer-events-none" : "opacity-100"
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold flex items-center gap-1 text-slate-700">
                    <Calendar className="w-3 h-3" /> Por Fechas
                  </Label>
                  {hasDates && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={clearDates}
                    >
                      <XCircle className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  )}
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px] text-slate-500">Desde</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs bg-white border-slate-200"
                      value={promoForm.start_date}
                      onChange={(e) =>
                        handleDateChange("start_date", e.target.value)
                      }
                    />
                  </div>
                  <div>
                    <Label className="text-[10px] text-slate-500">Hasta</Label>
                    <Input
                      type="date"
                      className="h-8 text-xs bg-white border-slate-200"
                      value={promoForm.end_date}
                      onChange={(e) =>
                        handleDateChange("end_date", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <div className="h-px bg-slate-100 flex-1"></div>
                <span className="text-[10px] text-slate-300 font-medium uppercase">
                  Ó
                </span>
                <div className="h-px bg-slate-100 flex-1"></div>
              </div>

              {/* OPCIÓN 2: DÍAS SEMANALES */}
              <div
                className={cn(
                  "space-y-2 transition-opacity",
                  hasDates ? "opacity-40 pointer-events-none" : "opacity-100"
                )}
              >
                <div className="flex justify-between items-center">
                  <Label className="text-xs font-semibold text-slate-700">
                    Por Días de Semana
                  </Label>
                  {hasDays && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5"
                      onClick={clearDays}
                    >
                      <XCircle className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  )}
                </div>
                <div className="flex gap-1 justify-between">
                  {daysMap.map((day, idx) => (
                    <button
                      key={idx}
                      onClick={() => toggleDay(idx)}
                      className={cn(
                        "w-8 h-8 rounded-full text-xs font-bold transition-all border",
                        promoForm.active_days.includes(idx)
                          ? "bg-slate-800 text-white border-slate-800 shadow-sm"
                          : "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600"
                      )}
                    >
                      {day}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Button
                onClick={handleSubmit}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                {editingPromoId ? "Guardar Cambios" : "Crear Promoción"}
              </Button>
              {editingPromoId && (
                <Button
                  variant="outline"
                  onClick={resetPromoForm}
                  className="border-slate-200 text-slate-600"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900">
              Promociones Activas
            </h3>
            <p className="text-sm text-slate-500">
              Reglas configuradas en el sistema
            </p>
          </CardHeader>
          <div className="p-0 overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-slate-50/50">
                  <TableHead>Promoción</TableHead>
                  <TableHead>Detalle</TableHead>
                  <TableHead>Validez</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {promotions.map((p) => {
                  const formatDate = (d) =>
                    new Date(d + "T00:00:00").toLocaleDateString("es-AR", {
                      day: "2-digit",
                      month: "2-digit",
                    });

                  let dateText = "";
                  if (p.start_date || p.end_date) {
                    const start = p.start_date
                      ? formatDate(p.start_date)
                      : "Inicio";
                    const end = p.end_date ? formatDate(p.end_date) : "Siempre";
                    if (
                      p.start_date &&
                      p.end_date &&
                      p.start_date === p.end_date
                    ) {
                      dateText = `Solo el ${start}`;
                    } else {
                      dateText = `${start} -> ${end}`;
                    }
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
                        <span className="font-medium text-slate-700">
                          {dateText}
                        </span>
                        <span className="text-[10px] text-slate-400">
                          {dayText}
                        </span>
                      </div>
                    );
                  }

                  let detail = "";
                  if (p.discount_type === "percentage")
                    detail = `${p.discount_value}% OFF`;
                  if (p.discount_type === "fixed_price")
                    detail = `$${p.discount_value} Combo`;
                  if (p.discount_type === "amount_off")
                    detail = `-$${p.discount_value} desc.`;

                  return (
                    <TableRow
                      key={p.id}
                      className={cn(
                        "hover:bg-slate-50/50",
                        !p.is_active && "opacity-50"
                      )}
                    >
                      <TableCell>
                        <div className="font-medium text-slate-900">
                          {p.name}
                        </div>
                        <div className="text-xs text-slate-500">
                          {p.presentation_name} (x{p.min_quantity})
                        </div>
                      </TableCell>
                      <TableCell>
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 border border-blue-100">
                          {detail}
                        </span>
                      </TableCell>
                      <TableCell className="text-xs text-slate-500">
                        {timingDisplay}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                            onClick={() => editPromo(p)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(p.id)}
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
                      colSpan={4}
                      className="h-24 text-center text-slate-500"
                    >
                      Sin promociones activas.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
