import { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Database, Upload, Download, AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import { formatError } from "@/lib/utils";

export default function SettingsView() {
  const [loading, setLoading] = useState(false);

  const handleBackup = async () => {
    setLoading(true);
    try {
      const result = await window.electronAPI.backupDB();
      if (result.success) {
        toast.success("Copia de seguridad creada con éxito", {
          description: `Guardado en: ${result.path}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error(formatError(err));
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async () => {
    const confirm = window.confirm(
      "ADVERTENCIA: Al restaurar, se borrarán todos los datos actuales y se reemplazarán con los de la copia. La aplicación se reiniciará.\n\n¿Deseas continuar?"
    );

    if (!confirm) return;

    setLoading(true);
    try {
      await window.electronAPI.restoreDB();
      // Si tiene éxito, la app se reinicia, así que no necesitamos mostrar éxito aquí.
    } catch (err) {
      console.error(err);
      toast.error(formatError(err));
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Configuración
        </h2>
        <p className="text-slate-500">
          Administre las preferencias y datos del sistema
        </p>
      </div>

      <Tabs defaultValue="data" className="w-full">
        <TabsList className="grid w-full grid-cols-1 lg:w-[200px] h-10">
          <TabsTrigger value="data" className="flex gap-2">
            <Database className="w-4 h-4" /> Gestión de Datos
          </TabsTrigger>
          {/* Si agregas más tabs, cambia grid-cols-1 a grid-cols-2 */}
        </TabsList>

        <TabsContent value="data" className="mt-6 space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* CARD BACKUP */}
            <Card className="border-slate-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Download className="w-5 h-5" /> Exportar Datos
                </CardTitle>
                <CardDescription>
                  Crea una copia de seguridad de toda la base de datos. Guarda
                  este archivo en un lugar seguro (ej. Pendrive).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-blue-50 text-blue-700 p-4 rounded-md text-sm">
                  Se guardará todo el historial de ventas y productos hasta el
                  momento.
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleBackup}
                  disabled={loading}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {loading ? "Procesando..." : "Crear Copia de Seguridad"}
                </Button>
              </CardFooter>
            </Card>

            {/* CARD RESTORE */}
            <Card className="border-slate-200 border-l-4 border-l-red-500">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-red-700">
                  <Upload className="w-5 h-5" /> Restaurar Datos
                </CardTitle>
                <CardDescription>
                  Recupera el sistema a un estado anterior usando un archivo de
                  respaldo (.db).
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="bg-red-50 text-red-700 p-4 rounded-md text-sm flex items-start gap-2">
                  <AlertTriangle className="w-5 h-5 shrink-0" />
                  <p>
                    <strong>Cuidado:</strong> Esta acción sobrescribirá todos
                    los datos actuales. La aplicación se reiniciará
                    automáticamente.
                  </p>
                </div>
              </CardContent>
              <CardFooter>
                <Button
                  onClick={handleRestore}
                  disabled={loading}
                  variant="destructive"
                  className="w-full"
                >
                  {loading
                    ? "Procesando..."
                    : "Seleccionar Archivo y Restaurar"}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
