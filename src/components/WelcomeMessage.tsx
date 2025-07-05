import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, Users, Calendar, Target, Plus, ArrowRight } from 'lucide-react';
import { useCurrentUser } from '@/hooks/useCurrentUser';
import { InitialSetupCard } from '@/components/InitialSetupCard';

export const WelcomeMessage = () => {
  const { userInfo } = useCurrentUser();

  if (!userInfo) return null;

  const handleAction = (action: string) => {
    console.log(`Ação: ${action}`);
    // Aqui seria implementada a navegação ou abertura de modais
  };

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="text-2xl text-blue-900">
            🎉 Bem-vindo ao WeCRM, {userInfo.full_name}!
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-blue-800">
            Sua empresa <strong>{userInfo.company_name}</strong> foi configurada com sucesso! 
            Agora você pode começar a usar o sistema. Vamos começar com algumas ações básicas:
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <InitialSetupCard
              title="Leads"
              description="Comece adicionando seus primeiros leads para começar a gerenciar suas oportunidades de vendas."
              icon={Users}
              actionLabel="Adicionar Lead"
              onAction={() => handleAction('add-lead')}
              count={0}
            />
            
            <InitialSetupCard
              title="Agendamentos"
              description="Organize suas reuniões e compromissos para não perder nenhuma oportunidade."
              icon={Calendar}
              actionLabel="Criar Agendamento"
              onAction={() => handleAction('add-appointment')}
              count={0}
            />
            
            <InitialSetupCard
              title="Tarefas"
              description="Gerencie suas atividades diárias e mantenha sua produtividade em alta."
              icon={Target}
              actionLabel="Nova Tarefa"
              onAction={() => handleAction('add-task')}
              count={0}
            />
            
            <InitialSetupCard
              title="Equipe"
              description="Convide outros usuários para sua empresa e configure as permissões."
              icon={Building2}
              actionLabel="Convidar Usuário"
              onAction={() => handleAction('invite-user')}
              count={1}
            />
          </div>

          <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                <ArrowRight className="w-3 h-3 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-green-900 mb-1">Próximos passos</h4>
                <p className="text-sm text-green-800">
                  Use o menu lateral para navegar entre as diferentes seções do sistema. 
                  Você pode configurar suas preferências em <strong>Configurações</strong> e visualizar 
                  relatórios em <strong>Relatórios</strong>.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};