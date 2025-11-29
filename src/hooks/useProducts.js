import { useState, useCallback } from "react";
import { toast } from "sonner";
import { formatError } from "@/lib/utils";

export function useProducts() {
  const [presentations, setPresentations] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPresentations = useCallback(async () => {
    setLoading(true);
    try {
      if (!window.electronAPI) return;
      const data = await window.electronAPI.getPresentations();
      setPresentations(data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar productos");
    } finally {
      setLoading(false);
    }
  }, []);

  const addProduct = async (product) => {
    try {
      await window.electronAPI.addPresentation(product);
      toast.success("Producto creado correctamente");
      fetchPresentations();
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    }
  };

  const updateProduct = async (product) => {
    try {
      await window.electronAPI.updatePresentation(product);
      toast.success("Producto actualizado correctamente");
      fetchPresentations();
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    }
  };

  const deleteProduct = async (id) => {
    try {
      await window.electronAPI.deletePresentation(id);
      toast.success("Producto eliminado");
      fetchPresentations();
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    }
  };

  return {
    presentations,
    loading,
    fetchPresentations,
    addProduct,
    updateProduct,
    deleteProduct,
  };
}
