/**
 * Serviço de pagamentos
 * Gerencia transações PIX e verificação de status
 */

import { api } from './api';

export interface CreatePixTransactionData {
  amount: number;
  orderId: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    document: string;
  };
  description: string;
}

export interface PixTransaction {
  transactionId: string;
  gateway: 'medusapay' | 'assetpagamentos';
  pixCode: string;
  pixQrCode: string;
  expiresAt: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
}

export interface PaymentStatus {
  transactionId: string;
  status: 'pending' | 'paid' | 'expired' | 'cancelled';
  paidAt?: string;
  amount: number;
  gateway: string;
}

class PaymentService {
  /**
   * Cria uma transação PIX
   */
  async createPixTransaction(data: CreatePixTransactionData): Promise<PixTransaction> {
    try {
      const response = await api.post<{ data: PixTransaction }>('/payments/pix/create', data, {
        requiresAuth: false
      });

      return response as any; // Ajustar conforme estrutura real da resposta
    } catch (error: any) {
      // Ignora erro de constraint duplicada (payment já existe para esse pedido)
      if (error?.error?.code === 'P2002' || error?.code === 'P2002') {
        console.log('Payment já existe para este pedido, ignorando erro P2002');
        throw new Error('PAYMENT_ALREADY_EXISTS');
      }
      throw error;
    }
  }

  /**
   * Verifica status de uma transação
   */
  async getPaymentStatus(transactionId: string): Promise<PaymentStatus> {
    const response = await api.get<{ data: PaymentStatus }>(`/payments/${transactionId}/status`, {
      requiresAuth: false
    });

    return response as any; // Ajustar conforme estrutura real da resposta
  }

  /**
   * Configura gateways de pagamento (Admin)
   */
  async configureGateways(gatewayConfig: any): Promise<any> {
    const response = await api.put('/admin/payment-gateways', gatewayConfig, {
      requiresAdmin: true
    });

    return response;
  }

  /**
   * Testa conexão com gateway (Admin)
   */
  async testGateway(gateway: 'medusapay' | 'assetpagamentos', config: any): Promise<boolean> {
    try {
      // Endpoint pode variar conforme backend
      await api.post(`/admin/payment-gateways/test/${gateway}`, config, {
        requiresAdmin: true
      });
      return true;
    } catch (error) {
      console.error(`Erro ao testar gateway ${gateway}:`, error);
      return false;
    }
  }
}

export const paymentService = new PaymentService();

