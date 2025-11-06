import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAdminStore } from '@/store/useAdminStore';
import { useProductStore } from '@/store/useProductStore';
import { useConfigStore } from '@/store/useConfigStore';
import { AdminHeader } from '@/components/admin/AdminHeader';
import { AdminNav } from '@/components/admin/AdminNav';

export const Dashboard = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAdminStore();
  const { loadProducts } = useProductStore();
  const { loadConfig } = useConfigStore();

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/admin');
    }
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    loadProducts();
    loadConfig();
  }, [loadProducts, loadConfig]);

  if (!isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-gray-50">
      <AdminHeader />
      
      <main className="max-w-7xl mx-auto px-4 py-6">
        {/* Navegação e Conteúdo */}
        <AdminNav />
      </main>
    </div>
  );
};

