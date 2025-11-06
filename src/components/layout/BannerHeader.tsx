import { useEffect, useState } from 'react';
import { ShoppingCart, MapPin, Clock, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { useConfigStore } from '@/store/useConfigStore';
import { useLocationStore } from '@/store/useLocationStore';

const diasSemana = ['Domingo', 'Segunda', 'Terça', 'Quarta', 'Quinta', 'Sexta', 'Sábado'];

export const BannerHeader = () => {
  const navigate = useNavigate();
  const cart = useCart();
  const { config, loadConfig, isStoreOpen, getOpeningMessage } = useConfigStore();
  const { city, state } = useLocationStore();
  const [showTooltip, setShowTooltip] = useState(false);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);


  if (!config || !config.store) {
    return (
      <div className="h-48 md:h-64 bg-gray-200 animate-pulse" />
    );
  }

  const itemCount = cart?.itemCount || 0;

  let storeOpen = false;
  let openingMessage = '';
  let displayLocation = '';

  try {
    if (isStoreOpen) {
      storeOpen = isStoreOpen();
    }
    if (getOpeningMessage) {
      openingMessage = getOpeningMessage();
    }
    
    // Só mostra endereço se tiver cidade e estado selecionados
    if (city && state) {
      displayLocation = `${city} - ${state}`;
    }
  } catch (error) {
    console.error('Erro ao obter informações da loja:', error);
  }

  const getOpeningHoursText = () => {
    try {
      if (!config || !config.horarioFuncionamento) {
        return 'Horários não disponíveis';
      }
      const horarios = config.horarioFuncionamento;
      return diasSemana.map((dia, index) => {
        const diaKey = ['domingo', 'segunda', 'terca', 'quarta', 'quinta', 'sexta', 'sabado'][index];
        const horario = horarios[diaKey];
        if (!horario || !horario.aberto) {
          return `${dia}: Fechado`;
        }
        return `${dia}: ${horario.abertura} - ${horario.fechamento}`;
      }).join('\n');
    } catch (error) {
      console.error('Erro ao obter horários:', error);
      return 'Erro ao carregar horários';
    }
  };

  return (
    <div className="relative">
      {/* Banner de fundo */}
      <div className="h-48 md:h-64 overflow-hidden">
        <img
          src={config.store?.banner || '/banner.jpeg'}
          alt="Banner"
          className="w-full h-full object-cover"
          onError={(e) => {
            e.currentTarget.style.display = 'none';
            const parent = e.currentTarget.parentElement;
            if (parent) {
              parent.style.background = 'linear-gradient(135deg, #ef4444 0%, #b91c1c 100%)';
            }
          }}
        />
      </div>

      {/* Card branco sobreposto */}
      <div className="relative -mt-20 mx-4 md:mx-auto md:max-w-4xl">
        <div className="bg-white rounded-2xl shadow-xl p-6 relative">
          {/* Botão carrinho - SEMPRE visível e destacado */}
          <button 
            onClick={() => navigate('/checkout')}
            className="absolute -top-4 right-4 md:-top-6 md:right-6 bg-primary-600 text-white p-3 md:p-4 rounded-full hover:bg-primary-700 transition-all shadow-2xl hover:shadow-3xl hover:scale-110 z-10"
            aria-label={`Carrinho com ${itemCount} ${itemCount === 1 ? 'item' : 'itens'}`}
          >
            <ShoppingCart size={20} className="md:w-6 md:h-6" />
            {itemCount > 0 && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-yellow-400 text-gray-900 text-xs font-bold rounded-full w-5 h-5 md:w-6 md:h-6 flex items-center justify-center shadow-lg"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          {/* Logo centralizada */}
          <div className="flex flex-col items-center -mt-16 mb-4">
            <div className="w-24 h-24 md:w-28 md:h-28 rounded-full overflow-hidden shadow-2xl bg-white p-1 border-4 border-white">
              <img 
                src={config.store?.logo || '/logo.jpeg'} 
                alt={config.store?.name || 'Loja'}
                className="w-full h-full object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  const parent = e.currentTarget.parentElement;
                  if (parent && !parent.querySelector('.fallback-logo')) {
                    parent.innerHTML = '<div class="w-full h-full bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center rounded-full fallback-logo"><span class="text-3xl">🍕</span></div>';
                  }
                }}
              />
            </div>
          </div>

          {/* Informações centralizadas */}
          <div className="text-center space-y-2">
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
              {config.store?.name || 'Loja'}
            </h1>

            {/* Avaliações */}
            <div className="flex items-center justify-center gap-2 mt-2 mb-3">
              <svg className="w-5 h-5 text-yellow-400" aria-hidden="true" viewBox="0 0 576 512">
                <path fill="currentColor" d="M316.9 18C311.6 7 300.4 0 288.1 0s-23.4 7-28.8 18L195 150.3 51.4 171.5c-12 1.8-22 10.2-25.7 21.7s-.7 24.2 7.9 32.7L137.8 329l-24.6 145.7c-2 12 3 24.2 12.9 31.3s23 8 33.8 2.3l128.3-68.5 128.3 68.5c10.8 5.7 23.9 4.9 33.8-2.3s14.9-19.3 12.9-31.3L438.5 329l104.2-103.1c8.6-8.5 11.7-21.2 7.9-32.7s-13.7-19.9-25.7-21.7l-143.7-21.2L316.9 18z"/>
              </svg>
              <span className="font-semibold text-gray-900">4.9</span>
              <span className="text-sm text-gray-500">(738 avaliações)</span>
            </div>
            
            {/* Endereço */}
            <div className="flex items-center justify-center gap-1">
              {displayLocation ? (
                <div className="flex items-center gap-1 text-gray-600">
                  <MapPin size={16} />
                  <span className="text-sm">{displayLocation}</span>
                </div>
              ) : (
                <button 
                  onClick={() => navigate('/location')}
                  className="flex items-center gap-2 px-4 py-2 bg-primary-50 text-primary-600 rounded-full hover:bg-primary-100 transition-colors"
                >
                  <MapPin size={16} />
                  <span className="text-sm font-medium">Selecionar endereço</span>
                </button>
              )}
            </div>

            {/* Status */}
            <div className="flex justify-center pt-2">
              {storeOpen ? (
                <button
                  onClick={() => setShowTooltip(true)}
                  className="flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full hover:bg-green-100 transition-colors cursor-pointer"
                >
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                  <Clock size={14} />
                  <span className="text-sm font-semibold">Aberto agora</span>
                </button>
              ) : (
                <button
                  onClick={() => setShowTooltip(true)}
                  className="flex items-center gap-2 bg-red-50 text-red-700 px-4 py-2 rounded-full hover:bg-red-100 transition-colors cursor-pointer"
                >
                  <Clock size={14} />
                  <span className="text-sm font-semibold">Fechado{openingMessage ? ` • ${openingMessage}` : ''}</span>
                </button>
              )}
            </div>
          </div>

          {/* Informações da loja */}
          <div className="flex flex-wrap items-center justify-center gap-6 mt-4 py-4 border-t border-gray-100">
            {/* Pedido Mínimo */}
            <div className="flex items-center gap-2">
              <img src="/moedas.svg" alt="Pedido mínimo" className="w-4 h-4" />
              <div className="flex gap-1">
                <span className="text-sm text-gray-600">Mín.</span>
                <span className="text-sm font-semibold text-gray-900">R$ 20,00</span>
              </div>
            </div>

            {/* Tempo de Entrega */}
            <div className="flex items-center gap-2">
              <img src="/moto.svg" alt="Tempo de entrega" className="w-4 h-4" />
              <div className="flex gap-1">
                <span className="text-sm font-semibold text-gray-900">30-50</span>
                <span className="text-sm text-gray-600">min</span>
              </div>
            </div>

            {/* Avaliações */}
            
          </div>

          {/* Programa de fidelidade */}
          <div className="mt-4">
            <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-100">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center shadow-sm flex-shrink-0">
                  <span className="text-xl">🎁</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-gray-900 mb-1">Programa de fidelidade</p>
                  <p className="text-sm text-gray-700 mb-2">
                    A cada <strong>R$ 1,00</strong> em compras você ganha <strong>1 ponto</strong> que pode ser trocado por prêmios.
                  </p>
                  <p className="text-sm text-purple-700 font-medium">
                    Os novos clientes ganham automaticamente <strong>5 pontos</strong>.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modal de Horários */}
      <AnimatePresence>
        {showTooltip && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTooltip(false)}
              className="fixed inset-0 bg-black/50 z-[9999]"
            />
            
            {/* Modal */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-2xl">
                  <h3 className="text-xl font-bold text-gray-900">Horário de Funcionamento</h3>
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="p-2 hover:bg-gray-100 rounded-full transition-colors"
                  >
                    <X size={20} className="text-gray-600" />
                  </button>
                </div>

                {/* Content */}
                <div className="px-6 py-4">
                  <div className="space-y-2">
                    {(() => {
                      try {
                        const hoursText = getOpeningHoursText();
                        return hoursText.split('\n').map((line, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-0">
                            <span className="text-gray-700 font-medium">{line}</span>
                          </div>
                        ));
                      } catch (error) {
                        console.error('Erro ao renderizar horários:', error);
                        return (
                          <div className="text-gray-500 text-center py-4">
                            Erro ao carregar horários
                          </div>
                        );
                      }
                    })()}
                  </div>
                </div>

                {/* Footer */}
                <div className="sticky bottom-0 bg-white border-t border-gray-200 px-6 py-4 rounded-b-2xl">
                  <button
                    onClick={() => setShowTooltip(false)}
                    className="w-full bg-primary-600 text-white py-3 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                  >
                    Fechar
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

