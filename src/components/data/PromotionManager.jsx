import { useState, useEffect } from "react";
import { usePromotions } from "@/hooks/usePromotions";
import { useProducts } from "@/hooks/useProducts";
import PromotionForm from "./PromotionForm";
import PromotionList from "./PromotionList";

export default function PromotionManager() {
  const {
    promotions,
    fetchPromotions,
    addPromotion,
    updatePromotion,
    deletePromotion,
  } = usePromotions();
  const { presentations, fetchPresentations } = useProducts();

  const [promoForm, setPromoForm] = useState({
    name: "",
    presentation_id: "",
    min_quantity: "1",
    discount_type: "fixed_price",
    discount_value: "",
    active_days: [],
    start_date: "",
    end_date: "",
    channel: "all",
    is_active: "1",
  });
  const [editingPromoId, setEditingPromoId] = useState(null);

  useEffect(() => {
    fetchPromotions();
    fetchPresentations();
  }, [fetchPromotions, fetchPresentations]);

  const handleSubmit = async () => {
    const payload = {
      ...promoForm,
      min_quantity: Number(promoForm.min_quantity),
      discount_value: Number(promoForm.discount_value),
      active_days: promoForm.active_days.join(","),
      start_date: promoForm.start_date || null,
      end_date: promoForm.end_date || null,
      is_active: Number(promoForm.is_active),
    };

    let success = false;
    if (editingPromoId) {
      success = await updatePromotion({ id: editingPromoId, ...payload });
    } else {
      success = await addPromotion(payload);
    }

    if (success) {
      resetPromoForm();
    }
  };

  const resetPromoForm = () => {
    setPromoForm({
      name: "",
      presentation_id: "",
      min_quantity: "1",
      discount_type: "fixed_price",
      discount_value: "",
      active_days: [],
      start_date: "",
      end_date: "",
      channel: "all",
      is_active: "1",
    });
    setEditingPromoId(null);
  };

  const handleEdit = (p) => {
    setEditingPromoId(p.id);
    setPromoForm({
      name: p.name,
      presentation_id: p.presentation_id.toString(),
      min_quantity: p.min_quantity.toString(),
      discount_type: p.discount_type,
      discount_value: p.discount_value.toString(),
      active_days: p.active_days ? p.active_days.split(",").map(Number) : [],
      start_date: p.start_date || "",
      end_date: p.end_date || "",
      channel: p.channel || "all",
      is_active: p.is_active.toString(),
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    const success = await deletePromotion(id);
    if (success && editingPromoId === id) {
      resetPromoForm();
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
      <PromotionForm
        formData={promoForm}
        setFormData={setPromoForm}
        presentations={presentations}
        onSubmit={handleSubmit}
        onCancel={resetPromoForm}
        isEditing={!!editingPromoId}
      />

      <PromotionList
        promotions={promotions}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </div>
  );
}
