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

export default function DataManagement() {
  const [presentations, setPresentations] = useState([]);
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  const [sortConfig, setSortConfig] = useState({ key: null, direction: "asc" });

  const fetchPresentations = async () => {
    try {
      const data = await window.electronAPI.getPresentations();
      setPresentations(data);
    } catch (err) {
      console.error("Error fetching presentations:", err);
      toast.error(formatError(err));
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.price) {
      toast.warning("Por favor complete todos los campos");
      return;
    }

    try {
      if (editingId) {
        await window.electronAPI.updatePresentation({
          id: editingId,
          name: formData.name,
          price: Number(formData.price),
        });
        toast.success("Presentación actualizada correctamente");
        setEditingId(null);
      } else {
        await window.electronAPI.addPresentation({
          name: formData.name,
          price: Number(formData.price),
        });
        toast.success("Nueva presentación creada");
      }

      setFormData({ name: "", price: "" });
      fetchPresentations();
    } catch (err) {
      console.error("Error guardando:", err);
      toast.error(formatError(err));
    }
  };

  const handleEdit = (item) => {
    setFormData({ name: item.name, price: item.price });
    setEditingId(item.id);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = async (id) => {
    if (confirm("¿Seguro que deseas eliminar esta presentación?")) {
      try {
        await window.electronAPI.deletePresentation(id);
        toast.success("Presentación eliminada");
        if (editingId === id) handleCancel();
        fetchPresentations();
      } catch (err) {
        console.error("Error eliminando:", err);
        toast.error(formatError(err));
      }
    }
  };

  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", price: "" });
  };

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

    if (typeof aValue === "string") {
      return sortConfig.direction === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

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
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Gestión de Datos
        </h2>
        <p className="text-slate-500">
          Administre las presentaciones y precios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-2">
          <Card className="bg-white border-slate-200 shadow-sm sticky top-6">
            <CardHeader className="border-b border-slate-100 pb-4 bg-slate-50/50">
              <h3 className="text-lg font-semibold text-slate-900">
                {editingId ? "Editar Presentación" : "Agregar Presentación"}
              </h3>
              <p className="text-sm text-slate-500">
                {editingId
                  ? "Modifique los datos de la presentación"
                  : "Complete los datos de la nueva presentación"}
              </p>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nombre de la Presentación</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="ej: 1 Kilo, 1/2 Kilo"
                  value={formData.name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="price">Precio</Label>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  placeholder="ej: 5000"
                  value={formData.price}
                  onChange={handleInputChange}
                />
              </div>

              <div className="pt-2 flex gap-2">
                <Button
                  onClick={handleSubmit}
                  className="w-full bg-slate-900 hover:bg-slate-800 text-white"
                >
                  {editingId ? (
                    <>Actualizar</>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Agregar
                    </>
                  )}
                </Button>

                {editingId && (
                  <Button
                    onClick={handleCancel}
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
                  {sortedPresentations.map((item) => (
                    <TableRow key={item.id} className="hover:bg-slate-50/50">
                      <TableCell className="font-medium text-slate-900">
                        {item.name}
                      </TableCell>
                      <TableCell className="text-slate-600">
                        $ {item.price.toLocaleString("es-AR")}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-blue-600 hover:border-blue-200 hover:bg-blue-50"
                            onClick={() => handleEdit(item)}
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-8 w-8 p-0 border-slate-200 text-slate-500 hover:text-red-600 hover:border-red-200 hover:bg-red-50"
                            onClick={() => handleDelete(item.id)}
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
    </div>
  );
}
