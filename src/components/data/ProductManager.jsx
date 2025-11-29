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
import { useProducts } from "@/hooks/useProducts"; // Importamos el hook

export default function ProductManager() {
  const {
    presentations,
    fetchPresentations,
    addProduct,
    updateProduct,
    deleteProduct,
  } = useProducts();

  const [prodForm, setProdForm] = useState({ name: "", price: "" });
  const [editingProdId, setEditingProdId] = useState(null);
  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  useEffect(() => {
    fetchPresentations();
  }, [fetchPresentations]);

  const handleSubmit = async () => {
    if (!prodForm.name || !prodForm.price)
      return toast.warning("Complete todos los campos");

    let success = false;
    if (editingProdId) {
      success = await updateProduct({
        id: editingProdId,
        name: prodForm.name,
        price: Number(prodForm.price),
      });
    } else {
      success = await addProduct({
        name: prodForm.name,
        price: Number(prodForm.price),
      });
    }

    if (success) {
      setProdForm({ name: "", price: "" });
      setEditingProdId(null);
    }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar esta presentación?")) {
      await deleteProduct(id);
    }
  };

  // Lógica visual de ordenamiento (se queda aquí porque es solo de UI)
  const handleSort = (key) => {
    let direction = "asc";
    if (sortConfig.key === key && sortConfig.direction === "asc") {
      direction = "desc";
    }
    setSortConfig({ key, direction });
  };

  const sortedPresentations = [...presentations].sort((a, b) => {
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
      return <ArrowUp className="w-4 h-4 ml-2 text-blue-600" />;
    return <ArrowDown className="w-4 h-4 ml-2 text-blue-600" />;
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
                ? "Modifique los datos de la presentación"
                : "Complete los datos de la nueva presentación"}
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
            <div className="space-y-2">
              <Label>Precio</Label>
              <Input
                type="number"
                value={prodForm.price}
                onChange={(e) =>
                  setProdForm({ ...prodForm, price: e.target.value })
                }
                placeholder="ej: 5000"
              />
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
                    setProdForm({ name: "", price: "" });
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
                Presentaciones Registradas
              </h3>
              <p className="text-sm text-slate-500">
                Total de presentaciones: {presentations.length}
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
                  <TableHead
                    className="w-[30%] cursor-pointer hover:bg-slate-100 transition-colors select-none"
                    onClick={() => handleSort("price")}
                  >
                    <div className="flex items-center">
                      Precio {getSortIcon("price")}
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
                    <TableCell className="text-slate-600">
                      $ {p.price.toLocaleString("es-AR")}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                          onClick={() => {
                            setEditingProdId(p.id);
                            setProdForm({ name: p.name, price: p.price });
                          }}
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
                {presentations.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={3}
                      className="h-24 text-center text-slate-500"
                    >
                      No hay presentaciones cargadas.
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
