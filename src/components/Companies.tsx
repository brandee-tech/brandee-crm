
import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Building2, Users, DollarSign } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useCompanies } from '@/hooks/useCompanies';

export const Companies = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const { companies, loading, deleteCompany } = useCompanies();

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Ativo':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'Prospect':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      case 'Inativo':
        return 'bg-gray-100 text-gray-700 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-200';
    }
  };

  const filteredCompanies = companies.filter(company => {
    const matchesSearch = company.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (company.industry || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'Todos' || company.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir esta empresa?')) {
      await deleteCompany(id);
    }
  };

  if (loading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <div className="text-lg">Carregando empresas...</div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Empresas</h1>
          <p className="text-gray-600 mt-1">Gerencie suas contas empresariais</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Empresa
        </Button>
      </div>

      {/* Filtros */}
      <Card className="p-6">
        <div className="flex flex-col md:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar empresas..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="Todos">Todos os Status</option>
              <option value="Ativo">Ativo</option>
              <option value="Prospect">Prospect</option>
              <option value="Inativo">Inativo</option>
            </select>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
          </div>
        </div>
      </Card>

      {/* Grid de Empresas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredCompanies.map((company) => (
          <Card key={company.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{company.name}</h3>
                  <p className="text-sm text-gray-500">{company.industry}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getStatusColor(company.status || 'Prospect')}>{company.status || 'Prospect'}</Badge>
                <div className="flex gap-1">
                  <Button variant="ghost" size="sm">
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="text-red-600 hover:text-red-700"
                    onClick={() => handleDelete(company.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Tamanho</p>
                  <p className="font-medium text-gray-900">{company.size || 'N/A'} funcionários</p>
                </div>
                <div>
                  <p className="text-gray-500">Receita</p>
                  <p className="font-medium text-gray-900">{company.revenue || 'N/A'}</p>
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-100">
                <div className="flex gap-4 text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Users className="w-4 h-4" />
                    <span>0 contatos</span>
                  </div>
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>0 negócios</span>
                  </div>
                </div>
              </div>

              <div className="text-sm text-gray-500">
                <p>{company.location}</p>
                <p>{company.website}</p>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredCompanies.length === 0 && (
        <Card className="p-12 text-center">
          <p className="text-gray-500 text-lg">Nenhuma empresa encontrada</p>
          <p className="text-gray-400 mt-2">Tente ajustar os filtros ou adicionar novas empresas</p>
        </Card>
      )}
    </div>
  );
};
