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
import { Save, Calendar, XCircle } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

export default function PromotionForm({
  formData,
  setFormData,
  presentations,
  onSubmit,
  onCancel,
  isEditing,
}) {
  const daysMap = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];

  const hasDates = !!formData.start_date || !!formData.end_date;
  const hasDays = formData.active_days.length > 0;

  const toggleDay = (dayIndex) => {
    if (hasDates) return;
    setFormData((prev) => {
      const days = prev.active_days.includes(dayIndex)
        ? prev.active_days.filter((d) => d !== dayIndex)
        : [...prev.active_days, dayIndex];
      return { ...prev, active_days: days };
    });
  };

  const handleDateChange = (field, value) => {
    if (hasDays && value !== "") return;

    setFormData((prev) => {
      const newData = { ...prev, [field]: value };

      // 1. Lógica de Auto-completado
      if (field === "start_date" && value !== "" && !prev.end_date) {
        newData.end_date = value;
      }
      if (field === "end_date" && value !== "" && !prev.start_date) {
        newData.start_date = value;
      }

      // 2. Validación de Coherencia (Inicio no puede ser mayor que Fin)
      if (newData.start_date && newData.end_date) {
        if (newData.start_date > newData.end_date) {
          if (field === "start_date") {
            newData.end_date = newData.start_date;
          } else {
            newData.start_date = newData.end_date;
          }
        }
      }

      return newData;
    });
  };

  const clearDates = () =>
    setFormData((prev) => ({ ...prev, start_date: "", end_date: "" }));
  const clearDays = () => setFormData((prev) => ({ ...prev, active_days: [] }));

  const handleSubmit = () => {
    if (
      !formData.name ||
      !formData.presentation_id ||
      !formData.discount_value
    ) {
      return toast.warning(
        "Complete los campos obligatorios (Nombre, Producto, Valor)"
      );
    }
    onSubmit();
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {isEditing ? "Editar Promoción" : "Crear Nueva Promoción"}
            </h3>
            <p className="text-sm text-slate-500">
              Configura las reglas automáticas para aplicar descuentos.
            </p>
          </div>
          {/* El botón de cancelar se movió abajo */}
        </div>
      </CardHeader>

      <CardContent className="pt-6 grid gap-5">
        {/* Fila A: Datos Básicos */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-2 space-y-2">
            <Label>Nombre de la Promoción</Label>
            <Input
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder="Ej: Martes 2x$4500"
              className="border-slate-200"
            />
          </div>
          <div className="md:col-span-1 space-y-2">
            <Label>Producto</Label>
            <Select
              value={formData.presentation_id}
              onValueChange={(v) =>
                setFormData({ ...formData, presentation_id: v })
              }
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue placeholder="Seleccionar..." />
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
          <div className="md:col-span-1 space-y-2">
            <Label>Canal de Venta</Label>
            <Select
              value={formData.channel}
              onValueChange={(v) => setFormData({ ...formData, channel: v })}
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="local" className="text-blue-600 font-medium">
                  Solo Local
                </SelectItem>
                <SelectItem
                  value="pedidos_ya"
                  className="text-pink-600 font-medium"
                >
                  Solo PedidosYa
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Fila B: Reglas de Descuento */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="md:col-span-1 space-y-2">
            <Label>Mínimo (Unid.)</Label>
            <Input
              type="number"
              value={formData.min_quantity}
              min={1}
              onChange={(e) =>
                setFormData({ ...formData, min_quantity: e.target.value })
              }
            />
          </div>
          <div className="md:col-span-2 space-y-2">
            <Label>Tipo de Descuento</Label>
            <Select
              value={formData.discount_type}
              onValueChange={(v) =>
                setFormData({ ...formData, discount_type: v })
              }
            >
              <SelectTrigger className="bg-white border-slate-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fixed_price">
                  $ Precio Final del Combo
                </SelectItem>
                <SelectItem value="percentage">% Porcentaje OFF</SelectItem>
                <SelectItem value="amount_off">
                  $ Descuento por Combo
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="md:col-span-1 space-y-2">
            <Label>Valor ($ o %)</Label>
            <Input
              type="number"
              value={formData.discount_value}
              min={0}
              onChange={(e) =>
                setFormData({ ...formData, discount_value: e.target.value })
              }
              placeholder="Ej: 4500"
            />
          </div>
        </div>

        {/* Fila C: Vigencia (Fechas vs Días) */}
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto_1fr] gap-4 items-start">
          {/* Opción 1: Fechas */}
          <div
            className={cn(
              "space-y-3 transition-opacity",
              hasDays ? "opacity-40 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-1">
              <Label className="text-xs font-bold text-slate-500 uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3" /> Rango de Fechas
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
              <Input
                type="date"
                className="h-9 text-sm"
                value={formData.start_date}
                onChange={(e) => handleDateChange("start_date", e.target.value)}
              />
              <Input
                type="date"
                className="h-9 text-sm"
                value={formData.end_date}
                onChange={(e) => handleDateChange("end_date", e.target.value)}
              />
            </div>
          </div>

          {/* SEPARADOR "Ó" */}
          <div className="flex md:flex-col items-center justify-center gap-2 py-2 md:py-0 md:mt-8">
            <div className="h-px w-full md:w-px md:h-4 bg-slate-200"></div>
            <span className="text-[10px] text-slate-300 font-bold uppercase bg-white px-1">
              Ó
            </span>
            <div className="h-px w-full md:w-px md:h-4 bg-slate-200"></div>
          </div>

          {/* Opción 2: Días */}
          <div
            className={cn(
              "space-y-3 transition-opacity",
              hasDates ? "opacity-40 pointer-events-none" : "opacity-100"
            )}
          >
            <div className="flex justify-between items-center border-b border-slate-100 pb-1">
              <Label className="text-xs font-bold text-slate-500 uppercase">
                Días de la Semana
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
                    "flex-1 h-9 rounded-md text-[10px] font-bold transition-all border px-1",
                    formData.active_days.includes(idx)
                      ? "bg-slate-800 text-white border-slate-800 shadow-md"
                      : "bg-white text-slate-400 border-slate-200 hover:border-slate-400 hover:text-slate-600"
                  )}
                >
                  {day}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            onClick={handleSubmit}
            className="w-full bg-slate-900 hover:bg-slate-800 text-white h-11 text-base shadow-md"
          >
            <Save className="w-4 h-4 mr-2" />
            {isEditing ? "Guardar Cambios" : "Crear Promoción"}
          </Button>
          {isEditing && (
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-1/3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900 h-11"
            >
              Cancelar
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
