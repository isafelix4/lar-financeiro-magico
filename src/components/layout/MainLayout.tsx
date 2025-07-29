import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { useLocation, useNavigate } from "react-router-dom";
import { 
  BarChart3, 
  CreditCard, 
  Target, 
  TrendingUp,
  Settings,
  Menu,
  X,
  PieChart
} from "lucide-react";
import { useState } from "react";

interface MainLayoutProps {
  children: ReactNode;
}

const MainLayout = ({ children }: MainLayoutProps) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navigation = [
    {
      name: "Visão Geral",
      href: "/",
      icon: BarChart3,
      description: "Dashboard principal com KPIs e análise de gastos"
    },
    {
      name: "Dívidas",
      href: "/dividas", 
      icon: CreditCard,
      description: "Controle e estratégia de pagamento de dívidas"
    },
    {
      name: "Investimentos",
      href: "/investimentos",
      icon: PieChart,
      description: "Gestão de carteira e acompanhamento de rentabilidade"
    },
    {
      name: "Planejamento",
      href: "/planejamento",
      icon: Target,
      description: "Orçamento mensal e comparativo planejado vs realizado"
    },
    {
      name: "Configurações",
      href: "/configuracoes",
      icon: Settings,
      description: "Gerenciar categorias e subcategorias"
    }
  ];

  const isActive = (href: string) => {
    if (href === "/") {
      return location.pathname === "/";
    }
    return location.pathname.startsWith(href);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-lg bg-gradient-to-br from-primary to-primary-light flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-foreground">Lar Financeiro</h1>
                <p className="text-xs text-muted-foreground">Dashboard Familiar</p>
              </div>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2">
            {navigation.map((item) => (
              <Button
                key={item.name}
                variant={isActive(item.href) ? "default" : "ghost"}
                className="flex items-center gap-2"
                onClick={() => navigate(item.href)}
              >
                <item.icon className="h-4 w-4" />
                {item.name}
              </Button>
            ))}
          </nav>

          {/* Mobile Menu Button */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </Button>
        </div>

        {/* Mobile Navigation */}
        {isMobileMenuOpen && (
          <div className="border-t bg-background md:hidden">
            <div className="container py-4 px-4">
              <div className="grid gap-2">
                {navigation.map((item) => (
                  <Card
                    key={item.name}
                    className={`p-4 cursor-pointer transition-colors hover:bg-muted ${
                      isActive(item.href) ? 'border-primary bg-primary/5' : ''
                    }`}
                    onClick={() => {
                      navigate(item.href);
                      setIsMobileMenuOpen(false);
                    }}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        isActive(item.href) 
                          ? 'bg-primary text-primary-foreground' 
                          : 'bg-muted'
                      }`}>
                        <item.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="text-sm text-muted-foreground">{item.description}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-6 px-4">
          <div className="text-center text-sm text-muted-foreground">
            <p className="mb-2">
              <strong>Lar Financeiro Mágico</strong> - Dashboard inteligente para gestão familiar
            </p>
            <p>
              Controle suas finanças, quite suas dívidas e alcance a liberdade financeira
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;