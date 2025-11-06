import { X } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Order } from '@/types/order';
import { formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/Badge';

interface OrderDetailModalProps {
  order: Order;
  onClose: () => void;
}

export const OrderDetailModal = ({ order, onClose }: OrderDetailModalProps) => {
  return (
    <AnimatePresence>
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto"
        >
          <div className="sticky top-0 bg-white border-b p-4 flex items-center justify-between">
            <h2 className="text-xl font-bold">Detalhes do Pedido #{order.orderNumber}</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
              <X size={24} />
            </button>
          </div>

          <div className="p-6 space-y-6">
            {/* Informações do Cliente */}
            <div>
              <h3 className="font-semibold mb-3">Cliente</h3>
              <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
                <p><strong>Nome:</strong> {order.customerName || order.customer?.name || 'N/A'}</p>
                <p><strong>Telefone:</strong> {order.customerPhone || order.customer?.phone || 'N/A'}</p>
                {(order.customerEmail || order.customer?.email) && <p><strong>Email:</strong> {order.customerEmail || order.customer?.email}</p>}
              </div>
            </div>

            {/* Endereço */}
            {order.deliveryAddress && (
              <div>
                <h3 className="font-semibold mb-3">Endereço de Entrega</h3>
                <div className="bg-gray-50 rounded-lg p-4 text-sm">
                  <p>
                    {order.deliveryAddress.street}, {order.deliveryAddress.number}
                    {order.deliveryAddress.complement && `, ${order.deliveryAddress.complement}`}
                  </p>
                  <p>
                    {order.deliveryAddress.neighborhood}, {order.deliveryAddress.city} - {order.deliveryAddress.state}
                  </p>
                  {order.deliveryAddress.zipCode && <p>CEP: {order.deliveryAddress.zipCode}</p>}
                </div>
              </div>
            )}

            {/* Itens */}
            <div>
              <h3 className="font-semibold mb-3">Itens do Pedido</h3>
              <div className="space-y-2">
                {order.items.map((item, index) => (
                  <div key={index} className="bg-gray-50 rounded-lg p-4 flex justify-between">
                    <div>
                      <p className="font-medium">{item.product.name}</p>
                      <p className="text-sm text-gray-600">
                        Qtd: {item.quantity} × {formatCurrency(item.unitPrice)}
                      </p>
                      {item.selectedSize && <p className="text-xs text-gray-500">Tamanho: {item.selectedSize}</p>}
                      {item.selectedFlavors && <p className="text-xs text-gray-500">Sabores: {item.selectedFlavors.join(', ')}</p>}
                      {item.selectedVariant && item.product.variants && (
                        <p className="text-xs text-gray-500">
                          {(() => {
                            const variant = item.product.variants.find(v => v.name === item.selectedVariant?.variantName);
                            const option = variant?.values.find(v => v.value === item.selectedVariant?.value);
                            if (variant && option) {
                              return (
                                <>
                                  {variant.label}: {option.label}
                                  {option.description && (
                                    <span className="block italic mt-1">
                                      {option.description}
                                    </span>
                                  )}
                                </>
                              );
                            }
                            return `${item.selectedVariant.variantName}: ${item.selectedVariant.value}`;
                          })()}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold">
                      {formatCurrency(item.unitPrice * item.quantity)}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Resumo */}
            <div className="border-t pt-4">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>{formatCurrency(order.subtotal)}</span>
                </div>
                {order.discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Desconto:</span>
                    <span>-{formatCurrency(order.discount)}</span>
                  </div>
                )}
                {order.deliveryFee > 0 && (
                  <div className="flex justify-between">
                    <span>Taxa de entrega:</span>
                    <span>{formatCurrency(order.deliveryFee)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-lg pt-2 border-t">
                  <span>Total:</span>
                  <span className="text-primary-600">{formatCurrency(order.total)}</span>
                </div>
              </div>
            </div>

            {/* Método de Pagamento */}
            <div>
              <h3 className="font-semibold mb-2">Pagamento</h3>
              <Badge variant="info">{order.payment.method.toUpperCase()}</Badge>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

