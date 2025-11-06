import { Phone, Mail, MessageCircle, Instagram, Facebook } from 'lucide-react';
import { SimpleHeader } from '@/components/layout/SimpleHeader';
import { BottomNav } from '@/components/layout/BottomNav';
import { useConfigStore } from '@/store/useConfigStore';
import { useEffect } from 'react';

export const Contato = () => {
  const { config, loadConfig } = useConfigStore();

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  if (!config) return null;

  const contactOptions = [
    {
      icon: MessageCircle,
      label: 'WhatsApp',
      value: config.store.phone,
      action: () => window.open(`https://wa.me/${config.store.whatsapp}`, '_blank'),
      color: 'bg-green-100 text-green-600'
    },
    {
      icon: Phone,
      label: 'Telefone',
      value: config.store.phone,
      action: () => window.location.href = `tel:${config.store.phone}`,
      color: 'bg-blue-100 text-blue-600'
    },
    {
      icon: Mail,
      label: 'E-mail',
      value: config.store.email,
      action: () => window.location.href = `mailto:${config.store.email}`,
      color: 'bg-purple-100 text-purple-600'
    }
  ];

  const socialLinks = [
    {
      icon: Instagram,
      label: 'Instagram',
      value: config.redesSociais.instagram,
      color: 'bg-pink-100 text-pink-600'
    },
    {
      icon: Facebook,
      label: 'Facebook',
      value: config.redesSociais.facebook,
      color: 'bg-blue-100 text-blue-600'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 pb-20 md:pb-6">
      <SimpleHeader title="Contato" />

      <main className="max-w-2xl mx-auto px-4 py-6">
        {/* Formas de Contato */}
        <div className="mb-6">
          <h3 className="text-lg font-bold mb-4">Entre em contato</h3>
          <div className="space-y-3">
            {contactOptions.map((option, index) => {
              const Icon = option.icon;
              return (
                <button
                  key={index}
                  onClick={option.action}
                  className="w-full bg-white rounded-lg shadow-md p-4 flex items-center gap-4 hover:shadow-lg transition-shadow"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${option.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">{option.label}</p>
                    <p className="text-sm text-gray-600">{option.value}</p>
                  </div>
                  <span className="text-gray-400">›</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Redes Sociais */}
        <div>
          <h3 className="text-lg font-bold mb-4">Redes Sociais</h3>
          <div className="space-y-3">
            {socialLinks.map((social, index) => {
              const Icon = social.icon;
              return (
                <div
                  key={index}
                  className="bg-white rounded-lg shadow-md p-4 flex items-center gap-4"
                >
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${social.color}`}>
                    <Icon size={24} />
                  </div>
                  <div className="text-left flex-1">
                    <p className="font-semibold text-gray-900">{social.label}</p>
                    <p className="text-sm text-gray-600">{social.value}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Horário */}
        <div className="mt-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="font-bold mb-4">Horário de Funcionamento</h3>
          <div className="space-y-2 text-sm">
            {Object.entries(config.horarioFuncionamento).map(([dia, horario]) => (
              <div key={dia} className="flex justify-between">
                <span className="capitalize text-gray-600">{dia}</span>
                <span className="font-medium text-gray-900">
                  {horario.aberto ? `${horario.abertura} - ${horario.fechamento}` : 'Fechado'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  );
};

