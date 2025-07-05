import React, { Component, ErrorInfo, ReactNode } from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center p-4">
          <Alert className="max-w-lg">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Oops! Algo deu errado</AlertTitle>
            <AlertDescription className="mt-4">
              <p className="mb-4">
                {this.state.error?.message?.includes('realtime') || this.state.error?.message?.includes('subscription')
                  ? 'Ocorreu um erro na conexão em tempo real. Tente recarregar a página.'
                  : 'Ocorreu um erro inesperado. Tente recarregar a página.'}
              </p>
              {process.env.NODE_ENV === 'development' && this.state.error && (
                <details className="mb-4 text-sm bg-gray-100 p-2 rounded">
                  <summary>Detalhes do erro (desenvolvimento)</summary>
                  <pre className="mt-2 text-xs">{this.state.error.stack}</pre>
                </details>
              )}
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    this.setState({ hasError: false, error: undefined });
                  }}
                  variant="outline"
                  className="flex-1"
                >
                  Tentar Novamente
                </Button>
                <Button 
                  onClick={() => window.location.reload()}
                  className="flex-1"
                >
                  Recarregar Página
                </Button>
              </div>
            </AlertDescription>
          </Alert>
        </div>
      );
    }

    return this.props.children;
  }
}