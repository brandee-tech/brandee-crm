import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useSaasProfiles } from '@/hooks/useSaasProfiles';
import { useToast } from '@/hooks/use-toast';
import { Search, User } from 'lucide-react';

interface AssignExistingUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  companyId: string;
  companyName: string;
  onSuccess: () => void;
}

export const AssignExistingUserDialog = ({ 
  open, 
  onOpenChange, 
  companyId, 
  companyName, 
  onSuccess 
}: AssignExistingUserDialogProps) => {
  const [selectedUserId, setSelectedUserId] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);

  const { profiles, updateProfile } = useSaasProfiles();
  const { toast } = useToast();

  // Filtrar usuários que podem ser atribuídos (sem empresa ou de empresa diferente)
  const availableUsers = profiles.filter(user => {
    if (user.company_id === companyId) return false; // Já pertence à empresa
    
    const matchesSearch = searchTerm === '' || 
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedUserId) {
      toast({
        title: "Erro",
        description: "Selecione um usuário",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      await updateProfile(selectedUserId, { company_id: companyId });
      onSuccess();
      onOpenChange(false);
      setSelectedUserId('');
      setSearchTerm('');
      
      toast({
        title: "Sucesso",
        description: "Usuário atribuído à empresa com sucesso"
      });
    } catch (error) {
      // Erro já tratado no hook
    } finally {
      setLoading(false);
    }
  };

  const selectedUser = profiles.find(user => user.id === selectedUserId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-full max-w-[95vw] sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Atribuir Usuário Existente</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Empresa</Label>
            <div className="p-2 bg-muted rounded-md">
              <div className="font-medium">{companyName}</div>
              <div className="text-sm text-muted-foreground">
                Selecione um usuário para atribuir a esta empresa
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="search">Buscar Usuário</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar por nome ou email..."
                className="pl-10"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="user">Usuário *</Label>
            <Select 
              value={selectedUserId} 
              onValueChange={setSelectedUserId}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um usuário" />
              </SelectTrigger>
              <SelectContent>
                {availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-muted-foreground">
                    {searchTerm ? 'Nenhum usuário encontrado' : 'Todos os usuários já estão atribuídos'}
                  </div>
                ) : (
                  availableUsers.map(user => (
                    <SelectItem key={user.id} value={user.id}>
                      {user.full_name || 'Nome não informado'}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>

          {selectedUser && (
            <div className="p-3 bg-muted rounded-md">
              <div className="text-sm font-medium">Usuário selecionado:</div>
              <div className="text-sm text-muted-foreground">
                {selectedUser.full_name || 'Nome não informado'} ({selectedUser.email})
              </div>
              {selectedUser.companies?.name && (
                <div className="text-xs text-muted-foreground mt-1">
                  Será transferido de: {selectedUser.companies.name}
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)} className="w-full sm:w-auto">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={loading || !selectedUserId || availableUsers.length === 0}
              className="w-full sm:w-auto"
            >
              {loading ? 'Atribuindo...' : 'Atribuir Usuário'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};