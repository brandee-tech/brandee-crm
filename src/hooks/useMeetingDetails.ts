import { useState } from 'react';

// Simplified hook - using empty data without database dependency
export const useMeetingDetails = (meetingId: string | null) => {
  const [meeting, setMeeting] = useState(null);
  const [agenda, setAgenda] = useState([]);
  const [minutes, setMinutes] = useState(null);
  const [attachments, setAttachments] = useState([]);

  const updateMeeting = async (updates: any) => {
    console.log('Meeting would be updated:', updates);
    return Promise.resolve();
  };

  const addAgendaItem = async (agendaItem: any) => {
    console.log('Agenda item would be added:', agendaItem);
    return Promise.resolve();
  };

  const updateMinutes = async (content: string) => {
    console.log('Minutes would be updated:', content);
    return Promise.resolve();
  };

  const uploadAttachment = async (file: File) => {
    console.log('Attachment would be uploaded:', file.name);
    return Promise.resolve();
  };

  return {
    meeting,
    agenda,
    minutes,
    attachments,
    loading: false,
    updateMeeting,
    addAgendaItem,
    updateMinutes,
    uploadAttachment
  };
};