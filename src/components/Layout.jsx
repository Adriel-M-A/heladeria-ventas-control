import { Store, ShoppingCart, BarChart3, FileText, X } from "lucide-react";
import { cn } from "@/lib/utils"; // Importamos la utilidad que acabamos de crear

export default function Layout({ children }) {
  return (
    <div className="flex min-h-screen bg-background text-foreground font-sans">
      {/* --- SIDEBAR (IZQUIERDA) --- */}
      <aside className="w-64 bg-card border-r border-border hidden md:flex flex-col">
        {/* Logo y Nombre */}
        <div className="p-6 flex items-center gap-3">
          <div className="bg-primary/10 p-2 rounded-lg">
            <Store className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight">Heladería</h1>
            <p className="text-xs text-muted-foreground">Control de ventas</p>
          </div>
        </div>

        {/* Navegación */}
        <nav className="flex-1 px-4 py-4 space-y-1">
          <NavItem icon={<ShoppingCart />} label="Ventas" active />
          <NavItem icon={<BarChart3 />} label="Datos" />
          <NavItem icon={<FileText />} label="Reportes" />
        </nav>

        {/* Footer del Sidebar (Opcional) */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-center text-muted-foreground">v1.0.0</p>
        </div>
      </aside>

      {/* --- CONTENIDO PRINCIPAL (DERECHA) --- */}
      <main className="flex-1 bg-muted/30 relative overflow-y-auto">
        {/* Botón de cerrar (Solo visual según diseño, o funcional si es modal) */}
        <button className="absolute top-6 right-6 p-2 hover:bg-muted rounded-full transition-colors">
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        {/* Área donde se renderizarán las páginas (Dashboard, Formulario, etc.) */}
        <div className="p-8 max-w-7xl mx-auto space-y-8">{children}</div>
      </main>
    </div>
  );
}

// Componente pequeño para los items del menú
function NavItem({ icon, label, active = false }) {
  return (
    <button
      className={cn(
        "w-full flex items-center gap-3 px-4 py-2.5 rounded-md text-sm font-medium transition-all duration-200",
        active
          ? "bg-primary/10 text-primary hover:bg-primary/15" // Estilo Activo
          : "text-muted-foreground hover:bg-muted hover:text-foreground" // Estilo Inactivo
      )}
    >
      {/* Clonamos el icono para forzar el tamaño correcto */}
      <span className="[&>svg]:w-5 [&>svg]:h-5">{icon}</span>
      {label}
    </button>
  );
}
