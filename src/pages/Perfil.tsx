import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, MapPin, Award, LogOut, ChevronRight } from 'lucide-react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';

export const Perfil = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, logout } = useAuthStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
    }
  }, [isAuthenticated, navigate]);

  if (!isAuthenticated || !user) return null;

  const menuItems = [
    { icon: User, label: 'Meus Dados', path: '/perfil/dados', color: 'text-blue-600 bg-blue-100' },
    { icon: MapPin, label: 'Endereços', path: '/perfil/enderecos', color: 'text-green-600 bg-green-100' },
   
  ];

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <SimpleHeader title="Perfil" showBack={false} showCart={false} />

      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Header do Perfil */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6 text-center">
          <div className="w-24 h-24 bg-gradient-to-br from-primary-500 to-primary-700 rounded-full mx-auto mb-4 flex items-center justify-center text-white text-3xl font-bold">
            {user.name.substring(0, 2).toUpperCase()}
          </div>
          <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
          <p className="text-gray-600">{user.phone}</p>
          {user.email && <p className="text-gray-500 text-sm">{user.email}</p>}
          
          {/* Pontos de Fidelidade */}
          <div className="mt-6 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg p-4 border border-yellow-200">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Award className="text-yellow-600" size={24} />
              <span className="text-2xl font-bold text-gray-900">{user.points} pontos</span>
            </div>
            <p className="text-sm text-gray-600">Programa de fidelidade</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="bg-white rounded-lg shadow-md divide-y">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            return (
              <button
                key={index}
                onClick={() => navigate(item.path)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${item.color}`}>
                    <Icon size={20} />
                  </div>
                  <span className="font-medium text-gray-900">{item.label}</span>
                </div>
                <ChevronRight className="text-gray-400" size={20} />
              </button>
            );
          })}
        </div>

        {/* Logout */}
        <Button
          onClick={handleLogout}
          variant="outline"
          className="w-full mt-6 border-red-200 text-red-600 hover:bg-red-50"
        >
          <LogOut size={20} className="mr-2" />
          Sair da Conta
        </Button>

        {/* Versão */}
        <p className="text-center text-gray-500 text-sm mt-6">
          Versão 1.2.0
        </p>
      </main>

      <BottomNav />
    </div>
  );
};
