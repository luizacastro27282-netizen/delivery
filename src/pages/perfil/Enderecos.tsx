import { useState, useEffect } from 'react';
import { Plus, MapPin, Home, Briefcase, Trash2, Edit2, Star } from 'lucide-react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/useAuthStore';
import { 
  Address, 
  getLeadAddresses, 
  createAddress, 
  deleteAddress, 
  setDefaultAddress,
  updateAddress,
  CreateAddressData 
} from '@/lib/addressApi';
import { toast } from 'react-hot-toast';

export const Enderecos = () => {
  const { user } = useAuthStore();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);

  const [formData, setFormData] = useState<CreateAddressData>({
    street: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: 'SP',
    zipCode: '',
    type: 'home',
    label: 'Casa',
    isDefault: false
  });

  useEffect(() => {
    loadAddresses();
  }, [user]);

  const loadAddresses = async () => {
    if (!user) {
      console.log('Enderecos: Usuário não está logado');
      setLoading(false);
      return;
    }

    // Usar leadId se disponível, senão usar phone ou id como fallback
    const leadIdentifier = user.leadId || user.phone || user.id;
    
    if (!leadIdentifier) {
      console.error('Enderecos: Nenhum identificador disponível');
      setLoading(false);
      return;
    }

    console.log('Enderecos: Carregando endereços para:', leadIdentifier);
    console.log('Enderecos: User completo:', user);

    setLoading(true);
    try {
      const data = await getLeadAddresses(leadIdentifier);
      console.log('Enderecos: Endereços carregados:', data);
      setAddresses(data);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'home': return <Home size={20} />;
      case 'work': return <Briefcase size={20} />;
      default: return <MapPin size={20} />;
    }
  };

  const resetForm = () => {
    setFormData({
      street: '',
      number: '',
      complement: '',
      neighborhood: '',
      city: '',
      state: 'SP',
      zipCode: '',
      type: 'home',
      label: 'Casa',
      isDefault: false
    });
    setEditingAddressId(null);
    setShowAddressForm(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!user) {
      toast.error('Usuário não autenticado');
      return;
    }

    // Usar leadId se disponível, senão usar phone ou id como fallback
    const leadIdentifier = user.leadId || user.phone || user.id;
    
    if (!leadIdentifier) {
      toast.error('Erro ao identificar usuário');
      return;
    }

    if (!formData.street || !formData.number || !formData.neighborhood || !formData.city) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    console.log('Enderecos: Salvando endereço para:', leadIdentifier);

    const loadingToast = toast.loading(editingAddressId ? 'Atualizando...' : 'Salvando...');

    try {
      if (editingAddressId) {
        const updated = await updateAddress(editingAddressId, formData);
        if (updated) {
          setAddresses(addresses.map(addr => 
            addr.id === editingAddressId ? updated : addr
          ));
          toast.success('Endereço atualizado com sucesso!', { id: loadingToast });
        }
      } else {
        const created = await createAddress(leadIdentifier, formData);
        if (created) {
          setAddresses([...addresses, created]);
          toast.success('Endereço adicionado com sucesso!', { id: loadingToast });
        }
      }
      resetForm();
    } catch (error) {
      toast.error('Erro ao salvar endereço', { id: loadingToast });
      console.error('Erro ao salvar endereço:', error);
    }
  };

  const handleEdit = (address: Address) => {
    setEditingAddressId(address.id);
    setFormData({
      street: address.street,
      number: address.number,
      complement: address.complement || '',
      neighborhood: address.neighborhood,
      city: address.city,
      state: address.state,
      zipCode: address.zipCode || '',
      type: address.type,
      label: address.label,
      isDefault: address.isDefault
    });
    setShowAddressForm(true);
  };

  const handleDelete = async (addressId: string) => {
    if (!window.confirm('Deseja realmente excluir este endereço?')) return;

    const loadingToast = toast.loading('Excluindo...');
    try {
      const success = await deleteAddress(addressId);
      if (success) {
        setAddresses(addresses.filter(addr => addr.id !== addressId));
        toast.success('Endereço excluído com sucesso!', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Erro ao excluir endereço', { id: loadingToast });
      console.error('Erro ao excluir endereço:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const loadingToast = toast.loading('Definindo endereço padrão...');
    try {
      const updated = await setDefaultAddress(addressId);
      if (updated) {
        setAddresses(addresses.map(addr => ({
          ...addr,
          isDefault: addr.id === addressId
        })));
        toast.success('Endereço padrão definido!', { id: loadingToast });
      }
    } catch (error) {
      toast.error('Erro ao definir endereço padrão', { id: loadingToast });
      console.error('Erro ao definir endereço padrão:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <SimpleHeader title="Endereços" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
          </div>
        ) : (
          <>
            {addresses.length === 0 && !showAddressForm ? (
              <div className="text-center py-20">
                <MapPin size={64} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-xl font-bold mb-2">Nenhum endereço cadastrado</h3>
                <p className="text-gray-600 mb-6">Adicione um endereço para facilitar seus pedidos</p>
              </div>
            ) : (
              <div className="space-y-4 mb-4">
                <AnimatePresence>
                  {addresses.map((address, index) => (
                    <motion.div
                      key={address.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      transition={{ delay: index * 0.05 }}
                      className="bg-white rounded-lg shadow-md p-4"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3 flex-1">
                          <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center text-primary-600 flex-shrink-0">
                            {getIcon(address.type)}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <h4 className="font-semibold text-gray-900">{address.label}</h4>
                              {address.isDefault && (
                                <span className="inline-flex items-center gap-1 text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded-full">
                                  <Star size={12} fill="currentColor" /> Padrão
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">
                              {address.street}, {address.number}
                              {address.complement && ` - ${address.complement}`}
                            </p>
                            <p className="text-sm text-gray-600">
                              {address.neighborhood}, {address.city} - {address.state}
                            </p>
                            {address.zipCode && (
                              <p className="text-xs text-gray-500 mt-1">CEP: {address.zipCode}</p>
                            )}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button 
                            onClick={() => handleEdit(address)}
                            className="text-blue-600 hover:text-blue-700 p-2"
                            title="Editar"
                          >
                            <Edit2 size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(address.id)}
                            className="text-red-500 hover:text-red-700 p-2"
                            title="Excluir"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </div>

                      {!address.isDefault && (
                        <div className="mt-3 pt-3 border-t">
                          <button
                            onClick={() => handleSetDefault(address.id)}
                            className="text-sm text-primary-600 hover:text-primary-700 font-medium"
                          >
                            Definir como endereço padrão
                          </button>
                        </div>
                      )}
                    </motion.div>
                  ))}
                </AnimatePresence>
              </div>
            )}

            {/* Formulário */}
            <AnimatePresence>
              {showAddressForm && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md p-6 mb-4"
                >
                  <h3 className="text-lg font-bold mb-4">
                    {editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}
                  </h3>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Tipo e Label */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Tipo *</label>
                        <select
                          value={formData.type}
                          onChange={(e) => setFormData({ ...formData, type: e.target.value as 'home' | 'work' | 'other' })}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg"
                          required
                        >
                          <option value="home">Casa</option>
                          <option value="work">Trabalho</option>
                          <option value="other">Outro</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Nome *</label>
                        <Input
                          value={formData.label}
                          onChange={(e) => setFormData({ ...formData, label: e.target.value })}
                          placeholder="Ex: Casa, Trabalho"
                          required
                        />
                      </div>
                    </div>

                    {/* Rua e Número */}
                    <div className="grid grid-cols-3 gap-3">
                      <div className="col-span-2">
                        <label className="block text-sm font-medium mb-1">Rua *</label>
                        <Input
                          value={formData.street}
                          onChange={(e) => setFormData({ ...formData, street: e.target.value })}
                          placeholder="Nome da rua"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Número *</label>
                        <Input
                          value={formData.number}
                          onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                          placeholder="123"
                          required
                        />
                      </div>
                    </div>

                    {/* Complemento */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Complemento</label>
                      <Input
                        value={formData.complement}
                        onChange={(e) => setFormData({ ...formData, complement: e.target.value })}
                        placeholder="Apto, bloco, etc"
                      />
                    </div>

                    {/* Bairro */}
                    <div>
                      <label className="block text-sm font-medium mb-1">Bairro *</label>
                      <Input
                        value={formData.neighborhood}
                        onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
                        placeholder="Nome do bairro"
                        required
                      />
                    </div>

                    {/* Cidade e Estado */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-sm font-medium mb-1">Cidade *</label>
                        <Input
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          placeholder="Cidade"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-1">Estado *</label>
                        <select
                          value={formData.state}
                          onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                          className="w-full p-2 border-2 border-gray-300 rounded-lg"
                          required
                        >
                          <option value="AC">AC</option>
                          <option value="AL">AL</option>
                          <option value="AP">AP</option>
                          <option value="AM">AM</option>
                          <option value="BA">BA</option>
                          <option value="CE">CE</option>
                          <option value="DF">DF</option>
                          <option value="ES">ES</option>
                          <option value="GO">GO</option>
                          <option value="MA">MA</option>
                          <option value="MT">MT</option>
                          <option value="MS">MS</option>
                          <option value="MG">MG</option>
                          <option value="PA">PA</option>
                          <option value="PB">PB</option>
                          <option value="PR">PR</option>
                          <option value="PE">PE</option>
                          <option value="PI">PI</option>
                          <option value="RJ">RJ</option>
                          <option value="RN">RN</option>
                          <option value="RS">RS</option>
                          <option value="RO">RO</option>
                          <option value="RR">RR</option>
                          <option value="SC">SC</option>
                          <option value="SP">SP</option>
                          <option value="SE">SE</option>
                          <option value="TO">TO</option>
                        </select>
                      </div>
                    </div>

                    {/* CEP */}
                    <div>
                      <label className="block text-sm font-medium mb-1">CEP (opcional)</label>
                      <Input
                        value={formData.zipCode}
                        onChange={(e) => setFormData({ ...formData, zipCode: e.target.value })}
                        placeholder="00000-000"
                        maxLength={9}
                      />
                    </div>

                    {/* Checkbox padrão */}
                    <label className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={formData.isDefault}
                        onChange={(e) => setFormData({ ...formData, isDefault: e.target.checked })}
                        className="w-4 h-4 accent-primary-600"
                      />
                      <span className="text-sm">Definir como endereço padrão</span>
                    </label>

                    {/* Botões */}
                    <div className="flex gap-3 pt-2">
                      <Button type="submit" className="flex-1">
                        {editingAddressId ? 'Salvar Alterações' : 'Adicionar Endereço'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={resetForm}
                      >
                        Cancelar
                      </Button>
                    </div>
                  </form>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Botão Adicionar */}
            {!showAddressForm && (
              <Button 
                onClick={() => setShowAddressForm(true)} 
                className="w-full"
              >
                <Plus size={20} className="mr-2" />
                Adicionar Endereço
              </Button>
            )}
          </>
        )}
      </main>

      <BottomNav />
    </div>
  );
};
