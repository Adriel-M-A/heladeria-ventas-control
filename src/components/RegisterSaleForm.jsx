import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn, formatError } from "@/lib/utils";
import { Tag } from "lucide-react";

export default function RegisterSaleForm({ onSaleSuccess, onTypeChange }) {
  const [presentations, setPresentations] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    presentationId: "",
    quantity: "1",
    type: "local",
  });

  const [calculation, setCalculation] = useState({
    total: 0,
    baseTotal: 0,
    appliedPromo: null,
  });

  useEffect(() => {
    if (!window.electronAPI) return;
    const loadData = async () => {
      try {
        const [prods, promos] = await Promise.all([
          window.electronAPI.getPresentations(),
          window.electronAPI.getPromotions(),
        ]);
        setPresentations(prods);
        setPromotions(promos);
      } catch (err) {
        console.error("Error cargando datos:", err);
        toast.error("No se pudieron cargar los productos.");
      }
    };
    loadData();
  }, []);

  useEffect(() => {
    calculateTotal();
  }, [formData, presentations, promotions]);

  const calculateTotal = () => {
    const selectedPresentation = presentations.find(
      (p) => p.id.toString() === formData.presentationId
    );
    if (!selectedPresentation) {
      setCalculation({ total: 0, baseTotal: 0, appliedPromo: null });
      return;
    }

    const price = selectedPresentation.price;
    const qty = parseInt(formData.quantity);
    const baseTotal = price * qty;

    // Obtenemos la fecha local actual en formato YYYY-MM-DD para comparar strings
    // Usamos 'en-CA' que devuelve formato ISO (YYYY-MM-DD)
    const now = new Date();
    const todayStr = now.toLocaleDateString("en-CA");
    const dayOfWeek = now.getDay(); // 0 = Domingo

    const applicablePromo = promotions.find((p) => {
      // 1. Coincide producto
      if (p.presentation_id !== selectedPresentation.id) return false;
      // 2. Está activa globalmente
      if (p.is_active !== 1) return false;
      // 3. Alcanza cantidad mínima
      if (qty < p.min_quantity) return false;

      // 4. Verificación de FECHAS (Prioridad sobre días)
      // Si tiene fecha de inicio, hoy debe ser >= inicio
      if (p.start_date && todayStr < p.start_date) return false;
      // Si tiene fecha fin, hoy debe ser <= fin
      if (p.end_date && todayStr > p.end_date) return false;

      // 5. Verificación de DÍAS DE SEMANA
      // Si el campo está vacío, se asume todos los días.
      // Si no está vacío, verificamos que el día actual esté en la lista.
      if (p.active_days && p.active_days !== "") {
        const activeDaysList = p.active_days.split(",").map(Number);
        if (!activeDaysList.includes(dayOfWeek)) return false;
      }

      return true;
    });

    let finalTotal = baseTotal;

    if (applicablePromo) {
      const packSize = applicablePromo.min_quantity;
      const numPacks = Math.floor(qty / packSize);
      const remainder = qty % packSize;

      if (applicablePromo.discount_type === "fixed_price") {
        const comboPrice = applicablePromo.discount_value;
        finalTotal = numPacks * comboPrice + remainder * price;
      } else if (applicablePromo.discount_type === "percentage") {
        const packBasePrice = packSize * price;
        const packDiscounted =
          packBasePrice * (1 - applicablePromo.discount_value / 100);
        finalTotal = numPacks * packDiscounted + remainder * price;
      } else if (applicablePromo.discount_type === "amount_off") {
        const packBasePrice = packSize * price;
        const packDiscounted = Math.max(
          0,
          packBasePrice - applicablePromo.discount_value
        );
        finalTotal = numPacks * packDiscounted + remainder * price;
      }
    }

    finalTotal = Math.max(0, finalTotal);

    setCalculation({
      total: finalTotal,
      baseTotal: baseTotal,
      appliedPromo: applicablePromo,
    });
  };

  const handleRegister = async () => {
    const selectedPresentation = presentations.find(
      (p) => p.id.toString() === formData.presentationId
    );
    if (!selectedPresentation || !window.electronAPI) return;

    if (calculation.total <= 0 && calculation.baseTotal <= 0) {
      toast.error("El precio total no puede ser 0");
      return;
    }

    const saleData = {
      type: formData.type,
      presentation_name: selectedPresentation.name,
      price_base: selectedPresentation.price,
      quantity: parseInt(formData.quantity),
      total: calculation.total,
      date: new Date().toISOString(),
    };

    try {
      await window.electronAPI.addSale(saleData);

      const isPromo = !!calculation.appliedPromo;
      toast.success(
        `Venta ${formData.type === "local" ? "Local" : "PedidosYa"} registrada`,
        {
          description: isPromo
            ? `¡Promo "${
                calculation.appliedPromo.name
              }" aplicada! Total: $${calculation.total.toLocaleString("es-AR")}`
            : `$ ${calculation.total.toLocaleString("es-AR")}`,
        }
      );

      if (onSaleSuccess) onSaleSuccess();
      setFormData((prev) => ({ ...prev, quantity: "1", presentationId: "" }));
    } catch (err) {
      console.error("Error venta:", err);
      toast.error(formatError(err));
    }
  };

  const isPedidosYa = formData.type === "pedidos_ya";
  const theme = {
    badge: isPedidosYa
      ? "bg-sale-delivery/10 text-sale-delivery border-sale-delivery/20"
      : "bg-sale-local/10 text-sale-local border-sale-local/20",
    button: isPedidosYa
      ? "bg-sale-delivery hover:bg-sale-delivery/90"
      : "bg-sale-local hover:bg-sale-local/90",
  };
  const selectItemStyles =
    "cursor-pointer focus:bg-slate-100 pl-3 pr-8 [&>span.absolute]:left-auto [&>span.absolute]:right-2";

  return (
    <Card className="bg-white border-slate-200 shadow-sm relative overflow-hidden">
      {calculation.appliedPromo && (
        <div className="absolute top-0 right-0 bg-green-500 text-white text-xs px-3 py-1 rounded-bl-lg font-bold flex items-center gap-1 animate-in slide-in-from-top-2">
          <Tag className="w-3 h-3" />
          {calculation.appliedPromo.name}
        </div>
      )}

      <CardContent className="pt-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-slate-600 font-medium">Presentación</Label>
            <Select
              value={formData.presentationId}
              onValueChange={(val) =>
                setFormData({ ...formData, presentationId: val })
              }
            >
              <SelectTrigger className="bg-white border-slate-200 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {presentations.length === 0 ? (
                  <SelectItem value="loading" disabled>
                    Cargando...
                  </SelectItem>
                ) : (
                  presentations.map((p) => (
                    <SelectItem
                      key={p.id}
                      value={p.id.toString()}
                      className={selectItemStyles}
                    >
                      {p.name} - $ {p.price.toLocaleString("es-AR")}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 font-medium">Cantidad</Label>
            <Select
              value={formData.quantity}
              onValueChange={(val) =>
                setFormData({ ...formData, quantity: val })
              }
            >
              <SelectTrigger className="bg-white border-slate-200 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((num) => (
                  <SelectItem
                    key={num}
                    value={num.toString()}
                    className={selectItemStyles}
                  >
                    {num} {num === 1 ? "unidad" : "unidades"}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600 font-medium">Tipo de Venta</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => {
                setFormData({ ...formData, type: val });
                if (onTypeChange) onTypeChange(val);
              }}
            >
              <SelectTrigger className="bg-white border-slate-200 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local" className={selectItemStyles}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sale-local" />
                    <span>Local</span>
                  </div>
                </SelectItem>
                <SelectItem value="pedidos_ya" className={selectItemStyles}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-sale-delivery" />
                    <span>PedidosYa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="mt-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-slate-900 font-semibold text-lg">
                Total a Pagar:
              </span>
              <span
                className={cn(
                  "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase tracking-wide",
                  theme.badge
                )}
              >
                {isPedidosYa ? "PedidosYa" : "Local"}
              </span>
            </div>

            <div className="text-right">
              {calculation.appliedPromo && (
                <span className="block text-sm text-slate-400 line-through mr-1">
                  $ {calculation.baseTotal.toLocaleString("es-AR")}
                </span>
              )}
              <span
                className={cn(
                  "text-3xl font-bold tracking-tight",
                  calculation.appliedPromo ? "text-green-600" : "text-slate-900"
                )}
              >
                $ {calculation.total.toLocaleString("es-AR")}
              </span>
            </div>
          </div>

          <Button
            size="lg"
            onClick={handleRegister}
            disabled={!formData.presentationId || calculation.total === 0}
            className={cn(
              "w-full h-11 text-base font-semibold text-white shadow-md transition-all duration-200",
              theme.button
            )}
          >
            Registrar Venta
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
