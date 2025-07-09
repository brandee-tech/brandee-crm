import { useState } from 'react';
import { Plus, Edit2, Trash2, Mail, Phone, User } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { usePartners } from '@/hooks/usePartners';
import { AddPartnerDialog } from './AddPartnerDialog';
import { EditPartnerDialog } from './EditPartnerDialog';

export const Partners = () => {
  const [editingPartner, setEditingPartner] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  
  const { partners, loading, deletePartner, createPartner } = usePartners();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ativo':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'inativo':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-blue-100 text-blue-700 border-blue-200';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const handleDelete = async (id: string) => {
    await deletePartner(id);
  };

  const handleEdit = (partner: any) => {
    setEditingPartner(partner);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-4 md:py-8 flex items-center justify-center">
        <div className="text-lg">Carregando parceiros...</div>
      </div>
    );
  }

  return (
    <div className="py-4 md:py-8 space-y-4 md:space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 px-4 md:px-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Parceiros</h1>
          <p className="text-gray-600 mt-1">Gerencie seus parceiros de negócio</p>
        </div>
        <Button 
          className="bg-blue-600 hover:bg-blue-700 w-full sm:w-auto"
          onClick={() => setAddDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Novo Parceiro
        </Button>
      </div>

      <div className="grid gap-4 px-4 md:px-8">
        {partners.map((partner) => (
          <Card key={partner.id} className="p-4 md:p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div className="flex-1">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{partner.name}</h3>
                  <Badge className={getStatusColor(partner.status)}>
                    {partner.status === 'ativo' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
                
                {partner.description && (
                  <p className="text-gray-600 mb-3">{partner.description}</p>
                )}
                
                <div className="flex flex-col sm:flex-row gap-2 text-sm text-gray-500">
                  {partner.contact_person && (
                    <div className="flex items-center gap-1">
                      <User className="w-4 h-4" />
                      <span>{partner.contact_person}</span>
                    </div>
                  )}
                  {partner.email && (
                    <div className="flex items-center gap-1">
                      <Mail className="w-4 h-4" />
                      <span className="break-all">{partner.email}</span>
                    </div>
                  )}
                  {partner.phone && (
                    <div className="flex items-center gap-1">
                      <Phone className="w-4 h-4" />
                      <span className="break-all">{partner.phone}</span>
                    </div>
                  )}
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                <div className="text-left sm:text-right">
                  <p className="text-sm text-gray-500">Meta: {formatCurrency(partner.target_value)}</p>
                  <p className="text-xs text-gray-400 mt-1">Criado: {formatDate(partner.created_at)}</p>
                </div>
                
                <div className="flex gap-2 w-full sm:w-auto">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleEdit(partner)}
                    className="flex-1 sm:flex-none"
                  >
                    <Edit2 className="w-4 h-4 mr-1" />
                    <span className="sm:hidden">Editar</span>
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-red-600 hover:text-red-700 flex-1 sm:flex-none"
                      >
                        <Trash2 className="w-4 h-4 mr-1" />
                        <span className="sm:hidden">Excluir</span>
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
                        <AlertDialogDescription>
                          Tem certeza que deseja excluir o parceiro "{partner.name}"? Esta ação não pode ser desfeita.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancelar</AlertDialogCancel>
                        <AlertDialogAction onClick={() => handleDelete(partner.id)}>
                          Excluir
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {partners.length === 0 && (
        <div className="text-center py-12 px-4 md:px-8">
          <div className="text-lg font-medium text-gray-900 mb-2">Nenhum parceiro encontrado</div>
          <p className="text-gray-600">
            Comece criando seu primeiro parceiro.
          </p>
        </div>
      )}

      <EditPartnerDialog
        partner={editingPartner}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AddPartnerDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
        onCreatePartner={createPartner}
      />
    </div>
  );
};