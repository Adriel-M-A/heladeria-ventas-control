import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
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
import { cn } from "@/lib/utils";

export default function RegisterSaleForm({ onSaleSuccess }) {
  const [presentations, setPresentations] = useState([]);
  const [formData, setFormData] = useState({
    presentationId: "",
    quantity: "1",
    type: "local",
  });

  // Cargar presentaciones de la BD
  useEffect(() => {
    if (!window.electronAPI) return;
    const loadData = async () => {
      try {
        const data = await window.electronAPI.getPresentations();
        setPresentations(data);
        if (data.length > 0) {
          setFormData((prev) => ({
            ...prev,
            presentationId: data[0].id.toString(),
          }));
        }
      } catch (err) {
        console.error("Error cargando presentaciones:", err);
        toast.error("Error al cargar los productos");
      }
    };
    loadData();
  }, []);

  const selectedPresentation = presentations.find(
    (p) => p.id.toString() === formData.presentationId
  );

  const price = selectedPresentation ? selectedPresentation.price : 0;
  const quantityNum = parseInt(formData.quantity);
  const total = price * quantityNum;
  const isPedidosYa = formData.type === "pedidos_ya";

  const handleRegister = async () => {
    if (!selectedPresentation || !window.electronAPI) return;

    if (total <= 0) {
      toast.error("El precio total debe ser mayor a 0");
      return;
    }

    const saleData = {
      type: formData.type,
      presentation_name: selectedPresentation.name,
      price_base: selectedPresentation.price,
      quantity: quantityNum,
      total: total,
      date: new Date().toISOString(),
    };

    try {
      await window.electronAPI.addSale(saleData);

      toast.success(
        `Venta de ${
          formData.type === "local" ? "Local" : "PedidosYa"
        } registrada`,
        {
          description: `$ ${total.toLocaleString("es-AR")}`,
        }
      );

      if (onSaleSuccess) onSaleSuccess();

      setFormData((prev) => ({ ...prev, quantity: "1" }));
    } catch (err) {
      console.error("Error registrando venta:", err);
      toast.error("Error al registrar la venta");
    }
  };

  const theme = {
    badge: isPedidosYa
      ? "bg-rose-100 text-rose-700 border-rose-200"
      : "bg-blue-100 text-blue-700 border-blue-200",
    button: isPedidosYa
      ? "bg-rose-600 hover:bg-rose-700"
      : "bg-blue-600 hover:bg-blue-700",
  };

  // Estilos personalizados para los items del select
  const selectItemStyles =
    "cursor-pointer focus:bg-slate-100 pl-3 pr-8 [&>span.absolute]:left-auto [&>span.absolute]:right-2";

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-bold text-slate-900">Nueva Venta</h3>
        <p className="text-sm text-slate-500">Complete los datos de la venta</p>
      </CardHeader>

      <CardContent className="pt-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Presentación */}
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
                  <SelectItem
                    value="loading"
                    disabled
                    className="cursor-default"
                  >
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

          {/* 2. Cantidad */}
          <div className="space-y-2">
            <Label className="text-slate-600 font-medium">Cantidad</Label>
            <Select
              value={formData.quantity}
              onValueChange={(val) =>
                setFormData({ ...formData, quantity: val })
              }
            >
              <SelectTrigger className="bg-white border-slate-200 focus:ring-0 focus:ring-offset-0">
                <SelectValue placeholder="Seleccionar..." />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 10, 15, 20].map((num) => (
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

          {/* 3. Tipo de Venta */}
          <div className="space-y-2">
            <Label className="text-slate-600 font-medium">Tipo de Venta</Label>
            <Select
              value={formData.type}
              onValueChange={(val) => setFormData({ ...formData, type: val })}
            >
              <SelectTrigger className="bg-white border-slate-200 focus:ring-0 focus:ring-offset-0">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local" className={selectItemStyles}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-blue-500" />
                    <span>Local</span>
                  </div>
                </SelectItem>
                <SelectItem value="pedidos_ya" className={selectItemStyles}>
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-rose-500" />
                    <span>PedidosYa</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Footer */}
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
            <span className="text-3xl font-bold text-slate-900 tracking-tight">
              $ {total.toLocaleString("es-AR")}
            </span>
          </div>

          <Button
            size="lg"
            onClick={handleRegister}
            disabled={!selectedPresentation || price === 0}
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
