import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RegisterSaleForm({ onSaleSuccess }) {
  const [presentations, setPresentations] = useState([]);
  const [formData, setFormData] = useState({
    presentationId: "",
    quantity: 1,
    type: "local",
  });

  useEffect(() => {
    if (!window.electronAPI) return;
    const loadData = async () => {
      try {
        const data = await window.electronAPI.getPresentations();
        setPresentations(data);
        if (data.length > 0) {
          setFormData((prev) => ({ ...prev, presentationId: data[0].id }));
        }
      } catch (err) {
        console.error("Error cargando presentaciones:", err);
      }
    };
    loadData();
  }, []);

  const selectedPresentation = presentations.find(
    (p) => p.id == formData.presentationId
  );

  const price = selectedPresentation ? selectedPresentation.price : 0;
  const total = price * formData.quantity;
  const isPedidosYa = formData.type === "pedidos_ya";

  const handleRegister = async () => {
    if (!selectedPresentation || !window.electronAPI) return;

    const saleData = {
      type: formData.type,
      presentation_name: selectedPresentation.name,
      price_base: selectedPresentation.price,
      quantity: formData.quantity,
      total: total,
      date: new Date().toLocaleString("es-AR"),
    };

    try {
      await window.electronAPI.addSale(saleData);
      if (onSaleSuccess) onSaleSuccess();
      setFormData((prev) => ({ ...prev, quantity: 1 }));
    } catch (err) {
      console.error("Error registrando venta:", err);
    }
  };

  const theme = {
    indicator: isPedidosYa ? "bg-rose-500" : "bg-blue-500",
    badge: isPedidosYa
      ? "bg-rose-100 text-rose-700"
      : "bg-blue-100 text-blue-700",
    button: isPedidosYa
      ? "bg-rose-600 hover:bg-rose-700 shadow-rose-200"
      : "bg-blue-600 hover:bg-blue-700 shadow-blue-200",
    focusRing: isPedidosYa ? "focus:ring-rose-600" : "focus:ring-blue-600",
  };

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-slate-900">Nueva Venta</h3>
        <p className="text-sm text-slate-500">Complete los datos de la venta</p>
      </CardHeader>

      <CardContent className="pt-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <Label className="text-slate-600">Presentación</Label>
            <div className="relative">
              <select
                className={cn(
                  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none appearance-none focus:ring-2",
                  theme.focusRing
                )}
                value={formData.presentationId}
                onChange={(e) =>
                  setFormData({ ...formData, presentationId: e.target.value })
                }
              >
                {presentations.length === 0 && (
                  <option>Cargando datos...</option>
                )}
                {presentations.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} - $ {p.price.toLocaleString("es-AR")}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600">Cantidad</Label>
            <div className="relative">
              <select
                className={cn(
                  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none appearance-none focus:ring-2",
                  theme.focusRing
                )}
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "unidad" : "unidades"}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label className="text-slate-600">Tipo de Venta</Label>
            <div className="relative">
              <select
                className={cn(
                  "flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:outline-none pl-9 appearance-none focus:ring-2",
                  theme.focusRing
                )}
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="local">Local</option>
                <option value="pedidos_ya">PedidosYa</option>
              </select>
              <div
                className={cn(
                  "absolute left-3 top-3.5 w-2.5 h-2.5 rounded-full z-10 transition-colors duration-300",
                  theme.indicator
                )}
              />
            </div>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 mt-2">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-sm font-medium">
              Total a Pagar:
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider transition-colors duration-300",
                theme.badge
              )}
            >
              {isPedidosYa ? "PedidosYa" : "Local"}
            </span>
          </div>

          <div className="flex items-center gap-6 w-full sm:w-auto justify-end">
            <span className="text-4xl font-bold text-slate-900 tracking-tight">
              $ {total.toLocaleString("es-AR")}
            </span>
          </div>
        </div>

        <Button
          size="lg"
          onClick={handleRegister}
          disabled={!selectedPresentation}
          className={cn(
            "w-full h-12 text-base font-semibold text-white shadow-md mt-2 transition-all duration-300",
            theme.button
          )}
        >
          Registrar Venta
        </Button>
      </CardContent>
    </Card>
  );
}
