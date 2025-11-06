import { useState } from 'react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { toast } from 'react-hot-toast';

export const MeusDados = () => {
  const { user, updateUser } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [email, setEmail] = useState(user?.email || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    setLoading(true);
    // Simula delay de API
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    updateUser({ name, email });
    toast.success('Dados atualizados com sucesso!');
    setLoading(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <SimpleHeader title="Meus Dados" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-md p-6 space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Nome completo
            </label>
            <Input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Seu nome"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Telefone
            </label>
            <Input
              value={user?.phone || ''}
              disabled
              className="bg-gray-100"
            />
            <p className="text-xs text-gray-500 mt-1">
              O telefone não pode ser alterado
            </p>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              E-mail (opcional)
            </label>
            <Input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="seu@email.com"
            />
          </div>

          <Button
            onClick={handleSave}
            loading={loading}
            className="w-full mt-6"
          >
            Salvar Alterações
          </Button>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

