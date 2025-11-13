import { useState, useEffect } from 'react';
import { Plus, MapPin, Home, Briefcase, Trash2, Edit2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { motion } from 'framer-motion';
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

interface AddressSelectorProps {
  onSelectAddress: (address: Partial<Address>) => void;
  selectedAddressId?: string;
}

export const AddressSelector = ({ onSelectAddress, selectedAddressId }: AddressSelectorProps) => {
  const { isAuthenticated, user } = useAuthStore();
  
  const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [selectedId, setSelectedId] = useState<string>(selectedAddressId || '');
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  const [confirmedAddress, setConfirmedAddress] = useState<Partial<Address> | null>(null);

  // Formulário de novo endereço
  const [newAddress, setNewAddress] = useState<CreateAddressData>({
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

  // Estado para loading do CEP
  const [loadingCep, setLoadingCep] = useState(false);

  // Carregar endereços ao montar o componente
  useEffect(() => {
    loadAddresses();
  }, [isAuthenticated, user]);

  // Auto-selecionar endereço padrão ou primeiro da lista
  useEffect(() => {
    if (savedAddresses.length > 0 && !selectedId) {
      const defaultAddress = savedAddresses.find(addr => addr.isDefault);
      const addressToSelect = defaultAddress || savedAddresses[0];
      handleSelectAddress(addressToSelect);
    }
  }, [savedAddresses]);

  const loadAddresses = async () => {
    if (!isAuthenticated || !user) {
      console.log('AddressSelector: Usuário não autenticado ou user null');
      setLoading(false);
      setSavedAddresses([]);
      setShowNewAddressForm(true);
      return;
    }

    // Usar leadId se disponível, senão usar phone ou id como fallback
    const leadIdentifier = user.leadId || user.phone || user.id;
    
    if (!leadIdentifier) {
      console.error('AddressSelector: Nenhum identificador disponível (leadId, phone ou id)');
      setLoading(false);
      setSavedAddresses([]);
      setShowNewAddressForm(true);
      return;
    }

    console.log('AddressSelector: Carregando endereços para leadId:', leadIdentifier);
    console.log('AddressSelector: User completo:', user);

    setLoading(true);
    try {
      const addresses = await getLeadAddresses(leadIdentifier);
      console.log('AddressSelector: Endereços carregados:', addresses);
      setSavedAddresses(addresses);
      setShowNewAddressForm(addresses.length === 0);
    } catch (error) {
      console.error('Erro ao carregar endereços:', error);
      toast.error('Erro ao carregar endereços');
      setShowNewAddressForm(true);
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

  const handleSelectAddress = (address: Address) => {
    setSelectedId(address.id);
    onSelectAddress(address);
  };

  const handleAddNewAddress = async () => {
    if (!newAddress.street || !newAddress.number || !newAddress.neighborhood || !newAddress.city || !newAddress.zipCode) {
      toast.error('Preencha todos os campos obrigatórios (incluindo CEP)');
      return;
    }

    // Validar CEP (deve ter 8 dígitos)
    const cleanCep = newAddress.zipCode.replace(/\D/g, '');
    if (cleanCep.length !== 8) {
      toast.error('CEP inválido. Digite um CEP com 8 dígitos');
      return;
    }

    // Se não estiver logado, apenas passa os dados para o checkout e mostra confirmação
    if (!isAuthenticated || !user) {
      console.log('AddressSelector: Usuário não logado, usando endereço local');
      onSelectAddress(newAddress);
      setConfirmedAddress(newAddress);
      setShowNewAddressForm(false);
      toast.success('Endereço confirmado!');
      return;
    }

    // Usar leadId se disponível, senão usar phone ou id como fallback
    const leadIdentifier = user.leadId || user.phone || user.id;
    
    if (!leadIdentifier) {
      console.error('AddressSelector: Nenhum identificador disponível para criar endereço');
      toast.error('Erro ao identificar usuário');
      return;
    }

    console.log('AddressSelector: Criando endereço para leadId:', leadIdentifier);

    // Se estiver logado, salva no backend
    const loadingToast = toast.loading('Salvando endereço...');
    try {
      const createdAddress = await createAddress(leadIdentifier, newAddress);
      
      if (createdAddress) {
        setSavedAddresses([...savedAddresses, createdAddress]);
        toast.success('Endereço adicionado com sucesso!', { id: loadingToast });
        
        // Resetar formulário
        setNewAddress({
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
        
        setShowNewAddressForm(false);
        handleSelectAddress(createdAddress);
      }
    } catch (error) {
      toast.error('Erro ao adicionar endereço', { id: loadingToast });
      console.error('Erro ao criar endereço:', error);
    }
  };

  const handleUpdateAddress = async () => {
    if (!editingAddressId || !isAuthenticated) return;

    const loadingToast = toast.loading('Atualizando endereço...');
    try {
      const updatedAddress = await updateAddress(editingAddressId, newAddress);
      
      if (updatedAddress) {
        setSavedAddresses(savedAddresses.map(addr => 
          addr.id === editingAddressId ? updatedAddress : addr
        ));
        toast.success('Endereço atualizado com sucesso!', { id: loadingToast });
        
        setEditingAddressId(null);
        setShowNewAddressForm(false);
        setNewAddress({
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
      }
    } catch (error) {
      toast.error('Erro ao atualizar endereço', { id: loadingToast });
      console.error('Erro ao atualizar endereço:', error);
    }
  };

  const handleDeleteAddress = async (addressId: string) => {
    if (!window.confirm('Deseja realmente excluir este endereço?')) return;

    const loadingToast = toast.loading('Excluindo endereço...');
    try {
      const success = await deleteAddress(addressId);
      
      if (success) {
        setSavedAddresses(savedAddresses.filter(addr => addr.id !== addressId));
        toast.success('Endereço excluído com sucesso!', { id: loadingToast });
        
        // Se era o endereço selecionado, limpar seleção
        if (selectedId === addressId) {
          setSelectedId('');
        }
      }
    } catch (error) {
      toast.error('Erro ao excluir endereço', { id: loadingToast });
      console.error('Erro ao excluir endereço:', error);
    }
  };

  const handleSetDefault = async (addressId: string) => {
    const loadingToast = toast.loading('Definindo endereço padrão...');
    try {
      const updatedAddress = await setDefaultAddress(addressId);
      
      if (updatedAddress) {
        // Atualizar lista local
        setSavedAddresses(savedAddresses.map(addr => ({
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

  const handleEditAddress = (address: Address) => {
    setEditingAddressId(address.id);
    setNewAddress({
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
    setShowNewAddressForm(true);
  };

  // Buscar endereço pelo CEP usando ViaCEP
  const handleCepSearch = async (cep: string) => {
    const cleanCep = cep.replace(/\D/g, '');
    
    if (cleanCep.length !== 8) return;

    setLoadingCep(true);
    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();

      if (data.erro) {
        toast.error('CEP não encontrado');
        return;
      }

      // Preencher campos automaticamente
      setNewAddress(prev => ({
        ...prev,
        street: data.logradouro || prev.street,
        neighborhood: data.bairro || prev.neighborhood,
        city: data.localidade || prev.city,
        state: data.uf || prev.state,
        zipCode: cleanCep
      }));

      toast.success('CEP encontrado! Verifique os dados.');
    } catch (error) {
      console.error('Erro ao buscar CEP:', error);
      toast.error('Erro ao buscar CEP. Digite manualmente.');
    } finally {
      setLoadingCep(false);
    }
  };

  // Formatar CEP com máscara
  const formatCep = (value: string): string => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 5) return numbers;
    return numbers.replace(/(\d{5})(\d{1,3})/, '$1-$2');
  };

  const handleCepChange = (value: string) => {
    const formatted = formatCep(value);
    setNewAddress(prev => ({ ...prev, zipCode: formatted }));
    
    // Buscar automaticamente quando completar 8 dígitos
    const cleanCep = value.replace(/\D/g, '');
    if (cleanCep.length === 8) {
      handleCepSearch(cleanCep);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="font-bold text-lg mb-4">Endereço de Entrega</h3>

      {/* Endereço Confirmado (para usuários não logados) */}
      {!isAuthenticated && confirmedAddress && !showNewAddressForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border-2 border-green-500 rounded-lg p-4"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center flex-shrink-0">
              <MapPin className="text-green-600" size={20} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-semibold text-green-900">{confirmedAddress.label || 'Endereço de Entrega'}</h4>
                <span className="text-xs bg-green-200 text-green-800 px-2 py-1 rounded-full font-semibold">
                  Selecionado
                </span>
              </div>
              <p className="text-sm text-green-800">
                {confirmedAddress.street}, {confirmedAddress.number}
                {confirmedAddress.complement && `, ${confirmedAddress.complement}`}
              </p>
              <p className="text-sm text-green-800">
                {confirmedAddress.neighborhood}, {confirmedAddress.city} - {confirmedAddress.state}
              </p>
              {confirmedAddress.zipCode && (
                <p className="text-xs text-green-700 mt-1">CEP: {confirmedAddress.zipCode}</p>
              )}
            </div>
            <div className="w-6 h-6 bg-green-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
              <span>✓</span>
            </div>
          </div>
          <button
            onClick={() => {
              // Preencher formulário com endereço confirmado
              setNewAddress({
                street: confirmedAddress.street || '',
                number: confirmedAddress.number || '',
                complement: confirmedAddress.complement || '',
                neighborhood: confirmedAddress.neighborhood || '',
                city: confirmedAddress.city || '',
                state: confirmedAddress.state || 'SP',
                zipCode: confirmedAddress.zipCode || '',
                type: confirmedAddress.type || 'home',
                label: confirmedAddress.label || 'Casa',
                isDefault: confirmedAddress.isDefault || false
              });
              setConfirmedAddress(null);
              setShowNewAddressForm(true);
            }}
            className="mt-3 text-sm text-green-700 hover:text-green-800 font-medium underline"
          >
            Alterar endereço
          </button>
        </motion.div>
      )}

      {/* Endereços Salvos */}
      {!showNewAddressForm && savedAddresses.length > 0 && !confirmedAddress && (
        <div className="space-y-3">
          {savedAddresses.map((address) => (
            <motion.div
              key={address.id}
              className={`w-full text-left p-4 border-2 rounded-lg transition-all relative ${
                selectedId === address.id
                  ? 'border-primary-600 bg-primary-50'
                  : 'border-gray-300 hover:border-gray-400'
              }`}
            >
              <button
                onClick={() => handleSelectAddress(address)}
                className="w-full text-left"
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                    selectedId === address.id ? 'bg-primary-100 text-primary-600' : 'bg-gray-100 text-gray-600'
                  }`}>
                    {getIcon(address.type)}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900">{address.label}</h4>
                      {address.isDefault && (
                        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded-full">
                          Padrão
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600">
                      {address.street}, {address.number}
                      {address.complement && `, ${address.complement}`}
                    </p>
                    <p className="text-sm text-gray-600">
                      {address.neighborhood}, {address.city} - {address.state}
                    </p>
                    {address.zipCode && (
                      <p className="text-xs text-gray-500 mt-1">CEP: {address.zipCode}</p>
                    )}
                  </div>
                  {selectedId === address.id && (
                    <div className="w-6 h-6 bg-primary-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
                      <span>✓</span>
                    </div>
                  )}
                </div>
              </button>

              {/* Ações do endereço (somente para usuários logados) */}
              {isAuthenticated && (
                <div className="flex gap-2 mt-3 pt-3 border-t">
                  {!address.isDefault && (
                    <button
                      onClick={() => handleSetDefault(address.id)}
                      className="text-xs text-primary-600 hover:text-primary-700 font-medium"
                    >
                      Definir como padrão
                    </button>
                  )}
                  <button
                    onClick={() => handleEditAddress(address)}
                    className="text-xs text-gray-600 hover:text-gray-700 font-medium flex items-center gap-1"
                  >
                    <Edit2 size={12} /> Editar
                  </button>
                  <button
                    onClick={() => handleDeleteAddress(address.id)}
                    className="text-xs text-red-600 hover:text-red-700 font-medium flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Excluir
                  </button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Botão Adicionar Novo Endereço */}
      {!showNewAddressForm && !confirmedAddress && (
        <Button
          onClick={() => {
            setEditingAddressId(null);
            setNewAddress({
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
            setShowNewAddressForm(true);
          }}
          variant="outline"
          className="w-full"
        >
          <Plus size={20} className="mr-2" />
          Adicionar Novo Endereço
        </Button>
      )}

      {/* Formulário Novo Endereço */}
      {showNewAddressForm && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-gray-50 p-4 rounded-lg space-y-3"
        >
          <h4 className="font-semibold mb-3">
            {editingAddressId ? 'Editar Endereço' : 'Novo Endereço'}
          </h4>

          {/* CEP - Primeiro campo para busca automática */}
          <div>
            <label className="block text-sm font-medium mb-1">
              CEP *
              {loadingCep && <span className="ml-2 text-xs text-primary-600">(Buscando...)</span>}
            </label>
            <Input
              value={newAddress.zipCode}
              onChange={(e) => handleCepChange(e.target.value)}
              placeholder="00000-000"
              maxLength={9}
              disabled={loadingCep}
            />
            <p className="text-xs text-gray-500 mt-1">
              Digite o CEP para preencher automaticamente
            </p>
          </div>
          
          {/* Tipo e Label */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Tipo</label>
              <select
                value={newAddress.type}
                onChange={(e) => setNewAddress({ ...newAddress, type: e.target.value as 'home' | 'work' | 'other' })}
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
              >
                <option value="home">Casa</option>
                <option value="work">Trabalho</option>
                <option value="other">Outro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome</label>
              <Input
                value={newAddress.label}
                onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                placeholder="Ex: Casa, Trabalho"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Rua *</label>
              <Input
                value={newAddress.street}
                onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                placeholder="Nome da rua"
                disabled={loadingCep}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número *</label>
              <Input
                value={newAddress.number}
                onChange={(e) => setNewAddress({ ...newAddress, number: e.target.value })}
                placeholder="123"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Complemento</label>
            <Input
              value={newAddress.complement}
              onChange={(e) => setNewAddress({ ...newAddress, complement: e.target.value })}
              placeholder="Apto, bloco, etc"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Bairro *</label>
            <Input
              value={newAddress.neighborhood}
              onChange={(e) => setNewAddress({ ...newAddress, neighborhood: e.target.value })}
              placeholder="Nome do bairro"
              disabled={loadingCep}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium mb-1">Cidade *</label>
              <Input
                value={newAddress.city}
                onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                placeholder="Cidade"
                disabled={loadingCep}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Estado *</label>
              <select
                value={newAddress.state}
                onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                className="w-full p-2 border-2 border-gray-300 rounded-lg"
                disabled={loadingCep}
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

          {isAuthenticated && (
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={newAddress.isDefault}
                onChange={(e) => setNewAddress({ ...newAddress, isDefault: e.target.checked })}
                className="w-4 h-4 accent-primary-600"
              />
              <span className="text-sm">Definir como endereço padrão</span>
            </label>
          )}

          <div className="flex gap-2 pt-2">
            <Button
              onClick={editingAddressId ? handleUpdateAddress : handleAddNewAddress}
              className="flex-1"
              disabled={!newAddress.street || !newAddress.number || !newAddress.neighborhood || !newAddress.city || !newAddress.zipCode || loadingCep}
            >
              {editingAddressId ? 'Salvar Alterações' : 'Confirmar Endereço'}
            </Button>
            {(savedAddresses.length > 0 || editingAddressId) && (
              <Button
                onClick={() => {
                  setShowNewAddressForm(false);
                  setEditingAddressId(null);
                  setNewAddress({
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
                }}
                variant="outline"
              >
                Cancelar
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};
