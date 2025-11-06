import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Copy, Check, QrCode, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { paymentService, CreatePixTransactionData } from '@/lib/paymentService';
import { toast } from 'react-hot-toast';
import { QRCodeSVG } from 'qrcode.react';

interface PixPaymentProps {
  amount: number;
  orderId: string;
  customer?: {
    name: string;
    phone: string;
    email: string;
    document: string;
  };
  existingPixCode?: string;
  existingTransactionId?: string;
  existingExpiresAt?: string;
  onPaymentConfirmed?: () => void;
}

export const PixPayment = ({ 
  amount, 
  orderId, 
  customer, 
  existingPixCode,
  existingTransactionId,
  existingExpiresAt,
  onPaymentConfirmed 
}: PixPaymentProps) => {
  const [pixCode, setPixCode] = useState(existingPixCode || '');
  const [transactionId, setTransactionId] = useState(existingTransactionId || '');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(!existingPixCode);
  const [checkingPayment, setCheckingPayment] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | null>(
    existingExpiresAt ? new Date(existingExpiresAt) : null
  );

  // Verifica status do pagamento periodicamente
  const startStatusPolling = (txId: string) => {
    const interval = setInterval(async () => {
      try {
        const status = await paymentService.getPaymentStatus(txId);
        if (status.status === 'paid') {
          clearInterval(interval);
          toast.success('Pagamento confirmado!');
          onPaymentConfirmed?.();
        } else if (status.status === 'expired' || status.status === 'cancelled') {
          clearInterval(interval);
          toast.error('Pagamento expirado ou cancelado');
        }
      } catch (error) {
        console.error('Erro ao verificar status do pagamento:', error);
      }
    }, 5000); // Verifica a cada 5 segundos

    // Limpa intervalo após 30 minutos
    setTimeout(() => clearInterval(interval), 30 * 60 * 1000);
  };

  useEffect(() => {
    // Se já tem pixCode existente, não precisa criar novo
    if (existingPixCode && existingTransactionId) {
      console.log('Usando PIX existente:', existingPixCode);
      setLoading(false);
      // Inicia verificação periódica do status
      startStatusPolling(existingTransactionId);
      return;
    }

    // Se já tem pixCode no estado, não tenta criar novamente
    if (pixCode && transactionId) {
      console.log('PIX já criado anteriormente');
      return;
    }

    // Só cria transação se não tem customer ou se não tem pixCode existente
    if (!customer) {
      setLoading(false);
      return;
    }

    const createTransaction = async () => {
      try {
        setLoading(true);
        
        const transactionData: CreatePixTransactionData = {
          amount,
          orderId,
          customer,
          description: `Pedido #${orderId}`
        };

        console.log('Criando nova transação PIX...');
        const transaction = await paymentService.createPixTransaction(transactionData);
        
        console.log('Transação PIX criada:', transaction);
        
        setPixCode(transaction.pixCode);
        setTransactionId(transaction.transactionId);
        
        if (transaction.expiresAt) {
          setExpiresAt(new Date(transaction.expiresAt));
        }

        // Inicia verificação periódica do status
        startStatusPolling(transaction.transactionId);
      } catch (error: any) {
        console.error('Erro ao criar transação PIX:', error);
        
        // Ignora erro de payment duplicado (P2002)
        if (error?.message === 'PAYMENT_ALREADY_EXISTS') {
          console.log('Payment já existe, usando PIX existente do pedido');
          setLoading(false);
          return;
        }
        
        toast.error('Erro ao gerar código PIX. Tente novamente.');
      } finally {
        setLoading(false);
      }
    };

    createTransaction();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [existingPixCode, existingTransactionId]);

  const handleCopyCode = () => {
    navigator.clipboard.writeText(pixCode);
    setCopied(true);
    toast.success('Código PIX copiado!');
    
    setTimeout(() => setCopied(false), 3000);
  };

  const handleCheckPayment = async () => {
    if (!transactionId) {
      toast.error('ID da transação não encontrado');
      return;
    }

    setCheckingPayment(true);
    const loadingToast = toast.loading('Verificando pagamento...');

    try {
      const status = await paymentService.getPaymentStatus(transactionId);
      
      console.log('Status do pagamento:', status);
      
      if (status.status === 'paid') {
        toast.success('Pagamento confirmado! 🎉', { id: loadingToast });
        setTimeout(() => {
          onPaymentConfirmed?.();
        }, 1000);
      } else if (status.status === 'pending') {
        toast.dismiss(loadingToast);
        toast('Pagamento ainda não identificado. Se você já pagou, aguarde alguns instantes. Pode levar até 2 minutos para confirmar.', {
          icon: '⏱️',
          duration: 5000
        });
      } else if (status.status === 'expired' || status.status === 'cancelled') {
        toast.error('Pagamento expirado ou cancelado', { id: loadingToast });
      } else {
        toast.dismiss(loadingToast);
        toast('Status do pagamento: ' + status.status, {
          icon: 'ℹ️'
        });
      }
    } catch (error) {
      console.error('Erro ao verificar pagamento:', error);
      toast.error('Erro ao verificar pagamento. Tente novamente.', { id: loadingToast });
    } finally {
      setCheckingPayment(false);
    }
  };

  return (
    <div className="bg-white rounded-lg p-6 shadow-md">
      <div className="text-center mb-6">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
          <QrCode className="text-primary-600" size={32} />
        </div>
        <h3 className="text-2xl font-bold mb-2">Pagamento via PIX</h3>
        <p className="text-gray-600">
          Escaneie o QR Code ou copie o código abaixo
        </p>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="animate-spin text-primary-600 mb-4" size={48} />
          <p className="text-gray-600">Gerando código PIX...</p>
        </div>
      ) : (
        <>
          {/* QR Code gerado do pixCode */}
          {pixCode && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex justify-center mb-6"
            >
              <div className="bg-white p-4 rounded-lg shadow-lg border-2 border-gray-200">
                <QRCodeSVG 
                  value={pixCode}
                  size={256}
                  level="H"
                  includeMargin={true}
                />
              </div>
            </motion.div>
          )}

          {/* Código PIX Copia e Cola */}
          {pixCode && (
            <div className="mb-6">
              <label className="block text-sm font-semibold mb-2">
                Código PIX Copia e Cola
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={pixCode}
                  readOnly
                  className="w-full p-3 pr-12 border rounded-lg bg-gray-50 text-sm font-mono break-all"
                />
                <button
                  onClick={handleCopyCode}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 hover:bg-gray-200 rounded transition-colors"
                  title="Copiar código"
                >
                  {copied ? (
                    <Check className="text-green-600" size={20} />
                  ) : (
                    <Copy className="text-gray-600" size={20} />
                  )}
                </button>
              </div>
            </div>
          )}
        </>
      )}

      {/* Instruções */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h4 className="font-semibold text-blue-900 mb-2">Como pagar:</h4>
        <ol className="space-y-2 text-sm text-blue-800">
          <li>1. Abra o app do seu banco</li>
          <li>2. Escolha pagar via PIX</li>
          <li>3. Escaneie o QR Code ou cole o código</li>
          <li>4. Confirme o pagamento</li>
        </ol>
      </div>

      {/* Informações */}
      <div className="text-center text-sm text-gray-600 space-y-1">
        {expiresAt && (
          <p>⏱️ Expira em: {expiresAt.toLocaleTimeString('pt-BR')}</p>
        )}
        <p>✅ Aprovação automática após confirmação</p>
        <p>💰 Valor: {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(amount)}</p>
      </div>

      {/* Botão Já Paguei */}
      {onPaymentConfirmed && pixCode && (
        <div className="mt-6 pt-6 border-t">
          <Button
            onClick={handleCheckPayment}
            disabled={checkingPayment}
            className="w-full bg-green-600 hover:bg-green-700"
            size="lg"
          >
            {checkingPayment ? (
              <>
                <Loader2 className="animate-spin mr-2" size={20} />
                Verificando...
              </>
            ) : (
              <>
                <Check className="mr-2" size={20} />
                Já Paguei
              </>
            )}
          </Button>
          <p className="text-xs text-gray-500 text-center mt-2">
            Clique aqui após realizar o pagamento para verificar a confirmação
          </p>
        </div>
      )}
    </div>
  );
};

