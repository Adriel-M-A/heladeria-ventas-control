import { useState, useCallback } from "react";
import { toast } from "sonner";
import { formatError } from "@/lib/utils";

export function usePromotions() {
  const [promotions, setPromotions] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchPromotions = useCallback(async () => {
    setLoading(true);
    try {
      if (!window.electronAPI) return;
      const data = await window.electronAPI.getPromotions();
      setPromotions(data);
    } catch (err) {
      console.error(err);
      toast.error("Error al cargar promociones");
    } finally {
      setLoading(false);
    }
  }, []);

  const addPromotion = async (promo) => {
    try {
      await window.electronAPI.addPromotion(promo);
      toast.success("Promoción creada correctamente");
      fetchPromotions();
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    }
  };

  const updatePromotion = async (promo) => {
    try {
      await window.electronAPI.updatePromotion(promo);
      toast.success("Promoción actualizada correctamente");
      fetchPromotions();
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    }
  };

  const deletePromotion = async (id) => {
    try {
      await window.electronAPI.deletePromotion(id);
      toast.success("Promoción eliminada");
      fetchPromotions();
      return true;
    } catch (err) {
      toast.error(formatError(err));
      return false;
    }
  };

  return {
    promotions,
    loading,
    fetchPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
  };
}
