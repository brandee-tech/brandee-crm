
import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useAllCompanies } from '@/hooks/useAllCompanies';
import { CompanyFormDialog } from './CompanyFormDialog';
import { Building2, Users, Phone, Globe, MapPin, Calendar, Plus, Edit } from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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
  const { companies, loading, updateCompanyStatus, refetch } = useAllCompanies();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingCompany, setEditingCompany] = useState<CompanyData | null>(null);

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
    setEditingCompany(null);
    setDialogOpen(true);
  };

  const handleEditCompany = (company: CompanyData) => {
    setEditingCompany(company);
    setDialogOpen(true);
  };

  const handleDialogSuccess = () => {
    refetch();
  };

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gerenciamento de Empresas</h1>
          <p className="text-gray-600 mt-2">
            Visualize e gerencie todas as empresas cadastradas no sistema
          </p>
        </div>
        <Button onClick={handleAddCompany} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Adicionar Empresa
        </Button>
      </div>

      {/* Estatísticas Rápidas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">Total</span>
            </div>
            <div className="text-2xl font-bold mt-1">{companies.length}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-green-600" />
              <span className="text-sm text-gray-600">Total Usuários</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {companies.reduce((sum, company) => sum + company.user_count, 0)}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-purple-600" />
              <span className="text-sm text-gray-600">Ativas</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {companies.filter(c => c.status?.toLowerCase() === 'ativa').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Building2 className="h-4 w-4 text-orange-600" />
              <span className="text-sm text-gray-600">Prospects</span>
            </div>
            <div className="text-2xl font-bold mt-1">
              {companies.filter(c => c.status?.toLowerCase() === 'prospect').length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Empresas */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {companies.map((company) => (
          <Card key={company.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{company.name}</CardTitle>
                  <CardDescription>{company.domain}</CardDescription>
                </div>
                <div className="flex flex-col gap-1">
                  <Badge className={getStatusColor(company.status)}>
                    {company.status || 'Não definido'}
                  </Badge>
                  <Badge className={getPlanColor(company.plan)}>
                    {company.plan || 'Basic'}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="flex items-center gap-2">
                  <Users className="w-4 h-4 text-blue-600" />
                  <span>{company.user_count} usuários</span>
                </div>
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-green-600" />
                  <span>{company.leads_count} leads</span>
                </div>
              </div>

              {company.phone && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Phone className="w-4 h-4" />
                  {company.phone}
                </div>
              )}

              {company.website && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Globe className="w-4 h-4" />
                  {company.website}
                </div>
              )}

              {company.location && (
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <MapPin className="w-4 h-4" />
                  {company.location}
                </div>
              )}

              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Calendar className="w-4 h-4" />
                Criada em {new Date(company.created_at).toLocaleDateString('pt-BR')}
              </div>

              <div className="pt-2 border-t space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Select 
                    value={company.status || ''} 
                    onValueChange={(value) => updateCompanyStatus(company.id, value)}
                  >
                    <SelectTrigger className="h-8 text-xs">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Prospect">Prospect</SelectItem>
                      <SelectItem value="Ativa">Ativa</SelectItem>
                      <SelectItem value="Inativa">Inativa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full"
                  onClick={() => handleEditCompany(company)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar Empresa
                </Button>
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
        company={editingCompany}
        onSuccess={handleDialogSuccess}
      />
    </div>
  );
};
