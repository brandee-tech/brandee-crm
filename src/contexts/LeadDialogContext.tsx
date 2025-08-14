import React, { createContext, useContext, useState, ReactNode } from 'react';

interface LeadDialogState {
  isOpen: boolean;
  formData: {
    name: string;
    email: string;
    phone: string;
    status: string;
    source: string;
    partner_id: string;
    temperature: string;
    product_id: string;
    product_name: string;
    product_value: string;
    tags: Array<{ id: string; name: string; color: string }>;
  };
}

interface LeadDialogContextType {
  state: LeadDialogState;
  openDialog: () => void;
  closeDialog: () => void;
  updateFormData: (data: Partial<LeadDialogState['formData']>) => void;
  resetFormData: () => void;
}

const initialFormData = {
  name: '',
  email: '',
  phone: '',
  status: '',
  source: '',
  partner_id: '',
  temperature: 'Frio',
  product_id: '',
  product_name: '',
  product_value: '',
  tags: [],
};

const LeadDialogContext = createContext<LeadDialogContextType | undefined>(undefined);

export const LeadDialogProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<LeadDialogState>({
    isOpen: false,
    formData: initialFormData,
  });

  const openDialog = () => {
    setState(prev => ({ ...prev, isOpen: true }));
  };

  const closeDialog = () => {
    setState(prev => ({ ...prev, isOpen: false }));
  };

  const updateFormData = (data: Partial<LeadDialogState['formData']>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  };

  const resetFormData = () => {
    setState(prev => ({
      ...prev,
      formData: initialFormData
    }));
  };

  return (
    <LeadDialogContext.Provider value={{
      state,
      openDialog,
      closeDialog,
      updateFormData,
      resetFormData
    }}>
      {children}
    </LeadDialogContext.Provider>
  );
};

export const useLeadDialog = () => {
  const context = useContext(LeadDialogContext);
  if (context === undefined) {
    throw new Error('useLeadDialog must be used within a LeadDialogProvider');
  }
  return context;
};