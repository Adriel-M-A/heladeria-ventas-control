import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Tag, Package } from "lucide-react";
import ProductManager from "./data/ProductManager";
import PromotionManager from "./data/PromotionManager";

export default function DataManagement() {
  return (
    <div className="space-y-6 animate-in fade-in zoom-in-95 duration-300">
      <div>
        <h2 className="text-3xl font-bold tracking-tight text-slate-900">
          Gestión de Datos
        </h2>
        <p className="text-slate-500">
          Administre productos y promociones del sistema
        </p>
      </div>

      <Tabs defaultValue="products" className="w-full">
        <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
          <TabsTrigger value="products" className="flex gap-2">
            <Package className="w-4 h-4" /> Productos
          </TabsTrigger>
          <TabsTrigger value="promotions" className="flex gap-2">
            <Tag className="w-4 h-4" /> Promociones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-6 mt-6">
          <ProductManager />
        </TabsContent>

        <TabsContent value="promotions" className="space-y-6 mt-6">
          <PromotionManager />
        </TabsContent>
      </Tabs>
    </div>
  );
}
