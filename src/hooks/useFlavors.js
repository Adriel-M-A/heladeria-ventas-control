import { useState, useCallback } from "react";
import { toast } from "sonner";
import { formatError } from "@/lib/utils";

export function useFlavors() {
    const [flavors, setFlavors] = useState([]);
    const [loading, setLoading] = useState(false);

    const fetchFlavors = useCallback(async () => {
        setLoading(true);
        try {
            if (!window.electronAPI) return;
            const data = await window.electronAPI.getFlavors();
            setFlavors(data);
        } catch (err) {
            console.error(err);
            toast.error("Error al cargar lista de sabores");
        } finally {
            setLoading(false);
        }
    }, []);

    const addFlavor = async (name) => {
        try {
            await window.electronAPI.addFlavor({ name });
            toast.success("Sabor agregado correctamente");
            fetchFlavors();
            return true;
        } catch (err) {
            toast.error(formatError(err));
            return false;
        }
    };

    const updateStock = async (id, stock) => {
        try {
            await window.electronAPI.updateFlavorStock({ id, stock });
            // Actualización optimista local para mejor UX
            setFlavors((prev) =>
                prev.map((f) => (f.id === id ? { ...f, stock } : f))
            );
            return true;
        } catch (err) {
            toast.error(formatError(err));
            // Revertir si falla (opcional, por ahora simple recarga)
            fetchFlavors();
            return false;
        }
    };

    const deleteFlavor = async (id) => {
        try {
            await window.electronAPI.deleteFlavor(id);
            toast.success("Sabor eliminado");
            fetchFlavors();
            return true;
        } catch (err) {
            toast.error(formatError(err));
            return false;
        }
    };

    return {
        flavors,
        loading,
        fetchFlavors,
        addFlavor,
        updateStock,
        deleteFlavor,
    };
}
