import { useState } from "react";
import logo from "@/assets/logo.svg";
// Importamos Settings icon
import {
  ShoppingCart,
  BarChart3,
  FileText,
  Menu,
  X,
  Settings,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export default function Layout({ children, currentView, onNavigate }) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleNavigate = (view) => {
    onNavigate(view);
    setIsMobileMenuOpen(false);
  };

  return (
    <div className="flex min-h-screen bg-slate-50 font-sans text-slate-900">
      {/* HEADER MÓVIL */}
      <header className="md:hidden fixed top-0 left-0 right-0 h-16 bg-white border-b border-slate-200 z-40 flex items-center justify-between px-4 shadow-sm">
        <div className="flex items-center gap-2">
          <img src={logo} alt="Logo" className="w-8 h-8 object-contain" />
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

      {/* SIDEBAR DESKTOP */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <SidebarContent currentView={currentView} onNavigate={onNavigate} />
      </aside>

      {/* SIDEBAR MÓVIL */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />
          <aside className="absolute inset-y-0 left-0 w-64 bg-white shadow-2xl flex flex-col animate-in slide-in-from-left duration-300">
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

      {/* CONTENIDO PRINCIPAL */}
      <main
        className={cn(
          "flex-1 relative min-h-screen transition-all duration-300",
          "md:ml-64",
          "pt-16 md:pt-0"
        )}
      >
        <div className="p-6 md:px-16 md:py-8 max-w-7xl mx-auto space-y-2">
          {children}
        </div>
      </main>
    </div>
  );
}

function SidebarContent({ currentView, onNavigate }) {
  return (
    <>
      <div className="p-6 flex items-center gap-3">
        <img
          src={logo}
          alt="Logo Heladería"
          className="w-14 h-14 object-contain"
        />

        <div>
          <h1 className="font-bold text-lg leading-tight tracking-tight">
            Elixir Helados
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

      <div className="px-4 pb-4 border-t border-slate-100 pt-4">
        <NavItem
          icon={<Settings />}
          label="Configuración"
          active={currentView === "configuracion"}
          onClick={() => onNavigate("configuracion")}
        />
        <p className="text-xs text-center text-slate-400 font-medium mt-4 border-t border-slate-100 pt-2">
          v{__APP_VERSION__}
        </p>
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
