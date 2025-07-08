import * as XLSX from 'xlsx';
import { useToast } from '@/hooks/use-toast';

// Função utilitária para converter dados em Excel
export const convertToExcel = (data: any[], headers: { [key: string]: string }, sheetName: string = 'Dados') => {
  // Mapear dados usando as chaves dos headers
  const mappedData = data.map(row => {
    const mappedRow: any = {};
    Object.keys(headers).forEach(key => {
      mappedRow[headers[key]] = row[key] || '';
    });
    return mappedRow;
  });

  // Criar workbook e worksheet
  const workbook = XLSX.utils.book_new();
  const worksheet = XLSX.utils.json_to_sheet(mappedData);

  // Configurar larguras das colunas automaticamente
  const colWidths = Object.values(headers).map(header => ({ wch: Math.max(header.length, 15) }));
  worksheet['!cols'] = colWidths;

  // Adicionar worksheet ao workbook
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  
  return workbook;
};

// Função para fazer download do Excel
export const downloadExcel = (workbook: XLSX.WorkBook, filename: string) => {
  try {
    // Gerar buffer do Excel
    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    
    // Criar blob e download
    const blob = new Blob([excelBuffer], { 
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.xlsx') ? filename : `${filename}.xlsx`;
    a.click();
    URL.revokeObjectURL(url);
    
    return true;
  } catch (error) {
    console.error('Erro ao fazer download do Excel:', error);
    return false;
  }
};

// Função para ler arquivos Excel
export const parseExcel = (file: File): Promise<any[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target?.result as ArrayBuffer);
        const workbook = XLSX.read(data, { type: 'array' });
        
        // Pegar a primeira planilha
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        
        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
        
        // Primeira linha são os headers
        const headers = jsonData[0] as string[];
        const rows = jsonData.slice(1) as any[][];
        
        // Função para normalizar valores do Excel
        const normalizeExcelValue = (value: any): string => {
          if (value === null || value === undefined || value === '') {
            return '';
          }
          // Converter números para string, mantendo formatação original
          return String(value).trim();
        };

        // Converter para objetos
        const result = rows.map(row => {
          const obj: any = {};
          headers.forEach((header, index) => {
            // Normalizar nomes das colunas
            const normalized = header?.toLowerCase().trim();
            let key = header;
            
            if (normalized?.includes('nome') || normalized?.includes('name')) key = 'nome';
            else if (normalized?.includes('email') || normalized?.includes('e-mail')) key = 'email';
            else if (normalized?.includes('telefone') || normalized?.includes('phone') || normalized?.includes('celular')) key = 'telefone';
            else if (normalized?.includes('status')) key = 'status';
            else if (normalized?.includes('origem') || normalized?.includes('source')) key = 'origem';
            
            obj[key] = normalizeExcelValue(row[index]);
          });
          return obj;
        }).filter(row => row.nome && row.nome.trim() !== ''); // Filtrar linhas vazias
        
        resolve(result);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsArrayBuffer(file);
  });
};

// Função para gerar template Excel
export const generateExcelTemplate = (templateData: { headers: string[], sampleData: any[] }, filename: string) => {
  const workbook = XLSX.utils.book_new();
  
  // Criar planilha com dados de exemplo
  const worksheet = XLSX.utils.aoa_to_sheet([
    templateData.headers,
    ...templateData.sampleData
  ]);
  
  // Configurar larguras das colunas
  const colWidths = templateData.headers.map(header => ({ wch: Math.max(header.length, 15) }));
  worksheet['!cols'] = colWidths;
  
  // Adicionar planilha
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Template');
  
  // Criar planilha de instruções
  const instructionsData = [
    ['INSTRUÇÕES PARA IMPORTAÇÃO'],
    [''],
    ['1. Preencha os dados na planilha "Template"'],
    ['2. Nome é obrigatório'],
    ['3. Email deve ter formato válido (exemplo@dominio.com)'],
    ['4. Status pode ser: Quente, Morno, Frio'],
    ['5. Origem pode ser: Instagram, Facebook, WhatsApp, Site, etc.'],
    ['6. Salve o arquivo e faça a importação'],
    [''],
    ['COLUNAS OBRIGATÓRIAS:'],
    ['- Nome: Nome completo do lead'],
    [''],
    ['COLUNAS OPCIONAIS:'],
    ['- Email: Email de contato'],
    ['- Telefone: Telefone com DDD'],
    ['- Status: Status do lead (padrão: Frio)'],
    ['- Origem: Origem do lead']
  ];
  
  const instructionsSheet = XLSX.utils.aoa_to_sheet(instructionsData);
  instructionsSheet['!cols'] = [{ wch: 40 }];
  XLSX.utils.book_append_sheet(workbook, instructionsSheet, 'Instruções');
  
  return downloadExcel(workbook, filename);
};

// Hook para usar as funções de Excel com toast
export const useExcelUtils = () => {
  const { toast } = useToast();
  
  const downloadExcelWithToast = (workbook: XLSX.WorkBook, filename: string, successMessage: string = 'Arquivo Excel exportado com sucesso!') => {
    const success = downloadExcel(workbook, filename);
    
    if (success) {
      toast({
        title: "Sucesso",
        description: successMessage
      });
    } else {
      toast({
        title: "Erro",
        description: "Erro ao exportar arquivo Excel",
        variant: "destructive"
      });
    }
  };
  
  const parseExcelWithToast = async (file: File): Promise<any[] | null> => {
    try {
      const result = await parseExcel(file);
      return result;
    } catch (error) {
      toast({
        title: "Erro",
        description: `Erro ao ler arquivo Excel: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return null;
    }
  };
  
  return {
    convertToExcel,
    downloadExcelWithToast,
    parseExcelWithToast,
    generateExcelTemplate
  };
};