import { useState } from "react";
import {
  Store,
  ShoppingCart,
  BarChart3,
  FileText,
  Menu,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentView, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Función para navegar y cerrar el menú móvil automáticamente
  const handleNavigate = (view) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* --- HEADER MÓVIL (Solo visible en pantallas pequeñas) --- */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="bg-blue-600 p-1.5 rounded-lg">
            <Store className="w-5 h-5 text-white" />
          </div>
          <span className="font-bold text-lg tracking-tight">Heladería</span>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="text-slate-500 hover:bg-slate-100"
        >
          {isMobileMenuOpen ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </Button>
      </header>

      {/* --- SIDEBAR DESKTOP (Fijo a la izquierda, oculto en móvil) --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <SidebarContent currentView={currentView} onNavigate={onNavigate} />
      </aside>

      {/* --- SIDEBAR MÓVIL (Overlay + Panel) --- */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          {/* Fondo oscuro (Overlay) */}
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Panel deslizante */}
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
            {/* Botón cerrar dentro del menú (opcional, por usabilidad) */}
            <div className="absolute top-4 right-4 md:hidden">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-slate-400"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            <SidebarContent
              currentView={currentView}
              onNavigate={handleNavigate}
            />
          </aside>
        </div>
      )}

      {/* --- CONTENIDO PRINCIPAL --- */}
      <main
        className={cn(
          "flex-1 relative min-h-screen transition-all duration-300",
          "md:ml-64", // Margen izquierdo en Desktop
          "pt-16 md:pt-0" // Padding superior en Móvil (por el Header)
        )}
      >
        <div className="p-4 md:p-8 max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}

// Componente extraído para reutilizar el contenido del menú
function SidebarContent({ currentView, onNavigate }) {
  return (
    <>
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
        <p className="text-xs text-center text-slate-400 font-medium">v1.0.0</p>
      </div>
    </>
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
