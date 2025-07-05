-- FASE 1: Configurar realtime para todas as tabelas necessárias

-- Configurar REPLICA IDENTITY FULL para capturar mudanças completas
ALTER TABLE public.leads REPLICA IDENTITY FULL;
ALTER TABLE public.appointments REPLICA IDENTITY FULL;
ALTER TABLE public.tasks REPLICA IDENTITY FULL;
ALTER TABLE public.contacts REPLICA IDENTITY FULL;
ALTER TABLE public.meetings REPLICA IDENTITY FULL;
ALTER TABLE public.scripts REPLICA IDENTITY FULL;
ALTER TABLE public.follow_ups REPLICA IDENTITY FULL;
ALTER TABLE public.pipeline_columns REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_agendas REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_participants REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_minutes REPLICA IDENTITY FULL;
ALTER TABLE public.meeting_attachments REPLICA IDENTITY FULL;
ALTER TABLE public.appointment_records REPLICA IDENTITY FULL;

-- Adicionar tabelas à publicação supabase_realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.leads;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.tasks;
ALTER PUBLICATION supabase_realtime ADD TABLE public.contacts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meetings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.scripts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.follow_ups;
ALTER PUBLICATION supabase_realtime ADD TABLE public.pipeline_columns;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_agendas;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_participants;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_minutes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.meeting_attachments;
ALTER PUBLICATION supabase_realtime ADD TABLE public.appointment_records;