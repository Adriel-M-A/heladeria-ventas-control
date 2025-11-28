import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function RegisterSaleForm() {
  const [formData, setFormData] = useState({
    presentation: "medio_kilo",
    quantity: 1,
    type: "local",
  });

  const PRICES = {
    cuarto: 1500,
    medio_kilo: 2800,
    kilo: 5000,
  };

  const total = PRICES[formData.presentation] * formData.quantity;

  return (
    <Card className="bg-white border-slate-200 shadow-sm">
      <CardHeader className="border-b border-slate-100 pb-4">
        <h3 className="text-lg font-semibold text-slate-900">Nueva Venta</h3>
        <p className="text-sm text-slate-500">Complete los datos de la venta</p>
      </CardHeader>

      <CardContent className="pt-6 grid gap-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 1. Presentación */}
          <div className="space-y-2">
            <Label className="text-slate-600">Presentación</Label>
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none appearance-none"
                value={formData.presentation}
                onChange={(e) =>
                  setFormData({ ...formData, presentation: e.target.value })
                }
              >
                <option value="cuarto">1/4 Kilo - $ 1.500</option>
                <option value="medio_kilo">1/2 Kilo - $ 2.800</option>
                <option value="kilo">1 Kilo - $ 5.000</option>
              </select>
              {/* Icono de flecha custom para asegurar estilo */}
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* 2. Cantidad */}
          <div className="space-y-2">
            <Label className="text-slate-600">Cantidad</Label>
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none appearance-none"
                value={formData.quantity}
                onChange={(e) =>
                  setFormData({ ...formData, quantity: Number(e.target.value) })
                }
              >
                {[1, 2, 3, 4, 5, 10].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? "unidad" : "unidades"}
                  </option>
                ))}
              </select>
              <div className="absolute right-3 top-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>

          {/* 3. Tipo de Venta */}
          <div className="space-y-2">
            <Label className="text-slate-600">Tipo de Venta</Label>
            <div className="relative">
              <select
                className="flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none pl-9 appearance-none"
                value={formData.type}
                onChange={(e) =>
                  setFormData({ ...formData, type: e.target.value })
                }
              >
                <option value="local">Local</option>
                <option value="pedidos_ya">PedidosYa</option>
              </select>

              {/* Indicador de color visual */}
              <div
                className={cn(
                  "absolute left-3 top-3.5 w-2.5 h-2.5 rounded-full z-10",
                  formData.type === "local" ? "bg-blue-500" : "bg-red-500"
                )}
              />

              <div className="absolute right-3 top-3 pointer-events-none">
                <svg
                  className="w-4 h-4 text-slate-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  ></path>
                </svg>
              </div>
            </div>
          </div>
        </div>

        {/* Footer con Total y Botón */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-4 gap-4 mt-2">
          <div className="flex items-center gap-3 bg-slate-50 px-4 py-2 rounded-lg border border-slate-100">
            <span className="text-slate-500 text-sm font-medium">
              Total a Pagar:
            </span>
            <span
              className={cn(
                "px-2 py-0.5 rounded text-xs font-bold uppercase tracking-wider",
                formData.type === "local"
                  ? "bg-blue-100 text-blue-700"
                  : "bg-red-100 text-red-700"
              )}
            >
              {formData.type === "local" ? "Local" : "PedidosYa"}
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
          className="w-full h-12 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200 mt-2"
        >
          Registrar Venta
        </Button>
      </CardContent>
    </Card>
  );
}
