import { Store, ShoppingCart, BarChart3, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentView, onNavigate }) {
  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-sm shadow-blue-200">
            <Store className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight">
              Heladería
            </h1>
            <p className="text-[11px] font-medium text-slate-400 uppercase tracking-wider">
              Control de ventas
            </p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem
            icon={<ShoppingCart />}
            label="Ventas"
            active={currentView === "ventas"}
            onClick={() => onNavigate("ventas")}
          />
          <NavItem
            icon={<BarChart3 />}
            label="Datos"
            active={currentView === "datos"}
            onClick={() => onNavigate("datos")}
          />
          <NavItem
            icon={<FileText />}
            label="Reportes"
            active={currentView === "reportes"}
            onClick={() => onNavigate("reportes")}
          />
        </nav>

        <div className="p-4 border-t border-slate-100">
          <p className="text-xs text-center text-slate-400 font-medium">
            v1.0.0
          </p>
        </div>
      </aside>

      {/* --- CONTENIDO --- */}
      <main className="flex-1 md:ml-64 relative min-h-screen">
        <div className="p-8 max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active = false, onClick }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group cursor-pointer",
        active
          ? "bg-blue-50 text-blue-700"
          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900"
      )}
    >
      <span
        className={cn(
          "[&>svg]:w-5 [&>svg]:h-5 transition-colors",
          active ? "text-blue-600" : "text-slate-400 group-hover:text-slate-600"
        )}
      >
        {icon}
      </span>
      {label}
    </button>
  );
}
