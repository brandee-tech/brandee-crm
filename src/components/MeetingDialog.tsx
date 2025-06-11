
import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useMeetings } from '@/hooks/useMeetings';
import { useAuth } from '@/hooks/useAuth';
import { useProfiles } from '@/hooks/useProfiles';
import { Meeting } from '@/types/meeting';

const formSchema = z.object({
  title: z.string().min(1, 'Título é obrigatório'),
  description: z.string().optional(),
  date: z.string().min(1, 'Data é obrigatória'),
  time: z.string().min(1, 'Horário é obrigatório'),
  duration: z.number().min(15, 'Duração mínima de 15 minutos'),
});

interface MeetingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  meeting?: Meeting;
}

export const MeetingDialog = ({ open, onOpenChange, meeting }: MeetingDialogProps) => {
  const { createMeeting, updateMeeting } = useMeetings();
  const { user } = useAuth();
  const { profiles } = useProfiles();

  const currentUserProfile = profiles.find(p => p.id === user?.id);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: '',
      description: '',
      date: '',
      time: '',
      duration: 60,
    },
  });

  useEffect(() => {
    if (meeting) {
      form.reset({
        title: meeting.title,
        description: meeting.description || '',
        date: meeting.date,
        time: meeting.time,
        duration: meeting.duration,
      });
    } else {
      form.reset({
        title: '',
        description: '',
        date: '',
        time: '',
        duration: 60,
      });
    }
  }, [meeting, form]);

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      if (meeting) {
        await updateMeeting.mutateAsync({
          id: meeting.id,
          title: values.title,
          description: values.description || '',
          date: values.date,
          time: values.time,
          duration: values.duration,
        });
      } else {
        await createMeeting.mutateAsync({
          title: values.title,
          description: values.description || '',
          date: values.date,
          time: values.time,
          duration: values.duration,
          company_id: currentUserProfile?.company_id || '',
          created_by: user?.id || '',
          status: 'Agendada',
        });
      }
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error saving meeting:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>
            {meeting ? 'Editar Reunião' : 'Nova Reunião'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título</FormLabel>
                  <FormControl>
                    <Input placeholder="Ex: Reunião de planejamento" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Descreva o objetivo da reunião"
                      rows={3}
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Horário</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duração (minutos)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      min="15"
                      step="15"
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => onOpenChange(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit"
                disabled={createMeeting.isPending || updateMeeting.isPending}
              >
                {meeting ? 'Atualizar' : 'Criar'} Reunião
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
