import { useState } from 'react';
import { Plus, Edit2, Trash2, Package, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { useProducts } from '@/hooks/useProducts';
import { AddProductDialog } from './AddProductDialog';
import { EditProductDialog } from './EditProductDialog';
import { formatCurrency } from '@/lib/utils';

export const Products = () => {
  const [editingProduct, setEditingProduct] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);

  const { products, loading, deleteProduct } = useProducts();

  const handleDelete = async (id: string) => {
    await deleteProduct(id);
  };

  const handleEdit = (product: any) => {
    setEditingProduct(product);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-4 md:py-8 flex items-center justify-center">
        <div className="text-lg">Carregando produtos...</div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 space-y-4 md:space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Produtos</h1>
          <p className="text-gray-600 mt-1">Gerencie os produtos e serviços da sua empresa</p>
        </div>
        <Button
          className="w-full sm:w-auto hover-scale"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Produto
        </Button>
      </div>

      <div className="px-4 md:px-8">
        <div className="grid gap-4">
          {products.map((product) => (
            <Card key={product.id} className="p-4 md:p-6 hover:shadow-lg transition-all duration-200 hover-scale">
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      <Package className="w-5 h-5 text-primary" />
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                    </div>
                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 w-fit">
                      <DollarSign className="w-3 h-3 mr-1" />
                      {formatCurrency(product.price)}
                    </Badge>
                    {product.active && (
                      <Badge className="bg-green-100 text-green-700 border-green-200 w-fit">
                        Ativo
                      </Badge>
                    )}
                  </div>

                  {product.description && (
                    <p className="text-gray-600 text-sm mb-3">{product.description}</p>
                  )}

                  <div className="text-xs text-gray-400">
                    Criado em: {new Date(product.created_at).toLocaleDateString('pt-BR')}
                  </div>
                </div>

                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(product)}
                    className="flex-1 sm:flex-none hover-scale"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    <span className="sm:hidden">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1 sm:flex-none hover-scale"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="sm:hidden">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent className="animate-scale-in">
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o produto "{product.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => handleDelete(product.id)}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </Card>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-12 px-4 md:px-8 animate-fade-in">
            <Package className="h-16 w-16 mx-auto mb-4 text-gray-300" />
            <div className="text-lg font-medium text-gray-900 mb-2">Nenhum produto cadastrado</div>
            <p className="text-gray-600 mb-4">
              Comece criando seu primeiro produto ou serviço.
            </p>
            <Button
              onClick={() => setAddDialogOpen(true)}
              className="hover-scale"
            >
              <Plus className="w-4 h-4 mr-2" />
              Criar Primeiro Produto
            </Button>
          </div>
        )}
      </div>

      <EditProductDialog
        product={editingProduct}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AddProductDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
};