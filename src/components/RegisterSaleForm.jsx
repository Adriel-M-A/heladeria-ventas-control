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
import { calculatePriceWithPromotions } from "@/lib/promotionEngine"; // Importamos el motor

export default function RegisterSaleForm({ onSaleSuccess, onTypeChange }) {
  const [presentations, setPresentations] = useState([]);
  const [promotions, setPromotions] = useState([]);
  const [formData, setFormData] = useState({
    presentationId: "",
    quantity: "1",
    type: "local",
    paymentMethod: "efectivo",
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

  // Efecto: Recalcular cuando cambian los inputs
  useEffect(() => {
    const selectedPresentation = presentations.find(
      (p) => p.id.toString() === formData.presentationId
    );

    const result = calculatePriceWithPromotions({
      presentation: selectedPresentation,
      promotions: promotions,
      quantity: parseInt(formData.quantity) || 0,
      channel: formData.type,
    });

    setCalculation(result);
  }, [formData, presentations, promotions]);

  const handleRegister = async () => {
    const selectedPresentation = presentations.find(
      (p) => p.id.toString() === formData.presentationId
    );
    if (!selectedPresentation || !window.electronAPI) return;

    if (calculation.total <= 0 && calculation.baseTotal <= 0) {
      toast.error("El precio total no puede ser 0");
      return;
    }

    const qty = parseInt(formData.quantity);
    const effectiveUnitPrice =
      Math.round((calculation.total / qty) * 100) / 100;

    const saleData = {
      type: formData.type,
      presentation_name: selectedPresentation.name,
      price_base: effectiveUnitPrice,
      quantity: qty,
      total: calculation.total,
      date: new Date().toISOString(), // Se guarda en UTC para ordenamiento global
      payment_method: formData.paymentMethod,
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
      setFormData((prev) => ({
        ...prev,
        quantity: "1",
        presentationId: "",
        paymentMethod: "efectivo",
      }));
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
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
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
                      {p.name}
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
                {[1, 2, 3, 4, 5, 6, 7].map((num) => (
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
            <Label className="text-slate-600 font-medium">Forma de Pago</Label>
            <Select
              value={formData.paymentMethod}
              onValueChange={(val) =>
                setFormData({ ...formData, paymentMethod: val })
              }
            >
              <SelectTrigger className="bg-white border-slate-200 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo" className={selectItemStyles}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                    <span>Efectivo</span>
                  </div>
                </SelectItem>
                <SelectItem value="mercado_pago" className={selectItemStyles}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Mercado Pago</span>
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
