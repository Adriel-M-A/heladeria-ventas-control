import Layout from "@/components/Layout";
import RegisterSaleForm from "@/components/RegisterSaleForm";
import SalesTable from "@/components/SalesTable";
import { CreditCard, DollarSign, TrendingUp } from "lucide-react";

function App() {
  return (
    <Layout>
      {/* --- Encabezado de la Página --- */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900">
            Registrar Ventas
          </h2>
          <p className="text-slate-500">
            Complete el formulario para registrar una nueva venta
          </p>
        </div>
      </div>

      <div className="grid gap-6">
        {/* --- BLOQUE A: Formulario de Nueva Venta --- */}
        <RegisterSaleForm />

        {/* --- BLOQUE B: Panel de Estadísticas --- */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Card 1: Azul Claro (Ventas Local) */}
          <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-blue-600 font-medium text-sm">
                Ventas Local
              </span>
              <CreditCard className="w-4 h-4 text-blue-500 opacity-70" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">3</span>
              <div className="text-xs text-blue-600 font-medium mt-1 flex justify-between">
                <span>Total</span>
                <span>$ 61.600</span>
              </div>
            </div>
          </div>

          {/* Card 2: Rojo Claro (Ventas PedidosYa) */}
          <div className="bg-red-50 border border-red-100 rounded-xl p-6 flex flex-col justify-between h-32">
            <div className="flex justify-between items-start">
              <span className="text-red-600 font-medium text-sm">
                Ventas PedidosYa
              </span>
              <TrendingUp className="w-4 h-4 text-red-500 opacity-70" />
            </div>
            <div>
              <span className="text-2xl font-bold text-slate-900">1</span>
              <div className="text-xs text-red-600 font-medium mt-1 flex justify-between">
                <span>Total</span>
                <span>$ 3.000</span>
              </div>
            </div>
          </div>

          {/* Card 3: Oscuro (Total General) */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between h-32 text-white">
            <div className="flex justify-between items-start">
              <span className="text-slate-300 font-medium text-sm">
                Total General
              </span>
              <DollarSign className="w-4 h-4 text-slate-400" />
            </div>
            <div>
              <span className="text-2xl font-bold">4</span>
              <div className="text-xs text-slate-300 font-medium mt-1 flex justify-between">
                <span>Ingresos</span>
                <span>$ 64.600</span>
              </div>
            </div>
          </div>
        </div>

        {/* Botones de Filtro (Tabs visuales) */}
        <div className="flex gap-2 bg-slate-100 p-1 rounded-lg w-fit">
          <button className="px-4 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-md shadow-sm">
            Ventas Local
          </button>
          <button className="px-4 py-1.5 text-slate-600 text-sm font-medium hover:text-slate-900 transition-colors">
            Ventas PedidosYa
          </button>
        </div>

        {/* --- BLOQUE C: Historial de Ventas (Placeholder) --- */}
        <SalesTable />
      </div>
    </Layout>
  );
}

export default App;
