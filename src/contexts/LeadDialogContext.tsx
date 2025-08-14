import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';

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
  forceClose: () => void;
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

const STORAGE_KEY = 'leadDialogState';

const LeadDialogContext = createContext<LeadDialogContextType | undefined>(undefined);

export const LeadDialogProvider = ({ children }: { children: ReactNode }) => {
  // Load initial state from sessionStorage with better error handling
  const getInitialState = useCallback((): LeadDialogState => {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        // Validar estrutura para evitar problemas
        if (parsed && typeof parsed === 'object' && parsed.formData) {
          return {
            isOpen: Boolean(parsed.isOpen),
            formData: { ...initialFormData, ...parsed.formData }
          };
        }
      }
    } catch (error) {
      console.error('Error loading lead dialog state:', error);
      // Limpar storage corrompido
      try {
        sessionStorage.removeItem(STORAGE_KEY);
      } catch (e) {
        console.error('Error clearing corrupted storage:', e);
      }
    }
    return {
      isOpen: false,
      formData: initialFormData,
    };
  }, []);

  const [state, setState] = useState<LeadDialogState>(getInitialState);

  // Save state to sessionStorage with better logic
  useEffect(() => {
    try {
      // Só salvar se tiver dados relevantes
      const hasFormData = Object.entries(state.formData).some(([key, value]) => {
        if (key === 'temperature') return value !== 'Frio'; // Valor padrão
        if (key === 'tags') return Array.isArray(value) && value.length > 0;
        return value !== '' && value !== null && value !== undefined;
      });
      
      if (state.isOpen || hasFormData) {
        sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      } else {
        // Se não há dados relevantes, limpar o storage
        sessionStorage.removeItem(STORAGE_KEY);
      }
    } catch (error) {
      console.error('Error saving lead dialog state:', error);
    }
  }, [state]);

  // Listener para mudanças de aba/página
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.hidden) {
        // Página escondida - salvar estado atual
        try {
          if (state.isOpen) {
            sessionStorage.setItem(STORAGE_KEY, JSON.stringify(state));
          }
        } catch (error) {
          console.error('Error saving state on visibility change:', error);
        }
      } else {
        // Página visível novamente - recuperar estado se necessário
        try {
          const saved = sessionStorage.getItem(STORAGE_KEY);
          if (saved) {
            const parsed = JSON.parse(saved);
            if (parsed && parsed.isOpen && !state.isOpen) {
              setState(parsed);
            }
          }
        } catch (error) {
          console.error('Error restoring state on visibility change:', error);
        }
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [state.isOpen]);

  const openDialog = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: true }));
  }, []);

  const closeDialog = useCallback(() => {
    setState(prev => ({ ...prev, isOpen: false }));
  }, []);

  const updateFormData = useCallback((data: Partial<LeadDialogState['formData']>) => {
    setState(prev => ({
      ...prev,
      formData: { ...prev.formData, ...data }
    }));
  }, []);

  const resetFormData = useCallback(() => {
    setState(prev => ({
      ...prev,
      isOpen: false,
      formData: initialFormData
    }));
    // Clear from sessionStorage when resetting
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing lead dialog state:', error);
    }
  }, []);

  const forceClose = useCallback(() => {
    setState({
      isOpen: false,
      formData: initialFormData
    });
    try {
      sessionStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Error force clearing lead dialog state:', error);
    }
  }, []);

  return (
    <LeadDialogContext.Provider value={{
      state,
      openDialog,
      closeDialog,
      updateFormData,
      resetFormData,
      forceClose
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