import { useState } from "react";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from "@/components/ui/table";
import { Pencil, Trash2, Plus } from "lucide-react";

export default function DataManagement() {
  // Datos iniciales simulados
  const [presentations, setPresentations] = useState([
    { id: 1, name: "1/2 Kilo", price: 2800 },
    { id: 2, name: "1/4 Kilo", price: 1500 },
  ]);

  // Estado del formulario
  const [formData, setFormData] = useState({ name: "", price: "" });
  const [editingId, setEditingId] = useState(null);

  // Manejar cambios en inputs
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Agregar o Actualizar
  const handleSubmit = () => {
    if (!formData.name || !formData.price) return; // Validación simple

    if (editingId) {
      // Modo Edición: Actualizar existente
      setPresentations((prev) =>
        prev.map((item) =>
          item.id === editingId
            ? { ...item, name: formData.name, price: Number(formData.price) }
            : item
        )
      );
      setEditingId(null);
    } else {
      // Modo Agregar: Crear nuevo
      const newId = Math.max(...presentations.map((p) => p.id), 0) + 1;
      setPresentations((prev) => [
        ...prev,
        { id: newId, name: formData.name, price: Number(formData.price) },
      ]);
    }
    // Limpiar formulario
    setFormData({ name: "", price: "" });
  };

  // Cargar datos para editar
  const handleEdit = (item) => {
    setFormData({ name: item.name, price: item.price });
    setEditingId(item.id);
  };

  // Eliminar
  const handleDelete = (id) => {
    setPresentations((prev) => prev.filter((item) => item.id !== id));
    if (editingId === id) {
      handleCancel();
    }
  };

  // Cancelar edición
  const handleCancel = () => {
    setEditingId(null);
    setFormData({ name: "", price: "" });
  };

  return (
    <div className="space-y-6">
      {/* Encabezado */}
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Gestión de Datos
        </h2>
        <p className="text-slate-500">
          Administre las presentaciones y precios
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        {/* --- FORMULARIO (Izquierda) --- */}
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

        {/* --- LISTADO (Derecha) --- */}
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
                    <TableHead className="w-[40%]">Nombre</TableHead>
                    <TableHead className="w-[30%]">Precio</TableHead>
                    <TableHead className="text-right">Acciones</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {presentations.map((item) => (
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
