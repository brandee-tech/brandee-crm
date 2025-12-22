
import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Building2, Eye, EyeOff } from 'lucide-react';

const Auth = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Erro ao fazer login',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Login realizado com sucesso!',
        description: 'Bem-vindo ao We CRM',
      });
      navigate('/');
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-white flex items-center justify-center p-4">
      <div className="w-full max-w-[400px] space-y-8">
        <div className="flex items-center gap-2 mb-12">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
            <Building2 className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight">
            We CRM
          </span>
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-bold text-slate-900">Fazer Login</h1>
          <p className="text-slate-500">Entre com seus dados de acesso.</p>
        </div>

        <form onSubmit={handleSignIn} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-sm font-semibold text-slate-900">
              E-mail
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="Informe seu endereço de e-mail"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="h-12 bg-[#F4F4F6] border-none focus-visible:ring-1 focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-2 relative">
            <Label htmlFor="password" className="text-sm font-semibold text-slate-900">
              Senha
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Digite sua senha de acesso"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="h-12 bg-[#F4F4F6] border-none focus-visible:ring-1 focus-visible:ring-primary/20 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                aria-label={showPassword ? "Esconder senha" : "Mostrar senha"}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="button"
              className="text-sm font-medium text-primary hover:underline"
              onClick={() => {
                toast({
                  title: "Esqueci minha senha",
                  description: "Funcionalidade em desenvolvimento.",
                });
              }}
            >
              Esqueceu a senha?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-12 bg-primary hover:bg-primary/90 text-white font-bold rounded-xl shadow-lg shadow-primary/20 uppercase tracking-wide transition-all active:scale-[0.98]"
            disabled={loading}
          >
            {loading ? 'Entrando...' : 'ENTRAR'}
          </Button>

          <div className="text-center pt-4">
            <p className="text-sm text-slate-600">
              Não possui acesso?{' '}
              <button
                type="button"
                onClick={() => navigate('/register-company')}
                className="font-bold text-primary hover:underline"
              >
                Crie uma conta
              </button>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Auth;
