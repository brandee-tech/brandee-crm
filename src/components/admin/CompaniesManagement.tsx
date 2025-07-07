
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { CompanyFormDialog } from './CompanyFormDialog';
import { Building2, Users, Phone, Globe, MapPin, Calendar, Plus, Edit, UserPlus, Power, Trash } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { AssignExistingUserDialog } from './AssignExistingUserDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

interface CompanyData {
  id: string;
  name: string;
  domain: string | null;
  industry: string | null;
  size: string | null;
  location: string | null;
  website: string | null;
  phone: string | null;
  plan: string | null;
  status: string | null;
  user_count: number;
  leads_count: number;
  appointments_count: number;
  created_at: string;
}

export const CompaniesManagement = () => {
  const navigate = useNavigate();
  const { companies, loading, updateCompanyStatus, deactivateCompany, deleteCompany, refetch } = useAllCompanies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignUserDialogOpen, setAssignUserDialogOpen] = useState(false);
  const [selectedCompanyForUser, setSelectedCompanyForUser] = useState<{ id: string; name: string } | null>(null);
  const [deactivateDialogOpen, setDeactivateDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedCompanyForAction, setSelectedCompanyForAction] = useState<{ id: string; name: string } | null>(null);

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando empresas...</div>
      </div>
    );
  }

  const getStatusColor = (status: string | null) => {
    switch (status?.toLowerCase()) {
      case 'ativa':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'inativa':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'prospect':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPlanColor = (plan: string | null) => {
    switch (plan?.toLowerCase()) {
      case 'basic':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      case 'premium':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'enterprise':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const handleAddCompany = () => {
    setDialogOpen(true);
  };

  const handleEditCompany = (company: CompanyData) => {
    navigate(`/admin/companies/${company.id}/edit`);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  const handleAssignUser = (company: CompanyData) => {
    setSelectedCompanyForUser({ id: company.id, name: company.name });
    setAssignUserDialogOpen(true);
  };

  const handleAssignUserSuccess = () => {
    refetch();
    setSelectedCompanyForUser(null);
  };

  const handleDeactivateCompany = (company: CompanyData) => {
    setSelectedCompanyForAction({ id: company.id, name: company.name });
    setDeactivateDialogOpen(true);
  };

  const handleDeleteCompany = (company: CompanyData) => {
    setSelectedCompanyForAction({ id: company.id, name: company.name });
    setDeleteDialogOpen(true);
  };

  const confirmDeactivate = async () => {
    if (selectedCompanyForAction) {
      await deactivateCompany(selectedCompanyForAction.id);
      setDeactivateDialogOpen(false);
      setSelectedCompanyForAction(null);
    }
  };

  const confirmDelete = async () => {
    if (selectedCompanyForAction) {
      await deleteCompany(selectedCompanyForAction.id);
      setDeleteDialogOpen(false);
      setSelectedCompanyForAction(null);
    }
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4">
        <div className="space-y-2">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Gerenciamento de Empresas</h1>
          <p className="text-sm sm:text-base text-gray-600">
            Visualize e gerencie todas as empresas cadastradas no sistema
          </p>
        </div>
        <Button onClick={handleAddCompany} className="flex items-center gap-2 w-full sm:w-auto">
          <Plus className="w-4 h-4" />
          <span className="sm:hidden">Nova Empresa</span>
          <span className="hidden sm:inline">Adicionar Empresa</span>
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4">
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">Total</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">{companies.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">Usuários</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">
              {companies.reduce((sum, company) => sum + company.user_count, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">Ativas</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">
              {companies.filter(c => c.status?.toLowerCase() === 'ativa').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-3 sm:p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600 flex-shrink-0" />
              <span className="text-xs sm:text-sm text-gray-600 truncate">Prospects</span>
            </div>
            <div className="text-lg sm:text-2xl font-bold mt-1">
              {companies.filter(c => c.status?.toLowerCase() === 'prospect').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3">
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-base sm:text-lg truncate">{company.name}</CardTitle>
                  <CardDescription className="truncate">{company.domain}</CardDescription>
                </div>
                <div className="flex flex-row sm:flex-col gap-2 sm:gap-1 flex-shrink-0">
                  <Badge className={`text-xs ${getStatusColor(company.status)}`}>
                    {company.status || 'Não definido'}
                  </Badge>
                  <Badge className={`text-xs ${getPlanColor(company.plan)}`}>
                    {company.plan || 'Basic'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-2 sm:gap-4 text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <Users className="w-4 h-4 text-blue-600 flex-shrink-0" />
                  <span className="truncate">{company.user_count} usuários</span>
                </div>
                <div className="flex items-center gap-2 min-w-0">
                  <Building2 className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span className="truncate">{company.leads_count} leads</span>
                </div>
              </div>

              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                  <Phone className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{company.phone}</span>
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                  <Globe className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{company.website}</span>
                </div>
              )}

              {company.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                  <MapPin className="w-4 h-4 flex-shrink-0" />
                  <span className="truncate">{company.location}</span>
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600 min-w-0">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}</span>
              </div>

              <div className="pt-2 border-t space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <span className="text-sm text-gray-600 flex-shrink-0">Status:</span>
                  <Select 
                    value={company.status || ''} 
                    onValueChange={(value) => updateCompanyStatus(company.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex flex-col gap-2">
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleEditCompany(company)}
                    >
                      <Edit className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Editar</span>
                      <span className="sm:hidden">Editar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1"
                      onClick={() => handleAssignUser(company)}
                    >
                      <UserPlus className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Atribuir Usuário</span>
                      <span className="sm:hidden">Usuário</span>
                    </Button>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-yellow-600 border-yellow-200 hover:bg-yellow-50"
                      onClick={() => handleDeactivateCompany(company)}
                      disabled={company.status?.toLowerCase() === 'inativa'}
                    >
                      <Power className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Inativar</span>
                      <span className="sm:hidden">Inativar</span>
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      className="flex-1 text-red-600 border-red-200 hover:bg-red-50"
                      onClick={() => handleDeleteCompany(company)}
                    >
                      <Trash className="w-4 h-4 mr-2" />
                      <span className="hidden sm:inline">Excluir</span>
                      <span className="sm:hidden">Excluir</span>
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {companies.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhuma empresa encontrada</p>
          <p className="text-gray-400 mt-2">As empresas aparecerão aqui quando se cadastrarem no sistema</p>
        </Card>
      )}

      <CompanyFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        company={null}
        onSuccess={handleDialogSuccess}
      />

      {selectedCompanyForUser && (
        <AssignExistingUserDialog
          open={assignUserDialogOpen}
          onOpenChange={setAssignUserDialogOpen}
          companyId={selectedCompanyForUser.id}
          companyName={selectedCompanyForUser.name}
          onSuccess={handleAssignUserSuccess}
        />
      )}

      <AlertDialog open={deactivateDialogOpen} onOpenChange={setDeactivateDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Inativar Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja inativar a empresa "{selectedCompanyForAction?.name}"?
              Esta ação irá alterar o status da empresa para "Inativa".
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDeactivate} className="bg-yellow-600 hover:bg-yellow-700">
              Inativar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Empresa</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir permanentemente a empresa "{selectedCompanyForAction?.name}"?
              Esta ação não pode ser desfeita e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir Permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
