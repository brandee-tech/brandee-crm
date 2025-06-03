
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Building2, Users, BarChart3, Target, CheckCircle, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { CompanyRegistrationDialog } from '@/components/CompanyRegistrationDialog';

export const Landing = () => {
  const [showRegistration, setShowRegistration] = useState(false);
  const navigate = useNavigate();

  const features = [
    {
      icon: <Building2 className="w-8 h-8 text-blue-600" />,
      title: "Gestão de Empresas",
      description: "Gerencie todas as informações das suas empresas clientes em um só lugar"
    },
    {
      icon: <Users className="w-8 h-8 text-green-600" />,
      title: "Equipe Unificada",
      description: "Organize sua equipe de vendas com diferentes cargos e permissões"
    },
    {
      icon: <Target className="w-8 h-8 text-purple-600" />,
      title: "Gestão de Leads",
      description: "Acompanhe e converta leads com nosso sistema avançado de CRM"
    },
    {
      icon: <BarChart3 className="w-8 h-8 text-orange-600" />,
      title: "Relatórios Completos",
      description: "Analise o desempenho da sua equipe com relatórios detalhados"
    }
  ];

  const plans = [
    {
      name: "Básico",
      price: "R$ 49",
      period: "/mês",
      description: "Ideal para pequenas equipes",
      features: [
        "Até 5 usuários",
        "1.000 leads por mês",
        "Relatórios básicos",
        "Suporte por email"
      ],
      popular: false
    },
    {
      name: "Profissional",
      price: "R$ 99",
      period: "/mês",
      description: "Para equipes em crescimento",
      features: [
        "Até 25 usuários",
        "5.000 leads por mês",
        "Relatórios avançados",
        "Suporte prioritário",
        "Integrações API"
      ],
      popular: true
    },
    {
      name: "Enterprise",
      price: "R$ 199",
      period: "/mês",
      description: "Para grandes organizações",
      features: [
        "Usuários ilimitados",
        "Leads ilimitados",
        "Relatórios personalizados",
        "Suporte 24/7",
        "Integrações personalizadas"
      ],
      popular: false
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center">
              <Building2 className="w-8 h-8 text-blue-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">ZestCRM</h1>
            </div>
            <div className="flex items-center space-x-4">
              <Button variant="ghost" onClick={() => navigate('/auth')}>
                Entrar
              </Button>
              <Button onClick={() => setShowRegistration(true)}>
                Cadastrar Empresa
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-5xl font-bold text-gray-900 mb-6">
            Gerencie suas vendas com
            <span className="text-blue-600"> inteligência</span>
          </h2>
          <p className="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
            Plataforma completa para gestão de leads, equipes de vendas e relacionamento com clientes. 
            Aumente sua conversão e organize seu time de vendas.
          </p>
          <div className="flex justify-center space-x-4">
            <Button size="lg" onClick={() => setShowRegistration(true)}>
              Começar Gratuitamente
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button variant="outline" size="lg" onClick={() => navigate('/auth')}>
              Ver Demo
            </Button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Tudo que você precisa para vender mais
            </h3>
            <p className="text-lg text-gray-600">
              Ferramentas poderosas para otimizar seu processo de vendas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="text-center hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="mx-auto mb-4">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <CardDescription className="text-gray-600">
                    {feature.description}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h3 className="text-3xl font-bold text-gray-900 mb-4">
              Planos que crescem com seu negócio
            </h3>
            <p className="text-lg text-gray-600">
              Escolha o plano ideal para sua empresa
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <Card key={index} className={`relative ${plan.popular ? 'border-blue-500 shadow-xl' : ''}`}>
                {plan.popular && (
                  <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600">
                    Mais Popular
                  </Badge>
                )}
                <CardHeader className="text-center">
                  <CardTitle className="text-2xl">{plan.name}</CardTitle>
                  <div className="mt-4">
                    <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                    <span className="text-gray-600">{plan.period}</span>
                  </div>
                  <CardDescription>{plan.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-3 mb-6">
                    {plan.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center">
                        <CheckCircle className="w-5 h-5 text-green-500 mr-3" />
                        <span className="text-gray-600">{feature}</span>
                      </li>
                    ))}
                  </ul>
                  <Button 
                    className="w-full" 
                    variant={plan.popular ? "default" : "outline"}
                    onClick={() => setShowRegistration(true)}
                  >
                    Escolher Plano
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h3 className="text-3xl font-bold text-white mb-4">
            Pronto para transformar suas vendas?
          </h3>
          <p className="text-xl text-blue-100 mb-8">
            Junte-se a centenas de empresas que já aumentaram suas vendas com nossa plataforma
          </p>
          <Button size="lg" variant="secondary" onClick={() => setShowRegistration(true)}>
            Começar Agora - É Grátis
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center mb-4">
                <Building2 className="w-6 h-6 text-blue-400 mr-2" />
                <h4 className="text-lg font-semibold">ZestCRM</h4>
              </div>
              <p className="text-gray-400">
                A solução completa para gestão de vendas e relacionamento com clientes.
              </p>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Produto</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Recursos</li>
                <li>Preços</li>
                <li>Segurança</li>
                <li>Atualizações</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Empresa</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Sobre</li>
                <li>Blog</li>
                <li>Carreiras</li>
                <li>Contato</li>
              </ul>
            </div>
            <div>
              <h5 className="font-semibold mb-4">Suporte</h5>
              <ul className="space-y-2 text-gray-400">
                <li>Central de Ajuda</li>
                <li>Documentação</li>
                <li>Status</li>
                <li>API</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ZestCRM. Todos os direitos reservados.</p>
          </div>
        </div>
      </footer>

      <CompanyRegistrationDialog 
        open={showRegistration} 
        onOpenChange={setShowRegistration}
      />
    </div>
  );
};

export default Landing;
