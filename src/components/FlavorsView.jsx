import { useEffect, useState } from "react";
import { Plus, Minus, Trash2, PackagePlus } from "lucide-react";
import { useFlavors } from "@/hooks/useFlavors";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

export default function FlavorsView() {
    const { flavors, loading, fetchFlavors, addFlavor, updateStock, deleteFlavor } =
        useFlavors();
    const [isAddOpen, setIsAddOpen] = useState(false);
    const [newFlavorName, setNewFlavorName] = useState("");

    useEffect(() => {
        fetchFlavors();
    }, [fetchFlavors]);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newFlavorName.trim()) return;
        const success = await addFlavor(newFlavorName);
        if (success) {
            setNewFlavorName("");
            setIsAddOpen(false);
        }
    };

    const increment = (id, current) => updateStock(id, current + 1);
    const decrement = (id, current) => {
        if (current > 0) updateStock(id, current - 1);
    };

    return (
        <div className="p-6 space-y-6 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight text-slate-800">
                        Stock de Baldes
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Control manual de inventario de baldes de helado.
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button className="gap-2 bg-emerald-600 hover:bg-emerald-700">
                            <PackagePlus className="w-5 h-5" />
                            Nuevo Sabor
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Agregar Nuevo Sabor</DialogTitle>
                        </DialogHeader>
                        <form onSubmit={handleAdd} className="space-y-4 pt-4">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre del Sabor</Label>
                                <Input
                                    id="name"
                                    placeholder="Ej: Dulce de Leche"
                                    value={newFlavorName}
                                    onChange={(e) => setNewFlavorName(e.target.value)}
                                    autoFocus
                                />
                            </div>
                            <div className="flex justify-end gap-2">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setIsAddOpen(false)}
                                >
                                    Cancelar
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-emerald-600 hover:bg-emerald-700"
                                    disabled={!newFlavorName.trim()}
                                >
                                    Guardar
                                </Button>
                            </div>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>

            {loading ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {[...Array(6)].map((_, i) => (
                        <div
                            key={i}
                            className="h-24 bg-slate-100 rounded-xl animate-pulse"
                        />
                    ))}
                </div>
            ) : flavors.length === 0 ? (
                <div className="text-center py-20 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                    <PackagePlus className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                    <h3 className="text-xl font-medium text-slate-600">
                        No hay sabores registrados
                    </h3>
                    <p className="text-slate-400">
                        Comienza agregando los sabores de helado que tienes en stock.
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
                    {flavors.map((flavor) => (
                        <Card
                            key={flavor.id}
                            className="group hover:shadow-md transition-all duration-300 border-slate-200"
                        >
                            <CardHeader className="flex flex-row items-center justify-between p-3 pb-0 space-y-0">
                                <CardTitle className="text-sm font-semibold text-slate-800 leading-tight truncate pr-2" title={flavor.name}>
                                    {flavor.name}
                                </CardTitle>
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-6 w-6 -mr-1 text-slate-400 opacity-0 group-hover:opacity-100 hover:text-red-500 hover:bg-red-50 transition-all shrink-0"
                                        >
                                            <Trash2 className="w-3.5 h-3.5" />
                                        </Button>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>¿Eliminar este sabor?</AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Se eliminará "{flavor.name}" de la lista.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => deleteFlavor(flavor.id)}
                                                className="bg-red-600 hover:bg-red-700"
                                            >
                                                Eliminar
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </CardHeader>
                            <CardContent className="p-3 pt-0">
                                <div className="flex items-center justify-between gap-2 overflow-hidden">
                                    <div className="flex items-baseline gap-1 min-w-0">
                                        <span className="text-2xl font-bold text-slate-700 tabular-nums truncate">
                                            {flavor.stock}
                                        </span>
                                        <span className="text-xs font-medium text-slate-400 truncate">
                                            baldes
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 shrink-0">
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 rounded-md border-slate-200 hover:border-slate-300 hover:bg-slate-100"
                                            onClick={() => decrement(flavor.id, flavor.stock)}
                                            disabled={flavor.stock <= 0}
                                        >
                                            <Minus className="w-3.5 h-3.5 text-slate-600" />
                                        </Button>
                                        <Button
                                            size="icon"
                                            variant="outline"
                                            className="h-7 w-7 rounded-md border-slate-200 hover:border-emerald-200 hover:bg-emerald-50 hover:text-emerald-600"
                                            onClick={() => increment(flavor.id, flavor.stock)}
                                        >
                                            <Plus className="w-3.5 h-3.5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    );
}
