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
  // Load initial state from sessionStorage
  const getInitialState = (): LeadDialogState => {
    try {
      const saved = sessionStorage.getItem('leadDialogState');
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      console.error('Error loading lead dialog state:', error);
    }
    return {
      isOpen: false,
      formData: initialFormData,
    };
  };

  const [state, setState] = useState<LeadDialogState>(getInitialState);

  // Save state to sessionStorage whenever it changes
  React.useEffect(() => {
    try {
      sessionStorage.setItem('leadDialogState', JSON.stringify(state));
    } catch (error) {
      console.error('Error saving lead dialog state:', error);
    }
  }, [state]);

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
    // Clear from sessionStorage when resetting
    try {
      sessionStorage.removeItem('leadDialogState');
    } catch (error) {
      console.error('Error clearing lead dialog state:', error);
    }
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