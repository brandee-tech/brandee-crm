import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Calendar, Target, Building2 } from 'lucide-react';

interface InitialSetupCardProps {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  actionLabel: string;
  onAction: () => void;
  count?: number;
}

export const InitialSetupCard = ({ 
  title, 
  description, 
  icon: Icon, 
  actionLabel, 
  onAction,
  count = 0 
}: InitialSetupCardProps) => {
  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
              <Icon className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <CardTitle className="text-lg">{title}</CardTitle>
              <p className="text-sm text-gray-500">{count} items</p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-600 text-sm">{description}</p>
        <Button onClick={onAction} size="sm" className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          {actionLabel}
        </Button>
      </CardContent>
    </Card>
  );
};