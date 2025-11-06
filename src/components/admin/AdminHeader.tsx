import { useNavigate } from 'react-router-dom';
import { LogOut } from 'lucide-react';
import { useAdminStore } from '@/store/useAdminStore';
import { Button } from '@/components/ui/Button';
import { toast } from 'react-hot-toast';

export const AdminHeader = () => {
  const navigate = useNavigate();
  const { logout, username } = useAdminStore();

  const handleLogout = () => {
    logout();
    toast.success('Logout realizado com sucesso');
    navigate('/admin');
  };

  return (
    <header className="bg-white shadow-sm border-b sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard Admin</h1>
            <p className="text-sm text-gray-600">Bem-vindo, {username}</p>
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              onClick={handleLogout}
              variant="outline"
              size="sm"
            >
              <LogOut size={18} className="mr-2" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

