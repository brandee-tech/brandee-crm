
import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent } from '@/components/ui/card';
import {
  Building2,
  Users,
  Settings as SettingsIcon,
  Shield,
  Mail,
  MessageCircle,
  Key
} from 'lucide-react';
import { CompanyInfoSettings } from './settings/CompanyInfoSettings';

import { UserRoleManagement } from './settings/UserRoleManagement';


import { UserGoalsSettings } from './settings/UserGoalsSettings';
import { ApiKeysSettings } from './settings/ApiKeysSettings';
import { UserWhatsAppSettings } from './whatsapp/UserWhatsAppSettings';
import { CompanyWhatsAppInstances } from './whatsapp/CompanyWhatsAppInstances';
import { PrivacySettings } from './settings/PrivacySettings';
import { usePermissions } from '@/hooks/usePermissions';

export const Settings = () => {
  const [activeTab, setActiveTab] = useState('company');
  const { isAdmin } = usePermissions();

  const tabs = [
    {
      id: 'company',
      label: 'Empresa',
      icon: Building2,
      component: CompanyInfoSettings,
    },
    {
      id: 'users',
      label: 'Usuários & Cargos',
      icon: Users,
      component: UserRoleManagement,
    },
    {
      id: 'goals',
      label: 'Metas',
      icon: Shield,
      component: UserGoalsSettings,
    },

    {
      id: 'apikeys',
      label: 'API & Chaves',
      icon: Key,
      component: ApiKeysSettings,
    },
    {
      id: 'privacy',
      label: 'Privacidade',
      icon: Shield,
      component: PrivacySettings,
    },

  ];

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Configurações</h1>
        <p className="text-gray-600 mt-2">
          Gerencie as configurações da sua empresa e sistema
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="h-auto grid w-full" style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0, 1fr))` }}>
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <TabsTrigger
                key={tab.id}
                value={tab.id}
                className="flex items-center gap-2 p-2"
              >
                <Icon className="w-4 h-4" />
                <span className="text-sm">{tab.label}</span>
              </TabsTrigger>
            );
          })}
        </TabsList>

        {tabs.map((tab) => {
          const Component = tab.component;
          return (
            <TabsContent key={tab.id} value={tab.id} className="space-y-4">
              <Component />
            </TabsContent>
          );
        })}
      </Tabs>
    </div>
  );
};
