import React from 'react';
import { Document, Page, Text, View, StyleSheet, Font, pdf } from '@react-pdf/renderer';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Meeting, MeetingAgenda, MeetingMinutes, MeetingAttachment } from '@/types/meeting';
import { MeetingParticipantWithProfile } from '@/hooks/useMeetingParticipants';

// Registrar fontes para melhor suporte a caracteres especiais
Font.register({
  family: 'Roboto',
  fonts: [
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-light-webfont.ttf',
      fontWeight: 300,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-regular-webfont.ttf',
      fontWeight: 400,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-medium-webfont.ttf',
      fontWeight: 500,
    },
    {
      src: 'https://cdnjs.cloudflare.com/ajax/libs/ink/3.1.10/fonts/Roboto/roboto-bold-webfont.ttf',
      fontWeight: 600,
    },
  ],
});

const styles = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    paddingTop: 35,
    paddingLeft: 35,
    paddingRight: 35,
    paddingBottom: 65,
    lineHeight: 1.5,
  },
  header: {
    fontSize: 20,
    fontWeight: 600,
    marginBottom: 20,
    textAlign: 'center',
    color: '#1f2937',
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 500,
    marginBottom: 10,
    color: '#374151',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
    paddingBottom: 5,
  },
  text: {
    fontSize: 11,
    marginBottom: 5,
    color: '#4b5563',
  },
  boldText: {
    fontWeight: 500,
    color: '#1f2937',
  },
  infoGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  infoItem: {
    flex: 1,
    marginRight: 10,
  },
  agendaItem: {
    marginBottom: 8,
    paddingLeft: 10,
  },
  participantItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    paddingVertical: 3,
  },
  badge: {
    backgroundColor: '#f3f4f6',
    color: '#374151',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    fontSize: 9,
  },
  minutesContent: {
    backgroundColor: '#f9fafb',
    padding: 10,
    borderRadius: 4,
    lineHeight: 1.6,
  },
  attachmentItem: {
    marginBottom: 5,
    paddingVertical: 3,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 35,
    right: 35,
    textAlign: 'center',
    color: '#9ca3af',
    fontSize: 9,
    borderTopWidth: 1,
    borderTopColor: '#e5e7eb',
    paddingTop: 10,
  },
});

interface MeetingPDFDocumentProps {
  meeting: Meeting;
  agenda: MeetingAgenda[];
  minutes: MeetingMinutes | null;
  attachments: MeetingAttachment[];
  participants: MeetingParticipantWithProfile[];
}

const MeetingPDFDocument: React.FC<MeetingPDFDocumentProps> = ({
  meeting,
  agenda,
  minutes,
  attachments,
  participants,
}) => {
  const formatTime = (timeStr: string) => timeStr.slice(0, 5);
  
  const getStatusText = (status: string) => {
    switch (status) {
      case 'Agendada': return 'Agendada';
      case 'Em andamento': return 'Em Andamento';
      case 'Finalizada': return 'Finalizada';
      default: return status;
    }
  };

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        {/* Cabeçalho */}
        <Text style={styles.header}>Relatório da Reunião</Text>
        
        {/* Informações Básicas */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Informações Gerais</Text>
          
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Título: </Text>
                {meeting.title}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Data: </Text>
                {format(new Date(meeting.date), 'dd/MM/yyyy', { locale: ptBR })}
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Horário: </Text>
                {formatTime(meeting.time)}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Duração: </Text>
                {meeting.duration} minutos
              </Text>
            </View>
            <View style={styles.infoItem}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Status: </Text>
                {getStatusText(meeting.status)}
              </Text>
            </View>
          </View>

          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Tipo: </Text>
                {meeting.meeting_type || 'Presencial'}
              </Text>
            </View>
            {meeting.location && (
              <View style={styles.infoItem}>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>Local: </Text>
                  {meeting.location}
                </Text>
              </View>
            )}
          </View>

          {meeting.description && (
            <View>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Descrição: </Text>
              </Text>
              <Text style={styles.text}>{meeting.description}</Text>
            </View>
          )}

          {meeting.meeting_url && (
            <View>
              <Text style={styles.text}>
                <Text style={styles.boldText}>Link da Reunião: </Text>
                {meeting.meeting_url}
              </Text>
            </View>
          )}
        </View>

        {/* Participantes */}
        {participants.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Participantes ({participants.length})</Text>
            {participants.map((participant, index) => (
              <View key={participant.id} style={styles.participantItem}>
                <Text style={styles.text}>
                  {participant.profiles?.full_name || participant.profiles?.email || 'Usuário'}
                </Text>
                <View style={{ flexDirection: 'row', gap: 5 }}>
                  <Text style={[styles.text, styles.badge]}>
                    {participant.role === 'organizer' ? 'Organizador' : 'Participante'}
                  </Text>
                  <Text style={[styles.text, styles.badge, { 
                    backgroundColor: participant.attended === true ? '#dcfce7' : 
                                   participant.attended === false ? '#fef2f2' : '#f3f4f6',
                    color: participant.attended === true ? '#166534' : 
                           participant.attended === false ? '#dc2626' : '#374151'
                  }]}>
                    {participant.attended === true ? 'Presente' : 
                     participant.attended === false ? 'Ausente' : 'Pendente'}
                  </Text>
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Pauta */}
        {agenda.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pauta da Reunião</Text>
            {agenda.map((item, index) => (
              <View key={item.id} style={styles.agendaItem}>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>{index + 1}. {item.title}</Text>
                </Text>
                {item.description && (
                  <Text style={[styles.text, { marginLeft: 15 }]}>
                    {item.description}
                  </Text>
                )}
              </View>
            ))}
          </View>
        )}

        {/* Ata da Reunião */}
        {minutes && minutes.content && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Ata da Reunião</Text>
            <View style={styles.minutesContent}>
              <Text style={styles.text}>{minutes.content}</Text>
            </View>
          </View>
        )}

        {/* Anexos */}
        {attachments.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Anexos ({attachments.length})</Text>
            {attachments.map((attachment, index) => (
              <View key={attachment.id} style={styles.attachmentItem}>
                <Text style={styles.text}>
                  <Text style={styles.boldText}>{index + 1}. </Text>
                  {attachment.name}
                </Text>
                <Text style={[styles.text, { marginLeft: 15, fontSize: 9 }]}>
                  Tipo: {attachment.type} • Tamanho: {attachment.file_size ? `${Math.round(attachment.file_size / 1024)} KB` : 'N/A'}
                </Text>
              </View>
            ))}
          </View>
        )}

        {/* Rodapé */}
        <Text style={styles.footer}>
          Relatório gerado em {format(new Date(), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
        </Text>
      </Page>
    </Document>
  );
};

export const generateMeetingPDF = async ({
  meeting,
  agenda,
  minutes,
  attachments,
  participants,
}: MeetingPDFDocumentProps) => {
  const doc = (
    <MeetingPDFDocument
      meeting={meeting}
      agenda={agenda}
      minutes={minutes}
      attachments={attachments}
      participants={participants}
    />
  );

  const blob = await pdf(doc).toBlob();
  return blob;
};

export const downloadMeetingPDF = async (
  data: MeetingPDFDocumentProps,
  filename?: string
) => {
  try {
    const blob = await generateMeetingPDF(data);
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename || `reuniao-${data.meeting.title.replace(/[^a-zA-Z0-9]/g, '_')}-${format(new Date(data.meeting.date), 'yyyy-MM-dd')}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  } catch (error) {
    console.error('Erro ao gerar PDF:', error);
    throw error;
  }
};