
import { useState } from 'react';
import { Plus, Search, Filter, Edit2, Trash2, Phone, Mail, MapPin } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { RealtimeBadge } from '@/components/ui/realtime-badge';
import { useContacts } from '@/hooks/useContacts';
import { EditContactDialog } from './EditContactDialog';
import { AddContactDialog } from './AddContactDialog';

export const Contacts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [editingContact, setEditingContact] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  const { contacts, loading, isUpdating, deleteContact } = useContacts();

  const filteredContacts = contacts.filter(contact =>
    contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.companies?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (contact.position || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Tem certeza que deseja excluir este contato?')) {
      await deleteContact(id);
    }
  };

  const handleEdit = (contact: any) => {
    setEditingContact(contact);
    setEditDialogOpen(true);
  };

  if (loading) {
    return (
      <div className="py-8 flex items-center justify-center">
        <div className="text-lg">Carregando contatos...</div>
      </div>
    );
  }

  return (
    <div className="py-8 space-y-6">
      <div className="flex justify-between items-center px-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Contatos</h1>
          <p className="text-gray-600 mt-1">Gerencie sua rede de contatos</p>
        </div>
        <div className="flex items-center gap-4">
          <RealtimeBadge isUpdating={isUpdating} />
          <Button 
            className="bg-blue-600 hover:bg-blue-700"
            onClick={() => setAddDialogOpen(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Novo Contato
          </Button>
        </div>
      </div>

      <div className="px-8">
        <Card className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  placeholder="Buscar contatos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Button variant="outline">
              <Filter className="w-4 h-4 mr-2" />
              Filtros Avançados
            </Button>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-8">
        {filteredContacts.map((contact) => (
          <Card key={contact.id} className="p-6 hover:shadow-lg transition-shadow duration-200">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12">
                  <AvatarImage src="" />
                  <AvatarFallback className="bg-blue-100 text-blue-600 font-semibold">
                    {getInitials(contact.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-gray-900">{contact.name}</h3>
                  <p className="text-sm text-gray-500">{contact.position}</p>
                </div>
              </div>
              <div className="flex gap-1">
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => handleEdit(contact)}
                >
                  <Edit2 className="w-4 h-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-red-600 hover:text-red-700"
                  onClick={() => handleDelete(contact.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <p className="font-medium text-gray-900">{contact.companies?.name || 'Empresa não informada'}</p>
              </div>

              <div className="space-y-2 text-sm text-gray-600">
                {contact.email && (
                  <div className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    <span>{contact.email}</span>
                  </div>
                )}
                {contact.phone && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    <span>{contact.phone}</span>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-500">
                  Criado em: {formatDate(contact.created_at)}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                {contact.phone && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Phone className="w-4 h-4 mr-2" />
                    Ligar
                  </Button>
                )}
                {contact.email && (
                  <Button variant="outline" size="sm" className="flex-1">
                    <Mail className="w-4 h-4 mr-2" />
                    Email
                  </Button>
                )}
              </div>
            </div>
          </Card>
        ))}
      </div>

      {filteredContacts.length === 0 && (
        <div className="px-8">
          <Card className="p-12 text-center">
            <p className="text-gray-500 text-lg">Nenhum contato encontrado</p>
            <p className="text-gray-400 mt-2">Tente ajustar a busca ou adicionar novos contatos</p>
          </Card>
        </div>
      )}

      <EditContactDialog
        contact={editingContact}
        open={editDialogOpen}
        onOpenChange={setEditDialogOpen}
      />

      <AddContactDialog
        open={addDialogOpen}
        onOpenChange={setAddDialogOpen}
      />
    </div>
  );
};
