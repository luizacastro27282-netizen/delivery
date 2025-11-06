import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft,  MapPin, User, QrCode } from 'lucide-react';
import { useCart } from '@/hooks/useCart';
import { useOrderStore } from '@/store/useOrderStore';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { CartWithOrderBumps } from '@/components/checkout/CartWithOrderBumps';
import { OrderSummary } from '@/components/checkout/OrderSummary';
import { AddressSelector } from '@/components/checkout/AddressSelector';
import { PixPayment } from '@/components/payment/PixPayment';
import { generateOrderNumber } from '@/lib/utils';
import { DeliveryMethod, PaymentMethod } from '@/types/order';
import { toast } from 'react-hot-toast';
import { createAddress } from '@/lib/addressApi';

export const Checkout = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const cart = useCart();
  const { createOrder } = useOrderStore();
  const { user, isAuthenticated } = useAuthStore();

  // Debug: verificar se cart está disponível
  useEffect(() => {
    console.log('Checkout - Cart disponível:', !!cart);
    console.log('Checkout - Items:', cart?.items?.length || 0);
  }, [cart]);

  const [step, setStep] = useState<'cart' | 'info' | 'payment' | 'pix'>('cart');
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>('delivery');
  const [createdOrderId, setCreatedOrderId] = useState<string>('');
  const [orderPayment, setOrderPayment] = useState<any>(null);

  // Dados do cliente - preencher automaticamente se logado
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerEmail, setCustomerEmail] = useState('');
  const [wantsCpfOnInvoice, setWantsCpfOnInvoice] = useState(false);
  const [customerCpf, setCustomerCpf] = useState('');

  // Endereço
  const [street, setStreet] = useState('');
  const [number, setNumber] = useState('');
  const [complement, setComplement] = useState('');
  const [neighborhood, setNeighborhood] = useState('');
  const [city, setCity] = useState('');
  const [zipCode, setZipCode] = useState('');
  const [selectedAddressId, setSelectedAddressId] = useState<string | undefined>(undefined);

  // Pagamento
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('pix');

  // Verificar se veio do CartWithOrderBumps ou se tem step na URL
  useEffect(() => {
    if (location.state?.step) {
      setStep(location.state.step);
    } else if (location.search) {
      const params = new URLSearchParams(location.search);
      const stepParam = params.get('step');
      if (stepParam && ['cart', 'info', 'payment', 'pix'].includes(stepParam)) {
        setStep(stepParam as 'cart' | 'info' | 'payment' | 'pix');
      }
    }
  }, [location.state, location.search]);

  // Preencher dados do usuário logado
  useEffect(() => {
    if (isAuthenticated && user) {
      setCustomerName(user.name || '');
      setCustomerPhone(user.phone || '');
      setCustomerEmail(user.email || '');
    }
  }, [isAuthenticated, user]);

  // Proteção contra erro se cart não estiver disponível - SEMPRE retorna objeto válido
  const items = cart?.items || [];
  const summary = cart?.summary || {
    subtotal: 0,
    discount: 0,
    deliveryFee: 0,
    total: 0,
    itemCount: 0,
    appliedPromotions: [],
    savings: 0
  };
  const clearCart = cart?.clearCart || (() => {});

  // Handler para selecionar endereço
  const handleAddressSelect = (address: any) => {
    setSelectedAddressId(address?.id || address?._id);
    setStreet(address.street || '');
    setNumber(address.number || '');
    setComplement(address.complement || '');
    setNeighborhood(address.neighborhood || '');
    setCity(address.city || '');
    setZipCode(address.zipCode || '');
  };

  // Mostrar carrinho com order bumps quando estiver na primeira etapa
  if (step === 'cart') {
    try {
      return <CartWithOrderBumps />;
    } catch (error) {
      console.error('Erro ao renderizar carrinho:', error);
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Erro ao carregar carrinho</h2>
            <p className="text-gray-600 mb-6">Por favor, tente novamente</p>
            <Button onClick={() => navigate('/')}>Voltar ao Cardápio</Button>
          </div>
        </div>
      );
    }
  }

  if (!items || items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Seu carrinho está vazio</h2>
          <p className="text-gray-600 mb-6">Adicione produtos para continuar</p>
          <Button onClick={() => navigate('/')}>Ver Cardápio</Button>
        </div>
      </div>
    );
  }

  const handleContinue = async () => {
    if (step === 'info') {
      // Validar dados
      if (!customerName || !customerPhone) {
        toast.error('Preencha nome e telefone');
        return;
      }
      
      // Validar CPF se marcou a opção
      if (wantsCpfOnInvoice && (!customerCpf || customerCpf.length !== 11)) {
        toast.error('Por favor, informe um CPF válido com 11 dígitos');
        return;
      }
      
      // Validar endereço para delivery
      if (deliveryMethod === 'delivery') {
        const hasAddressSelected = !!selectedAddressId;
        const hasAddressFilled = !!(street && number && neighborhood && city);
        if (!hasAddressSelected && !hasAddressFilled) {
          setSelectedAddressId(undefined);
          toast.error('Selecione ou preencha um endereço de entrega');
          return;
        }
      }
      
      // Apenas validar e avançar - não registrar usuário ainda
      // Os dados ficam salvos localmente até ir para pagamento
      toast.success('Endereço confirmado!');
      setStep('payment');
      
    } else if (step === 'payment') {
      // AGORA sim tentamos registrar/logar o usuário e salvar endereço
      if (!isAuthenticated) {
        const loadingToast = toast.loading('Processando seus dados...');
        
        try {
          // Primeiro tenta fazer login
          const { login, register } = useAuthStore.getState();
          let loginSuccess = await login(customerPhone);
          let isNewUser = false;
          
          if (!loginSuccess) {
            // Se o login falhar, tenta registrar
            toast.loading('Criando sua conta...', { id: loadingToast });
            const registerSuccess = await register(customerPhone, customerName, customerEmail);
            
            if (!registerSuccess) {
              // Se falhar o registro, apenas avisa mas permite continuar
              console.warn('Falha ao criar conta, continuando com dados locais');
              toast.dismiss(loadingToast);
              // Não retorna, deixa continuar
            } else {
              isNewUser = true;
              toast.loading('Conta criada! Salvando endereço...', { id: loadingToast });
            }
          } else {
            toast.loading('Login realizado! Salvando endereço...', { id: loadingToast });
          }

          // Tentar cadastrar o endereço se for delivery e tiver endereço preenchido
          if (deliveryMethod === 'delivery' && !selectedAddressId && street && number && neighborhood && city) {
            const { user } = useAuthStore.getState();
            const leadIdentifier = user?.leadId || user?.phone || user?.id;
            
            if (leadIdentifier) {
              try {
                const addressData = {
                  street,
                  number,
                  complement: complement || undefined,
                  neighborhood,
                  city,
                  state: 'SP',
                  zipCode: zipCode || undefined,
                  type: 'home' as const,
                  label: 'Endereço de entrega',
                  isDefault: true
                };

                console.log('Cadastrando endereço:', addressData);
                const createdAddress = await createAddress(leadIdentifier, addressData);
                
                if (createdAddress) {
                  console.log('Endereço cadastrado:', createdAddress);
                  setSelectedAddressId(createdAddress.id);
                  toast.success(
                    isNewUser 
                      ? 'Conta criada e endereço salvo!' 
                      : 'Login realizado e endereço salvo!', 
                    { id: loadingToast }
                  );
                } else {
                  console.warn('Falha ao salvar endereço, continuando com dados locais');
                  toast.dismiss(loadingToast);
                }
              } catch (error) {
                console.error('Erro ao cadastrar endereço:', error);
                console.warn('Continuando com dados locais');
                toast.dismiss(loadingToast);
              }
            } else {
              console.warn('Não foi possível identificar usuário, continuando com dados locais');
              toast.dismiss(loadingToast);
            }
          } else {
            // Se já tinha endereço selecionado ou não é delivery
            toast.success(
              isNewUser 
                ? 'Conta criada com sucesso!' 
                : 'Login realizado com sucesso!', 
              { id: loadingToast }
            );
          }
        } catch (error) {
          console.error('Erro no processo de registro:', error);
          console.warn('Continuando com dados locais');
          toast.dismiss();
          // Não retorna, deixa continuar com dados locais
        }
      }
      
      // Continua para criação do pedido independente de ter registrado ou não
      // Criar o pedido no backend ANTES de gerar o PIX
      const loadingToast = toast.loading('Criando pedido...');
      
      try {
        // Decodificar token para pegar userId
        const token = localStorage.getItem('token');
        let userId = null;
        
        if (token) {
          try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            userId = payload.userId || payload.sub || payload.id;
            console.log('UserId extraído do token:', userId);
          } catch (error) {
            console.error('Erro ao decodificar token:', error);
          }
        }
        
        // Preparar dados do pedido
        const orderData: any = {
          customer: {
            name: customerName,
            phone: customerPhone.replace(/\D/g, ''),
            email: customerEmail || undefined
          },
          deliveryMethod,
          deliveryAddress: deliveryMethod === 'delivery' ? {
            street,
            number,
            complement: complement || undefined,
            neighborhood,
            city,
            state: 'SP',
            zipCode: zipCode || undefined
          } : undefined,
          deliveryFee: summary.deliveryFee || 0,
          subtotal: summary.subtotal,
          discount: summary.discount || 0,
          total: summary.total,
          payment: {
            method: paymentMethod
          },
          items: items.map(item => ({
            productId: item.product.id,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            selectedSize: item.selectedSize,
            selectedFlavors: item.selectedFlavors,
            notes: item.notes
          }))
        };

        // Adiciona userId se disponível
        if (userId) {
          orderData.userId = userId;
        }

        console.log('Criando pedido:', orderData);

        // Criar pedido no backend
        const order = await createOrder(orderData);
        
        console.log('Pedido criado:', order);
        
        setCreatedOrderId(order.id);
        
        // Armazenar o payment se existir (para PIX)
        if (order.payment) {
          console.log('Payment recebido:', order.payment);
          setOrderPayment(order.payment);
        }
        
        toast.success('Pedido criado com sucesso!', { id: loadingToast });

        // Agora vai para tela de PIX ou finaliza
        if (paymentMethod === 'pix') {
          setStep('pix');
        } else {
          handleFinishOrder();
        }
      } catch (error) {
        console.error('Erro ao criar pedido:', error);
        toast.error('Erro ao criar pedido. Tente novamente.', { id: loadingToast });
        return;
      }
    } else if (step === 'pix') {
      handleFinishOrder();
    }
  };

  const handleFinishOrder = async () => {
    try {
      // Se já criou o pedido, só limpa o carrinho e vai para tracking
      if (createdOrderId) {
        clearCart();
        navigate(`/order/${createdOrderId}`);
        return;
      }

      // Se não criou ainda (fluxo alternativo), cria agora
      toast.loading('Finalizando pedido...');
      
      // Decodificar token para pegar userId
      const token = localStorage.getItem('token');
      let userId = null;
      
      if (token) {
        try {
          const payload = JSON.parse(atob(token.split('.')[1]));
          userId = payload.userId || payload.sub || payload.id;
        } catch (error) {
          console.error('Erro ao decodificar token:', error);
        }
      }
      
      const orderData: any = {
        customer: {
          name: customerName,
          phone: customerPhone.replace(/\D/g, ''),
          email: customerEmail || undefined
        },
        deliveryMethod,
        deliveryAddress: deliveryMethod === 'delivery' ? {
          street,
          number,
          complement: complement || undefined,
          neighborhood,
          city,
          state: 'SP',
          zipCode: zipCode || undefined
        } : undefined,
        deliveryFee: summary.deliveryFee || 0,
        subtotal: summary.subtotal,
        discount: summary.discount || 0,
        total: summary.total,
        payment: {
          method: paymentMethod
        },
        items: items.map(item => ({
          productId: item.product.id,
          quantity: item.quantity,
          unitPrice: item.unitPrice,
          selectedSize: item.selectedSize,
          selectedFlavors: item.selectedFlavors,
          notes: item.notes
        }))
      };

      // Adiciona userId se disponível
      if (userId) {
        orderData.userId = userId;
      }

      const order = await createOrder(orderData);
      clearCart();
      navigate(`/order/${order.id}`);
    } catch (error) {
      console.error('Erro ao finalizar pedido:', error);
      toast.error('Erro ao finalizar pedido. Tente novamente.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <button
              onClick={() => {
                if (step === 'info') setStep('cart');
                else if (step === 'payment') setStep('info');
                else if (step === 'pix') setStep('payment');
              }}
              className="text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={24} />
            </button>
            <div>
              <h1 className="text-2xl font-bold">
                {step === 'info' && 'Dados de Entrega'}
                {step === 'payment' && 'Pagamento'}
                {step === 'pix' && 'PIX - Pagamento'}
              </h1>
              <p className="text-sm text-gray-600">
                Passo {step === 'info' ? 2 : step === 'payment' ? 3 : 4} de 4
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conteúdo principal */}
          <div className="lg:col-span-2 space-y-4">
            {/* STEP 2: Informações */}
            {step === 'info' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="space-y-6"
              >
                {/* Dados pessoais */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    <User size={20} />
                    Dados Pessoais
                  </h3>
                  <div className="space-y-4">
                    <Input
                      placeholder="Nome completo *"
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                    />
                    <Input
                      placeholder="Telefone/WhatsApp *"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                    />
                    <Input
                      type="email"
                      placeholder="E-mail (opcional)"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                    />
                    
                    {/* CPF na nota */}
                    <div className="pt-2 border-t">
                      <label className="flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={wantsCpfOnInvoice}
                          onChange={(e) => {
                            setWantsCpfOnInvoice(e.target.checked);
                            if (!e.target.checked) {
                              setCustomerCpf('');
                            }
                          }}
                          className="w-4 h-4 accent-primary-600"
                        />
                        <div>
                          <span className="font-medium text-gray-900">Deseja CPF na nota?</span>
                          <p className="text-xs text-gray-500">
                            Marque esta opção se precisar incluir CPF na nota fiscal
                          </p>
                        </div>
                      </label>
                      
                      {wantsCpfOnInvoice && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          className="mt-3"
                        >
                          <Input
                            placeholder="CPF (somente números) *"
                            value={customerCpf}
                            onChange={(e) => {
                              // Remove tudo que não é número
                              const onlyNumbers = e.target.value.replace(/\D/g, '');
                              // Limita a 11 dígitos
                              setCustomerCpf(onlyNumbers.slice(0, 11));
                            }}
                            maxLength={11}
                          />
                          <p className="text-xs text-gray-500 mt-1">
                            Digite apenas números (11 dígitos)
                          </p>
                        </motion.div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Método de entrega */}
                <div className="bg-white rounded-lg p-6 shadow-md">
                  <h3 className="text-lg font-semibold mb-4">Método de Entrega</h3>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <button
                      onClick={() => setDeliveryMethod('delivery')}
                      className={`p-4 rounded-lg border-2 transition-all ${
                        deliveryMethod === 'delivery'
                          ? 'border-primary-600 bg-primary-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin size={24} className="mx-auto mb-2" />
                      <p className="font-semibold">Entrega</p>
                    </button>
                    <button
                      onClick={() => {}}
                      disabled
                      className={`p-4 rounded-lg border-2 transition-all opacity-50 cursor-not-allowed border-gray-200`}
                    >
                      <User size={24} className="mx-auto mb-2" />
                      <p className="font-semibold">Retirada (desativado)</p>
                    </button>
                  </div>

                  {deliveryMethod === 'delivery' && (
                    <AddressSelector onSelectAddress={handleAddressSelect} selectedAddressId={selectedAddressId} />
                  )}
                </div>
              </motion.div>
            )}

            {/* STEP 3: Pagamento */}
            {step === 'payment' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-white rounded-lg p-6 shadow-md"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <QrCode size={20} />
                  Forma de Pagamento
                </h3>
                <div className="max-w-sm mx-auto">
                  <button
                    onClick={() => setPaymentMethod('pix')}
                    className={`w-full p-6 rounded-lg border-2 transition-all ${
                      paymentMethod === 'pix'
                        ? 'border-primary-600 bg-primary-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-3 mb-2">
                      <QrCode size={32} className="text-primary-600" />
                      <p className="font-bold text-xl">PIX</p>
                    </div>
                    <p className="text-sm text-gray-600">Aprovação imediata</p>
                    <p className="text-xs text-gray-500 mt-1">Escaneie o QR Code ou copie o código</p>
                  </button>
                </div>
              </motion.div>
            )}

            {/* STEP 4: PIX */}
            {step === 'pix' && (
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
              >
                <PixPayment 
                  amount={summary.total}
                  orderId={createdOrderId || generateOrderNumber()}
                  existingPixCode={orderPayment?.pixCode}
                  existingTransactionId={orderPayment?.id}
                  existingExpiresAt={orderPayment?.pixExpirationDate}
                  customer={!orderPayment ? {
                    name: customerName,
                    phone: customerPhone.replace(/\D/g, ''),
                    email: customerEmail || 'cliente@email.com',
                    document: wantsCpfOnInvoice ? customerCpf : '00000000000'
                  } : undefined}
                  onPaymentConfirmed={handleFinishOrder}
                />
              </motion.div>
            )}
          </div>

          {/* Resumo do pedido */}
          {step !== 'pix' && (
            <div>
              <OrderSummary summary={summary} />
              <Button
                onClick={handleContinue}
                className="w-full mt-4"
                size="lg"
              >
                {step === 'info' && 'Ir para Pagamento'}
                {step === 'payment' && (paymentMethod === 'pix' ? 'Gerar PIX' : 'Finalizar Pedido')}
              </Button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

