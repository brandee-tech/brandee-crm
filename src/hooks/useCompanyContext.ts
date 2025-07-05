import { createContext, useContext } from 'react';

interface CompanyContextType {
  companyId: string | null;
  hasCompany: boolean;
}

export const CompanyContext = createContext<CompanyContextType>({
  companyId: null,
  hasCompany: false
});

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  return context;
};