import React, { useState } from 'react';
import { CustomerOrder, Client, Product, OrderItem, OrderStatus, ProductionOrder } from '../types/erp';
import { Plus, Search, Pencil, Trash2, ShoppingCart, Cog, Calendar, CheckCircle2, Clock, X, AlertCircle, ArrowRight } from 'lucide-react';

interface OrdersViewProps {
  orders: CustomerOrder[];
  clients: Client[];
  products: Product[];
  productionOrders: ProductionOrder[];
  onSaveOrder: (order: CustomerOrder) => void;
  onDeleteOrder: (orderId: string) => void;
  onGenerateProductionOrdersFromOrder: (order: CustomerOrder) => void;
  onNavigateToProduction: (orderId?: string) => void;
}

export const OrdersView: React.FC<OrdersViewProps> = ({
  orders,
  clients,
  products,
  productionOrders,
  onSaveOrder,
  onDeleteOrder,
  onGenerateProductionOrdersFromOrder,
  onNavigateToProduction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOrder, setEditingOrder] = useState<CustomerOrder | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [clientId, setClientId] = useState('');
  const [orderDate, setOrderDate] = useState(new Date().toISOString().split('T')[0]);
  const [deliveryDate, setDeliveryDate] = useState('');
  const [status, setStatus] = useState<OrderStatus>('Pendente');
  const [notes, setNotes] = useState('');
  const [items, setItems] = useState<OrderItem[]>([]);
  const [formError, setFormError] = useState('');

  // Item add state
  const [selectedProdId, setSelectedProdId] = useState('');
  const [itemQuantity, setItemQuantity] = useState<number>(1);

  const clientsMap = new Map(clients.map(c => [c.id, c]));
  const productsMap = new Map(products.map(p => [p.id, p]));

  const filteredOrders = orders.filter(o => {
    const client = clientsMap.get(o.clientId);
    const matchesSearch =
      o.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client && client.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && o.status === statusFilter;
  });

  const handleOpenCreateModal = () => {
    setEditingOrder(null);
    const dateStr = new Date().toISOString().split('T')[0];
    const defaultDelivery = new Date();
    defaultDelivery.setDate(defaultDelivery.getDate() + 14);

    setCode(`PED-2026-${String(orders.length + 1).padStart(3, '0')}`);
    setClientId(clients[0]?.id || '');
    setOrderDate(dateStr);
    setDeliveryDate(defaultDelivery.toISOString().split('T')[0]);
    setStatus('Pendente');
    setNotes('');
    setItems([]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (order: CustomerOrder) => {
    setEditingOrder(order);
    setCode(order.code);
    setClientId(order.clientId);
    setOrderDate(order.orderDate);
    setDeliveryDate(order.deliveryDate);
    setStatus(order.status);
    setNotes(order.notes || '');
    setItems([...order.items]);
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddItemToOrder = () => {
    if (!selectedProdId) {
      setFormError('Selecione um produto para adicionar ao pedido.');
      return;
    }
    if (itemQuantity <= 0) {
      setFormError('A quantidade do produto deve ser maior que zero.');
      return;
    }

    const existingIndex = items.findIndex(i => i.productId === selectedProdId);
    if (existingIndex >= 0) {
      const updated = [...items];
      updated[existingIndex].quantity += itemQuantity;
      setItems(updated);
    } else {
      setItems([...items, { productId: selectedProdId, quantity: itemQuantity }]);
    }

    setSelectedProdId('');
    setItemQuantity(1);
    setFormError('');
  };

  const handleRemoveItem = (prodId: string) => {
    setItems(items.filter(i => i.productId !== prodId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!clientId) {
      setFormError('Selecione o cliente do pedido.');
      return;
    }
    if (!deliveryDate) {
      setFormError('Informe a data prometida de entrega.');
      return;
    }
    if (items.length === 0) {
      setFormError('Adicione pelo menos 1 item ao pedido.');
      return;
    }

    const orderData: CustomerOrder = {
      id: editingOrder ? editingOrder.id : `ord-${Date.now()}`,
      code: code.trim(),
      clientId,
      orderDate,
      deliveryDate,
      status,
      items,
      notes: notes.trim() || undefined,
      generatedOpIds: editingOrder ? editingOrder.generatedOpIds : undefined
    };

    onSaveOrder(orderData);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Carteira de Pedidos de Clientes
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Registro de pedidos comerciais e emissão direta de Ordens de Produção (OP).
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Novo Pedido
        </button>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código do pedido ou nome do cliente..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {['all', 'Pendente', 'Em Produção', 'Entregue', 'Cancelado'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'Todos' : st}
            </button>
          ))}
        </div>
      </div>

      {/* Orders List */}
      <div className="space-y-4">
        {filteredOrders.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <ShoppingCart className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Nenhum pedido encontrado</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Registre pedidos de clientes para planejar a carga de produção da fábrica.
            </p>
          </div>
        ) : (
          filteredOrders.map(order => {
            const client = clientsMap.get(order.clientId);
            const totalUnits = order.items.reduce((sum, item) => sum + item.quantity, 0);

            // Related OPs
            const linkedOps = productionOrders.filter(
              op => op.originOrderId === order.id || (order.generatedOpIds && order.generatedOpIds.includes(op.id))
            );

            return (
              <div
                key={order.id}
                className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all space-y-4"
              >
                {/* Header row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-100 text-slate-800 rounded-md">
                      {order.code}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">
                      {client ? client.name : 'Cliente Desconhecido'}
                    </h3>
                    <span
                      className={`text-xs font-semibold px-2 py-0.5 rounded-md ${
                        order.status === 'Em Produção'
                          ? 'bg-amber-100 text-amber-800'
                          : order.status === 'Entregue'
                          ? 'bg-emerald-100 text-emerald-800'
                          : order.status === 'Pendente'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {order.status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-slate-500 font-mono">
                    <div>
                      Emissão: <span className="text-slate-800 font-semibold">{order.orderDate}</span>
                    </div>
                    <span>·</span>
                    <div>
                      Entrega Prometida: <span className="text-slate-800 font-bold">{order.deliveryDate}</span>
                    </div>
                  </div>
                </div>

                {/* Items in order */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <div className="text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                      Itens do Pedido ({totalUnits} unidades no total)
                    </div>
                    <div className="border border-slate-200 rounded-lg overflow-hidden bg-slate-50/50">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100 text-slate-600">
                          <tr>
                            <th className="py-2 px-3">Código</th>
                            <th className="py-2 px-3">Produto</th>
                            <th className="py-2 px-3 text-right">Qtd Solicitada</th>
                            <th className="py-2 px-3 text-right">Tempo Fabricação Unit.</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100 bg-white">
                          {order.items.map(item => {
                            const prod = productsMap.get(item.productId);
                            return (
                              <tr key={item.productId} className="hover:bg-slate-50">
                                <td className="py-2 px-3 font-mono text-slate-600">{prod?.code || '—'}</td>
                                <td className="py-2 px-3 font-medium text-slate-800">{prod?.name || 'Produto removido'}</td>
                                <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                                  {item.quantity} {prod?.unit || 'un'}
                                </td>
                                <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-500">
                                  {prod ? `${prod.processTimeMinutes} min/un` : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* Actions & Linked OPs status */}
                  <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
                    <div>
                      <div className="text-xs font-bold text-slate-800 mb-1">
                        Controle no PCP
                      </div>
                      {linkedOps.length > 0 ? (
                        <div className="space-y-1.5 mt-2">
                          <span className="text-[11px] text-slate-500 block">
                            OPs geradas para este pedido:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {linkedOps.map(op => (
                              <span
                                key={op.id}
                                className="font-mono text-xs font-semibold px-2 py-0.5 bg-white border border-slate-300 rounded text-slate-800"
                              >
                                {op.code} ({op.status})
                              </span>
                            ))}
                          </div>
                        </div>
                      ) : (
                        <p className="text-xs text-slate-500 mt-1">
                          Nenhuma Ordem de Produção emitida ainda para este pedido.
                        </p>
                      )}
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-200 flex flex-col sm:flex-row items-center gap-2">
                      <button
                        onClick={() => onGenerateProductionOrdersFromOrder(order)}
                        className="w-full inline-flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs transition-colors"
                      >
                        <Cog className="w-3.5 h-3.5 text-amber-400" />
                        Emitir OP do Pedido
                      </button>

                      <div className="flex items-center gap-1 w-full sm:w-auto justify-end">
                        <button
                          onClick={() => handleOpenEditModal(order)}
                          className="p-1.5 text-slate-400 hover:text-slate-700 rounded-md"
                          title="Editar Pedido"
                        >
                          <Pencil className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Excluir o pedido "${order.code}"?`)) {
                              onDeleteOrder(order.id);
                            }
                          }}
                          className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"
                          title="Excluir Pedido"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>

                {order.notes && (
                  <div className="text-xs text-slate-500 bg-slate-50 p-2.5 rounded border border-slate-100">
                    <span className="font-semibold text-slate-600">Observações: </span>
                    {order.notes}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal Create/Edit Order */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingOrder ? 'Editar Pedido de Cliente' : 'Novo Pedido de Venda'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Selecione o cliente, prazos e os produtos com quantidades solicitadas.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-4">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Número / Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cliente *
                  </label>
                  <select
                    required
                    value={clientId}
                    onChange={e => setClientId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Selecione o cliente...</option>
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.document})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data do Pedido
                  </label>
                  <input
                    type="date"
                    required
                    value={orderDate}
                    onChange={e => setOrderDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Data Prometida de Entrega *
                  </label>
                  <input
                    type="date"
                    required
                    value={deliveryDate}
                    onChange={e => setDeliveryDate(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Status do Pedido
                  </label>
                  <select
                    value={status}
                    onChange={e => setStatus(e.target.value as OrderStatus)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="Pendente">Pendente</option>
                    <option value="Em Produção">Em Produção</option>
                    <option value="Entregue">Entregue</option>
                    <option value="Cancelado">Cancelado</option>
                  </select>
                </div>
              </div>

              {/* Items Section */}
              <div className="pt-2 border-t border-slate-200">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-600 mb-2">
                  Adicionar Produtos ao Pedido
                </h4>

                <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 flex flex-col sm:flex-row items-stretch sm:items-end gap-3 mb-3">
                  <div className="flex-1">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Produto Acabado
                    </label>
                    <select
                      value={selectedProdId}
                      onChange={e => setSelectedProdId(e.target.value)}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900"
                    >
                      <option value="">Selecione o produto...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>
                          {p.code} - {p.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="w-full sm:w-28">
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Qtd (un)
                    </label>
                    <input
                      type="number"
                      min={1}
                      value={itemQuantity}
                      onChange={e => setItemQuantity(Math.max(1, Number(e.target.value)))}
                      className="w-full px-3 py-1.5 text-xs bg-white border border-slate-300 rounded-md font-mono focus:ring-2 focus:ring-slate-900"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={handleAddItemToOrder}
                    className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-md"
                  >
                    Incluir Item
                  </button>
                </div>

                {/* Items Table */}
                {items.length === 0 ? (
                  <p className="text-xs text-slate-400 italic py-2">
                    Nenhum produto incluído no pedido ainda.
                  </p>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="py-2 px-3">Código</th>
                          <th className="py-2 px-3">Produto</th>
                          <th className="py-2 px-3 text-right">Qtd</th>
                          <th className="py-2 px-3 text-center w-12">Remover</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {items.map(i => {
                          const p = productsMap.get(i.productId);
                          return (
                            <tr key={i.productId}>
                              <td className="py-2 px-3 font-mono">{p?.code || '—'}</td>
                              <td className="py-2 px-3 font-medium">{p?.name || '—'}</td>
                              <td className="py-2 px-3 text-right font-mono font-bold">{i.quantity} {p?.unit || 'un'}</td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(i.productId)}
                                  className="text-slate-400 hover:text-red-600"
                                >
                                  <Trash2 className="w-3.5 h-3.5" />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações de Faturamento e Entrega
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Horário de recebimento, contato na portaria ou instruções..."
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Salvar Pedido
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
