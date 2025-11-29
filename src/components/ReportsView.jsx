import { FileText } from "lucide-react";

export default function ReportsView() {
  return (
    <div className="flex flex-col items-center justify-center h-[50vh] text-slate-400 animate-in fade-in zoom-in-95 duration-300">
      <div className="bg-slate-100 p-4 rounded-full mb-4">
        <FileText className="w-8 h-8 text-slate-300" />
      </div>
      <p className="text-lg font-medium text-slate-600">Sección de Reportes</p>
      <p className="text-sm text-slate-400">Próximamente disponible...</p>
    </div>
  );
}
