import { create } from 'zustand';
import { api } from '@/lib/api';

interface StoreConfig {
  name: string;
  logo: string;
  banner: string;
  address: string;
  phone: string;
  whatsapp: string;
  email: string;
  description: string;
  taxaEntrega: number;
  tempoMedioEntrega: number;
  pedidoMinimo: number;
}

interface HorarioFuncionamento {
  aberto: boolean;
  abertura: string;
  fechamento: string;
}

interface OrderBumpItem {
  productId: string;
  desconto: number;
  descontoTipo: 'percent' | 'fixed';
  ativo: boolean;
}

interface OrderBumpsConfig {
  enabled: boolean;
  titulo: string;
  itens?: OrderBumpItem[];
  categorias: string[];
  quantidade: number;
  sortBy: 'price' | 'name' | 'popular';
}

interface PaymentGateways {
  activeGateway?: 'medusapay' | 'assetpagamentos';
  rotationEnabled?: boolean;
  rotationStrategy?: 'round_robin' | 'priority' | 'manual';
  gateways?: {
    medusapay: {
      enabled: boolean;
      secretKey: string;
      apiUrl: string;
      priority: number;
    };
    assetpagamentos: {
      enabled: boolean;
      secretKey: string;
      companyId?: string;
      apiUrl: string;
      priority: number;
    };
  };
}

interface Config {
  store: StoreConfig;
  horarioFuncionamento: {
    [key: string]: HorarioFuncionamento;
  };
  orderBumps: OrderBumpsConfig;
  pagamento: any;
  paymentGateways?: PaymentGateways;
  redesSociais: any;
  mensagens: any;
}

interface ConfigState {
  config: Config | null;
  loading: boolean;
  error: string | null;
  
  // Actions
  loadConfig: () => Promise<void>;
  updateConfig: (newConfig: Config) => Promise<void>;
  isStoreOpen: () => boolean;
  getOpeningMessage: () => string;
}

const diasSemana = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'];

export const useConfigStore = create<ConfigState>((set, get) => ({
  config: null,
  loading: false,
  error: null,

  loadConfig: async () => {
    set({ loading: true, error: null });
    
    try {
      const response = await api.get<{ config: Config } | Config>('/config', {
        requiresAuth: false
      });
      
      // A API pode retornar { config: ... } ou diretamente o config
      const configData = (response as any)?.config || response as Config;
      
      if (configData) {
        console.log('Config carregado:', configData);
        set({ config: configData, loading: false });
      } else {
        console.warn('Config não encontrado na resposta:', response);
      }
    } catch (error) {
      console.error('Erro ao carregar configurações:', error);
      // Fallback para JSON local se API falhar
      try {
        const localResponse = await fetch('/data/config.json');
        if (localResponse.ok) {
          const config: Config = await localResponse.json();
          set({ config, loading: false });
        } else {
          throw error;
        }
      } catch (fallbackError) {
        set({
          error: error instanceof Error ? error.message : 'Erro desconhecido',
          loading: false
        });
      }
    }
  },

  updateConfig: async (newConfig: Config) => {
    try {
      const response = await api.put<{ config: Config } | Config>('/admin/config', newConfig, {
        requiresAdmin: true
      });

      // A API pode retornar { config: ... } ou diretamente o config
      const updatedConfig = (response as any)?.config || response as Config;
      
      if (updatedConfig) {
        set({ config: updatedConfig });
      } else {
        // Se não retornou config, atualiza com o que foi enviado
        set({ config: newConfig });
      }
    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      // Atualiza localmente mesmo se API falhar
      set({ config: newConfig });
      throw error;
    }
  },

  isStoreOpen: () => {
    try {
      const { config } = get();
      if (!config || !config.horarioFuncionamento) return false;

      const now = new Date();
      const diaSemana = diasSemana[now.getDay()];
      const horario = config.horarioFuncionamento[diaSemana];
      
      if (!horario || !horario.aberto) return false;

      // Converte horário atual para minutos desde meia-noite (0-1439)
      const currentMinutes = now.getHours() * 60 + now.getMinutes();
      
      // Converte horários de abertura e fechamento para minutos
      const parseTime = (timeStr: string): number => {
        const [hours, minutes] = timeStr.split(':').map(Number);
        return hours * 60 + minutes;
      };
      
      const aberturaMinutes = parseTime(horario.abertura);
      const fechamentoMinutes = parseTime(horario.fechamento);
      
      // Debug log
      console.log('🕐 Verificando horário:', {
        diaSemana,
        abertura: horario.abertura,
        fechamento: horario.fechamento,
        aberturaMinutes,
        fechamentoMinutes,
        currentMinutes,
        currentTime: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
        cruzaMeiaNoite: fechamentoMinutes <= aberturaMinutes
      });
      
      // Se fechamento <= abertura, significa que cruza a meia-noite
      // Exemplo: abre 17:30 (1050) e fecha 04:00 (240)
      // Está ABERTO: das 17:30 até 23:59 E de 00:00 até 03:59
      // Está FECHADO: das 04:00 até 17:29
      if (fechamentoMinutes <= aberturaMinutes) {
        // Cruza meia-noite
        // Está aberto se: hora atual >= abertura OU hora atual < fechamento
        const isOpen = currentMinutes >= aberturaMinutes || currentMinutes < fechamentoMinutes;
        console.log('🌙 Cruza meia-noite - Loja aberta?', isOpen);
        return isOpen;
      } else {
        // Não cruza meia-noite (horário normal)
        // Exemplo: abre 08:00 (480) e fecha 18:00 (1080)
        // Está aberto se: hora atual >= abertura E hora atual < fechamento
        const isOpen = currentMinutes >= aberturaMinutes && currentMinutes < fechamentoMinutes;
        console.log('☀️ Horário normal - Loja aberta?', isOpen);
        return isOpen;
      }
    } catch (error) {
      console.error('Erro ao verificar se loja está aberta:', error);
      return false;
    }
  },

  getOpeningMessage: () => {
    try {
      const { config } = get();
      if (!config || !config.horarioFuncionamento) return 'Carregando...';

      const now = new Date();
      const diaSemana = diasSemana[now.getDay()];
      const horario = config.horarioFuncionamento[diaSemana];
      
      if (!horario || !horario.aberto) {
        // Procura próximo dia aberto
        for (let i = 1; i <= 7; i++) {
          const proximoDia = diasSemana[(now.getDay() + i) % 7];
          const proximoHorario = config.horarioFuncionamento[proximoDia];
          if (proximoHorario && proximoHorario.aberto) {
            return `Abrimos ${proximoDia} às ${proximoHorario.abertura}`;
          }
        }
        return 'Fechado temporariamente';
      }

      return `Abrimos às ${horario.abertura}`;
    } catch (error) {
      console.error('Erro ao obter mensagem de abertura:', error);
      return 'Carregando...';
    }
  }
}));

