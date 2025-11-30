import { useState, useEffect } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import {
  Pencil,
  Trash2,
  Plus,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from "lucide-react";
import { formatError } from "@/lib/utils";

export default function ProductManager() {
  const [localPresentations, setLocalPresentations] = useState([]);

  // Reemplazo temporal si no usas el hook:
  const fetchLocalPresentations = async () => {
    try {
      const data = await window.electronAPI.getPresentations();
      setLocalPresentations(data);
    } catch (err) {
      toast.error("Error cargando productos");
    }
  };

  useEffect(() => {
    fetchLocalPresentations();
  }, []);
  // -- FIN LÓGICA --

  const [prodForm, setProdForm] = useState({
    name: "",
    price_local: "",
    price_delivery: "",
  });
  const [editingProdId, setEditingProdId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const handleSubmit = async () => {
    if (!prodForm.name || !prodForm.price_local || !prodForm.price_delivery) {
      return toast.warning("Complete todos los campos");
    }

    const payload = {
      name: prodForm.name,
      price_local: Number(prodForm.price_local),
      price_delivery: Number(prodForm.price_delivery),
    };

    try {
      if (editingProdId) {
        await window.electronAPI.updatePresentation({
          id: editingProdId,
          ...payload,
        });
        toast.success("Producto actualizado");
      } else {
        await window.electronAPI.addPresentation(payload);
        toast.success("Producto creado");
      }
      setProdForm({ name: "", price_local: "", price_delivery: "" });
      setEditingProdId(null);
      fetchLocalPresentations();
    } catch (err) {
      toast.error(formatError(err));
    }
  };

  const handleDelete = (id) => {
    toast("¿Seguro que deseas eliminar este producto?", {
      description: "Esta acción no se puede deshacer.",
      action: {
        label: "Eliminar",
        onClick: async () => {
          try {
            await window.electronAPI.deletePresentation(id);
            toast.success("Producto eliminado");
            if (editingProdId === id) {
              setProdForm({ name: "", price_local: "", price_delivery: "" });
              setEditingProdId(null);
            }
            fetchLocalPresentations();
          } catch (err) {
            toast.error(formatError(err));
          }
        },
      },
      cancel: { label: "Cancelar" },
      duration: 5000,
    });
  };

  const startEdit = (item) => {
    setEditingProdId(item.id);
    setProdForm({
      name: item.name,
      price_local: item.price_local,
      price_delivery: item.price_delivery,
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPresentations = [...localPresentations].sort((a, b) => {
    if (!sortConfig.key) return 0;
    const aValue = a[sortConfig.key];
    const bValue = b[sortConfig.key];
    if (typeof aValue === "string")
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    if (aValue < bValue) return sortConfig.direction === "asc" ? -1 : 1;
    if (aValue > bValue) return sortConfig.direction === "asc" ? 1 : -1;
    return 0;
  });

  const getSortIcon = (key) => {
    if (sortConfig.key !== key)
      return <ArrowUpDown className="w-4 h-4 ml-2 text-slate-300" />;
    if (sortConfig.direction === "asc")
      return <ArrowUp className="w-4 h-4 ml-2 text-sale-local" />;
    return <ArrowDown className="w-4 h-4 ml-2 text-sale-local" />;
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2">
        <Card className="bg-white border-slate-200 shadow-sm sticky top-6">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
            <h3 className="text-lg font-semibold text-slate-900">
              {editingProdId ? "Editar Presentación" : "Agregar Presentación"}
            </h3>
            <p className="text-sm text-slate-500">
              {editingProdId
                ? "Modifique los precios"
                : "Defina precios diferenciados"}
            </p>
          </CardHeader>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Nombre de la Presentación</Label>
              <Input
                value={prodForm.name}
                onChange={(e) =>
                  setProdForm({ ...prodForm, name: e.target.value })
                }
                placeholder="ej: 1 Kilo, 1/2 Kilo"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                {/* CAMBIO: Uso de text-sale-local */}
                <Label className="text-sale-local font-bold">
                  Precio Local
                </Label>
                <Input
                  type="number"
                  value={prodForm.price_local}
                  min={0}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, price_local: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                {/* CAMBIO: Uso de text-sale-delivery y etiqueta 'PedidosYa' */}
                <Label className="text-sale-delivery font-bold">
                  Precio PedidosYa
                </Label>
                <Input
                  type="number"
                  value={prodForm.price_delivery}
                  min={0}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, price_delivery: e.target.value })
                  }
                />
              </div>
            </div>

            <div className="pt-2 flex gap-2">
              <Button
                onClick={handleSubmit}
                className="w-full bg-slate-900 hover:bg-slate-800 text-white"
              >
                {editingProdId ? (
                  "Actualizar"
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" /> Agregar
                  </>
                )}
              </Button>
              {editingProdId && (
                <Button
                  onClick={() => {
                    setEditingProdId(null);
                    setProdForm({
                      name: "",
                      price_local: "",
                      price_delivery: "",
                    });
                  }}
                  variant="outline"
                  className="w-1/3 border-slate-200 text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                >
                  Cancelar
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="lg:col-span-3">
        <Card className="bg-white border-slate-200 shadow-sm overflow-hidden">
          <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50 flex flex-row items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                Listado de Precios
              </h3>
              <p className="text-sm text-slate-500">
                {localPresentations.length} productos registrados
              </p>
            </div>
          </CardHeader>
          <div className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-slate-50/50">
                  <TableHead
                    className="w-[40%] cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort("name")}
                  >
                    <div className="flex items-center">
                      Nombre {getSortIcon("name")}
                    </div>
                  </TableHead>
                  {/* CAMBIO: Headers con colores personalizados y nombres correctos */}
                  <TableHead
                    className="w-[20%] text-sale-local font-bold cursor-pointer select-none"
                    onClick={() => handleSort("price_local")}
                  >
                    <div className="flex items-center">
                      Local {getSortIcon("price_local")}
                    </div>
                  </TableHead>
                  <TableHead
                    className="w-[20%] text-sale-delivery font-bold cursor-pointer select-none"
                    onClick={() => handleSort("price_delivery")}
                  >
                    <div className="flex items-center">
                      PedidosYa {getSortIcon("price_delivery")}
                    </div>
                  </TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {sortedPresentations.map((p) => (
                  <TableRow key={p.id} className="hover:bg-slate-50/50">
                    <TableCell className="font-medium text-slate-900">
                      {p.name}
                    </TableCell>
                    {/* CAMBIO: Celdas de precio con colores personalizados */}
                    <TableCell className="text-sale-local font-medium">
                      $ {p.price_local?.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-sale-delivery font-medium">
                      $ {p.price_delivery?.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                          onClick={() => startEdit(p)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                          onClick={() => handleDelete(p.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {localPresentations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={4}
                      className="h-24 text-center text-slate-500"
                    >
                      No hay productos cargados.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </Card>
      </div>
    </div>
  );
}
