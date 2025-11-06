import { useState } from 'react';
import { MapPin } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Button } from '@/components/ui/Button';
import { SearchableSelect } from '@/components/ui/SearchableSelect';
import { brazilianStates, citiesByState } from '@/data/locations';

interface LocationModalProps {
  isOpen: boolean;
  onSelectLocation: (state: string, city: string) => void;
}

export const LocationModal = ({ isOpen, onSelectLocation }: LocationModalProps) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedCity, setSelectedCity] = useState('');

  const cities = selectedState ? citiesByState[selectedState] || [] : [];

  // Converter estados para formato de opções
  const stateOptions = brazilianStates.map(state => ({
    value: state.uf,
    label: state.name
  }));

  // Converter cidades para formato de opções
  const cityOptions = cities.map(city => ({
    value: city,
    label: city
  }));

  const handleConfirm = () => {
    if (selectedState && selectedCity) {
      onSelectLocation(selectedState, selectedCity);
    }
  };

  const handleStateChange = (value: string) => {
    setSelectedState(value);
    setSelectedCity(''); // Reset city
  };

  const canConfirm = selectedState && selectedCity;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Overlay bloqueante - fundo escuro */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-90 z-[200]"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-[201] flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6"
            >
              {/* Ícone */}
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-primary-100 rounded-full flex items-center justify-center">
                  <MapPin className="text-primary-600" size={32} />
                </div>
              </div>

              {/* Título */}
              <h2 className="text-2xl font-bold text-center mb-2">
                Onde você está?
              </h2>
              <p className="text-gray-600 text-center mb-6">
                Selecione seu estado e cidade para continuar
              </p>

              {/* Formulário */}
              <div className="space-y-4">
                {/* Estado */}
                <SearchableSelect
                  options={stateOptions}
                  value={selectedState}
                  onChange={handleStateChange}
                  placeholder="Selecione um estado"
                  label="Estado"
                  searchPlaceholder="Pesquisar estado..."
                />

                {/* Cidade */}
                {selectedState && cityOptions.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    <SearchableSelect
                      options={cityOptions}
                      value={selectedCity}
                      onChange={setSelectedCity}
                      placeholder="Selecione uma cidade"
                      label="Cidade"
                      searchPlaceholder="Pesquisar cidade..."
                    />
                  </motion.div>
                )}

                {/* Botão */}
                <Button
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  className="w-full mt-6"
                  size="lg"
                >
                  Confirmar Localização
                </Button>
              </div>

              {/* Info */}
              <p className="text-xs text-gray-500 text-center mt-4">
                Você pode alterar sua localização a qualquer momento clicando no endereço no topo da página
              </p>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};
