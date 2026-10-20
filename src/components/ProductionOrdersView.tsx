import React, { useState } from 'react';
import {
  ProductionOrder,
  Product,
  RawMaterial,
  CustomerOrder,
  ProductionOrderStatus,
  OpMaterialRequirement
} from '../types/erp';
import {
  calculateBOMRequirements,
  formatProcessTime,
  calculateOrderDurationHours
} from '../services/storageService';
import {
  Plus,
  Search,
  Cog,
  Pencil,
  Trash2,
  Clock,
  Boxes,
  AlertTriangle,
  CheckCircle2,
  Play,
  Check,
  X,
  Printer,
  ChevronDown,
  ChevronRight,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';

interface ProductionOrdersViewProps {
  productionOrders: ProductionOrder[];
  products: Product[];
  rawMaterials: RawMaterial[];
  customerOrders: CustomerOrder[];
  onSaveProductionOrder: (order: ProductionOrder) => void;
  onDeleteProductionOrder: (orderId: string) => void;
  onUpdateOrderStatus: (
    orderId: string,
    newStatus: ProductionOrderStatus,
    options?: { deductStock?: boolean; addFinishedStock?: boolean }
  ) => void;
  initialProductId?: string;
  initialOrderId?: string;
}

export const ProductionOrdersView: React.FC<ProductionOrdersViewProps> = ({
  productionOrders,
  products,
  rawMaterials,
  customerOrders,
  onSaveProductionOrder,
  onDeleteProductionOrder,
  onUpdateOrderStatus,
  initialProductId,
  initialOrderId
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [expandedOpId, setExpandedOpId] = useState<string | null>(productionOrders[0]?.id || null);

  // Modal Create / Edit
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingOp, setEditingOp] = useState<ProductionOrder | null>(null);

  // Form states
  const [code, setCode] = useState('');
  const [productId, setProductId] = useState<string>(initialProductId || products[0]?.id || '');
  const [quantity, setQuantity] = useState<number>(10);
  const [originOrderId, setOriginOrderId] = useState<string>(initialOrderId || '');
  const [targetDeliveryDate, setTargetDeliveryDate] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  // Print card modal
  const [printingOp, setPrintingOp] = useState<ProductionOrder | null>(null);

  const productsMap = new Map(products.map(p => [p.id, p]));
  const ordersMap = new Map(customerOrders.map(o => [o.id, o]));

  const filteredOps = productionOrders.filter(op => {
    const prod = productsMap.get(op.productId);
    const matchesSearch =
      op.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (prod && prod.name.toLowerCase().includes(searchTerm.toLowerCase()));

    if (statusFilter === 'all') return matchesSearch;
    return matchesSearch && op.status === statusFilter;
  });

  // Automatically trigger create modal when navigated with initialProductId or initialOrderId
  React.useEffect(() => {
    if (initialProductId || initialOrderId) {
      setEditingOp(null);
      setCode(`OP-2026-${String(productionOrders.length + 86).padStart(3, '0')}`);
      if (initialProductId) setProductId(initialProductId);
      if (initialOrderId) setOriginOrderId(initialOrderId);
      setQuantity(10);
      const defaultTarget = new Date();
      defaultTarget.setDate(defaultTarget.getDate() + 10);
      setTargetDeliveryDate(defaultTarget.toISOString().split('T')[0]);
      setNotes('');
      setFormError('');
      setIsModalOpen(true);
    }
  }, [initialProductId, initialOrderId, productionOrders.length]);

  const handleOpenCreateModal = () => {
    setEditingOp(null);
    setCode(`OP-2026-${String(productionOrders.length + 86).padStart(3, '0')}`);
    setProductId(initialProductId || products[0]?.id || '');
    setQuantity(10);
    setOriginOrderId(initialOrderId || '');

    const defaultTarget = new Date();
    defaultTarget.setDate(defaultTarget.getDate() + 10);
    setTargetDeliveryDate(defaultTarget.toISOString().split('T')[0]);
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (op: ProductionOrder) => {
    setEditingOp(op);
    setCode(op.code);
    setProductId(op.productId);
    setQuantity(op.quantity);
    setOriginOrderId(op.originOrderId || '');
    setTargetDeliveryDate(op.targetDeliveryDate);
    setNotes(op.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const selectedProduct = productsMap.get(productId);
  const liveBOM = selectedProduct
    ? calculateBOMRequirements(selectedProduct, quantity, rawMaterials)
    : [];

  const liveEstimatedHours = selectedProduct
    ? calculateOrderDurationHours(selectedProduct, quantity)
    : 0;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productId) {
      setFormError('Selecione o produto a ser fabricado.');
      return;
    }
    if (quantity <= 0) {
      setFormError('A quantidade a produzir deve ser maior que zero.');
      return;
    }
    if (!targetDeliveryDate) {
      setFormError('Defina a data meta de conclusão da ordem.');
      return;
    }

    const duration = calculateOrderDurationHours(selectedProduct, quantity);

    const newOp: ProductionOrder = {
      id: editingOp ? editingOp.id : `op-${Date.now()}`,
      code: code.trim(),
      productId,
      quantity: Number(quantity),
      originOrderId: originOrderId || undefined,
      createdDate: editingOp ? editingOp.createdDate : new Date().toISOString().split('T')[0],
      targetDeliveryDate,
      status: editingOp ? editingOp.status : 'Planejada',
      estimatedDurationHours: duration,
      stockDeducted: editingOp ? editingOp.stockDeducted : false,
      productStockAdded: editingOp ? editingOp.productStockAdded : false,
      notes: notes.trim() || undefined
    };

    onSaveProductionOrder(newOp);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Ordens de Produção (OP)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Emissão de ordens, cálculo de explosão de matérias-primas e apontamento no chão de fábrica.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Emitir Ordem de Produção
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
            placeholder="Buscar por código da OP ou nome do produto..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          {['all', 'Planejada', 'Em Produção', 'Concluída', 'Cancelada'].map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                statusFilter === st
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {st === 'all' ? 'Todas as OPs' : st}
            </button>
          ))}
        </div>
      </div>

      {/* List of Production Orders */}
      <div className="space-y-4">
        {filteredOps.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
            <Cog className="w-10 h-10 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-800">Nenhuma Ordem de Produção encontrada</h3>
            <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
              Emita ordens manualmente ou a partir de pedidos de clientes para calcular materiais e duração.
            </p>
          </div>
        ) : (
          filteredOps.map(op => {
            const product = productsMap.get(op.productId);
            const isExpanded = expandedOpId === op.id;
            const bomRequirements = calculateBOMRequirements(product, op.quantity, rawMaterials);
            const hasMaterialDeficit = bomRequirements.some(m => !m.isStockSufficient);
            const originOrder = op.originOrderId ? ordersMap.get(op.originOrderId) : null;

            return (
              <div
                key={op.id}
                className="bg-white border border-slate-200 rounded-xl transition-all shadow-xs overflow-hidden"
              >
                {/* OP Card Header */}
                <div className="p-4 sm:p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setExpandedOpId(isExpanded ? null : op.id)}
                      className="mt-0.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title={isExpanded ? 'Recolher detalhes de materiais' : 'Ver explosão de materiais da OP'}
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-bold px-2 py-0.5 bg-slate-900 text-white rounded-md">
                          {op.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {product ? product.name : 'Produto removido'}
                        </h3>
                        <span className="font-mono text-xs text-slate-500">
                          ({op.quantity} {product?.unit || 'un'})
                        </span>
                        {originOrder && (
                          <span className="text-xs px-2 py-0.5 bg-blue-50 text-blue-700 rounded-md font-mono">
                            Origem: {originOrder.code}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500 mt-2 flex-wrap font-mono">
                        <div>
                          Emissão: <span className="text-slate-700 font-medium">{op.createdDate}</span>
                        </div>
                        <span>·</span>
                        <div>
                          Meta de Conclusão: <span className="text-slate-700 font-semibold">{op.targetDeliveryDate}</span>
                        </div>
                        <span>·</span>
                        <div className="flex items-center gap-1 text-slate-800 font-semibold">
                          <Clock className="w-3.5 h-3.5 text-amber-500" />
                          Duração Estimada: {op.estimatedDurationHours}h
                          <span className="text-slate-400 font-normal">
                            ({formatProcessTime((product?.processTimeMinutes || 0) * op.quantity)})
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Status, Stock flags and actions */}
                  <div className="flex items-center gap-4 pl-8 lg:pl-0 flex-wrap">
                    {/* Status badge */}
                    <div className="text-right">
                      <span className="text-[11px] text-slate-400 block">Status da Ordem</span>
                      <span
                        className={`text-xs font-bold px-2.5 py-1 rounded-md inline-block mt-0.5 ${
                          op.status === 'Em Produção'
                            ? 'bg-amber-100 text-amber-800'
                            : op.status === 'Concluída'
                            ? 'bg-emerald-100 text-emerald-800'
                            : op.status === 'Planejada'
                            ? 'bg-slate-100 text-slate-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {op.status}
                      </span>
                    </div>

                    {/* Stock status indicator */}
                    <div className="text-right hidden sm:block">
                      <span className="text-[11px] text-slate-400 block">Almoxarifado</span>
                      {op.stockDeducted ? (
                        <span className="text-xs font-medium text-emerald-700 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          Insumos Baixados
                        </span>
                      ) : hasMaterialDeficit ? (
                        <span className="text-xs font-semibold text-red-600 flex items-center gap-1 mt-0.5">
                          <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                          Déficit de Insumo!
                        </span>
                      ) : (
                        <span className="text-xs font-medium text-slate-600 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-slate-400" />
                          Estoque Disponível
                        </span>
                      )}
                    </div>

                    {/* Workflow status controls */}
                    <div className="flex items-center gap-1.5">
                      {op.status === 'Planejada' && (
                        <button
                          onClick={() => {
                            const deduct = confirm(
                              `Iniciar produção da ${op.code}?\n\nDeseja realizar a baixa automática das matérias-primas no estoque do almoxarifado agora?`
                            );
                            onUpdateOrderStatus(op.id, 'Em Produção', { deductStock: deduct });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-amber-600 hover:bg-amber-700 rounded-md transition-colors"
                          title="Iniciar Produção (aponta início e permite baixar estoque)"
                        >
                          <Play className="w-3.5 h-3.5" />
                          Iniciar Produção
                        </button>
                      )}

                      {op.status === 'Em Produção' && (
                        <button
                          onClick={() => {
                            const addStock = confirm(
                              `Concluir Ordem de Produção ${op.code}?\n\nDeseja dar entrada nas ${op.quantity} unidades no estoque de produtos acabados?`
                            );
                            onUpdateOrderStatus(op.id, 'Concluída', { addFinishedStock: addStock });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-md transition-colors"
                          title="Finalizar ordem e dar entrada no produto acabado"
                        >
                          <Check className="w-3.5 h-3.5" />
                          Concluir OP
                        </button>
                      )}

                      <button
                        onClick={() => setPrintingOp(op)}
                        className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md"
                        title="Visualizar / Imprimir Ficha de Chão de Fábrica"
                      >
                        <Printer className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => handleOpenEditModal(op)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md"
                        title="Editar Ordem"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>

                      <button
                        onClick={() => {
                          if (confirm(`Excluir a ordem de produção "${op.code}"?`)) {
                            onDeleteProductionOrder(op.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md"
                        title="Excluir Ordem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded Bill of Materials Calculation */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-200 p-4 sm:p-5 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Boxes className="w-4 h-4 text-slate-600" />
                        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-700">
                          Explosão de Matérias-Primas da OP ({op.quantity} un de {product?.name})
                        </h4>
                      </div>

                      <div className="text-xs text-slate-500 font-mono">
                        Tempo de Ciclo Unitário: {product?.processTimeMinutes} min · Carga Total: {op.estimatedDurationHours}h
                      </div>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-3">Código</th>
                            <th className="py-2.5 px-3">Matéria-Prima</th>
                            <th className="py-2.5 px-3 text-right">Consumo Unitário</th>
                            <th className="py-2.5 px-3 text-right">Total Necessário na OP</th>
                            <th className="py-2.5 px-3 text-right">Estoque no Almoxarifado</th>
                            <th className="py-2.5 px-3 text-center">Status de Suprimento</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {bomRequirements.map(req => (
                            <tr key={req.materialId} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono font-medium text-slate-600">
                                {req.materialCode}
                              </td>
                              <td className="py-2 px-3 font-medium text-slate-800">
                                {req.materialName}
                              </td>
                              <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-600">
                                {req.quantityPerUnit} {req.unit} / un
                              </td>
                              <td className="py-2 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                                {req.totalNeeded} {req.unit}
                              </td>
                              <td className="py-2 px-3 text-right font-mono tabular-nums text-slate-700">
                                {req.currentStock} {req.unit}
                              </td>
                              <td className="py-2 px-3 text-center">
                                {req.isStockSufficient ? (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-700">
                                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                                    Suficiente
                                  </span>
                                ) : (
                                  <span className="inline-flex items-center gap-1 text-[11px] font-bold text-red-600">
                                    <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
                                    Falta {req.deficit} {req.unit}
                                  </span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>

                    {op.notes && (
                      <div className="text-xs text-slate-600 bg-white p-3 rounded-lg border border-slate-200">
                        <span className="font-semibold text-slate-800">Instruções de Fabricação: </span>
                        {op.notes}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal for Creating / Editing OP */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-6">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingOp ? 'Editar Ordem de Produção' : 'Emitir Nova Ordem de Produção'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  A Ficha Técnica calcula os insumos e o tempo estimado automaticamente.
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
                    Número da OP *
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
                    Vínculo com Pedido de Cliente (Opcional)
                  </label>
                  <select
                    value={originOrderId}
                    onChange={e => setOriginOrderId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Produção para Estoque / Sem Pedido Vinculado</option>
                    {customerOrders.map(o => (
                      <option key={o.id} value={o.id}>
                        {o.code} - Entrega: {o.deliveryDate}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Produto a Fabricar *
                  </label>
                  <select
                    required
                    value={productId}
                    onChange={e => setProductId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    {products.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.code} - {p.name} ({p.processTimeMinutes} min/un)
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Quantidade a Produzir *
                  </label>
                  <input
                    type="number"
                    min={1}
                    required
                    value={quantity}
                    onChange={e => setQuantity(Math.max(1, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Data Meta de Conclusão / Entrega no Almoxarifado *
                </label>
                <input
                  type="date"
                  required
                  value={targetDeliveryDate}
                  onChange={e => setTargetDeliveryDate(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>

              {/* Dynamic BOM preview */}
              {selectedProduct && (
                <div className="p-4 bg-slate-50 border border-slate-200 rounded-lg space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800 uppercase tracking-wider">
                      Cálculo Automático da Ficha Técnica
                    </span>
                    <span className="font-mono text-slate-700 font-semibold">
                      Duração Total Estimada: {liveEstimatedHours} horas ({formatProcessTime(selectedProduct.processTimeMinutes * quantity)})
                    </span>
                  </div>

                  <div className="border border-slate-200 rounded-md overflow-hidden bg-white max-h-36 overflow-y-auto">
                    <table className="w-full text-[11px] text-left">
                      <thead className="bg-slate-100 text-slate-600">
                        <tr>
                          <th className="py-1.5 px-3">Insumo</th>
                          <th className="py-1.5 px-3 text-right">Consumo Unit.</th>
                          <th className="py-1.5 px-3 text-right">Total Necessário</th>
                          <th className="py-1.5 px-3 text-right">Estoque Atual</th>
                          <th className="py-1.5 px-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {liveBOM.map(item => (
                          <tr key={item.materialId}>
                            <td className="py-1.5 px-3 font-medium text-slate-800">{item.materialName}</td>
                            <td className="py-1.5 px-3 text-right font-mono">{item.quantityPerUnit} {item.unit}</td>
                            <td className="py-1.5 px-3 text-right font-mono font-bold">{item.totalNeeded} {item.unit}</td>
                            <td className="py-1.5 px-3 text-right font-mono">{item.currentStock} {item.unit}</td>
                            <td className="py-1.5 px-3 text-center">
                              {item.isStockSufficient ? (
                                <span className="text-emerald-700 font-semibold">OK</span>
                              ) : (
                                <span className="text-red-600 font-bold">Falta {item.deficit}</span>
                              )}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações e Roteiro de Fabricação
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Instruções para os operadores, parâmetros de máquina ou controle de qualidade..."
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
                  {editingOp ? 'Salvar Alterações' : 'Emitir Ordem de Produção'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Printable Manufacturing Card Modal */}
      {printingOp && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="w-5 h-5 text-slate-700" />
                <h3 className="text-base font-bold text-slate-900">
                  Ficha de Chão de Fábrica — {printingOp.code}
                </h3>
              </div>
              <button
                onClick={() => setPrintingOp(null)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Printable summary */}
            <div className="border border-slate-300 rounded-lg p-5 space-y-4 font-sans text-xs bg-slate-50/30">
              <div className="flex justify-between items-start border-b border-slate-200 pb-3">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-slate-400 font-semibold">Empresa de Manufatura</div>
                  <div className="text-sm font-bold text-slate-900">ORDEM DE PRODUÇÃO INDUSTRIAL</div>
                  <div className="font-mono text-xs text-slate-600 mt-0.5">Identificador: {printingOp.code}</div>
                </div>
                <div className="text-right font-mono">
                  <div>Data Emissão: {printingOp.createdDate}</div>
                  <div className="font-bold text-slate-900">Prazo Término: {printingOp.targetDeliveryDate}</div>
                  <div>Status Atual: {printingOp.status}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-slate-500 block text-[11px]">Produto Acabado</span>
                  <span className="text-sm font-bold text-slate-900">
                    {productsMap.get(printingOp.productId)?.name}
                  </span>
                  <div className="font-mono text-slate-600">
                    Código: {productsMap.get(printingOp.productId)?.code}
                  </div>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Lote / Quantidade</span>
                  <span className="text-sm font-bold text-slate-900 font-mono">
                    {printingOp.quantity} {productsMap.get(printingOp.productId)?.unit || 'unidades'}
                  </span>
                  <div className="font-mono text-slate-600">
                    Tempo Est. Total: {printingOp.estimatedDurationHours} horas
                  </div>
                </div>
              </div>

              <div>
                <span className="text-slate-700 font-bold uppercase tracking-wider block mb-1 text-[11px]">
                  Requisição de Matérias-Primas (Almoxarifado)
                </span>
                <table className="w-full text-[11px] border border-slate-200 bg-white">
                  <thead className="bg-slate-100 font-semibold text-slate-700">
                    <tr>
                      <th className="p-2 border">Código</th>
                      <th className="p-2 border">Insumo</th>
                      <th className="p-2 border text-right">Consumo Unit.</th>
                      <th className="p-2 border text-right">Qtd Total Separada</th>
                      <th className="p-2 border text-center">Conferência [ ]</th>
                    </tr>
                  </thead>
                  <tbody>
                    {calculateBOMRequirements(
                      productsMap.get(printingOp.productId),
                      printingOp.quantity,
                      rawMaterials
                    ).map(item => (
                      <tr key={item.materialId}>
                        <td className="p-2 border font-mono">{item.materialCode}</td>
                        <td className="p-2 border font-medium">{item.materialName}</td>
                        <td className="p-2 border text-right font-mono">{item.quantityPerUnit} {item.unit}</td>
                        <td className="p-2 border text-right font-mono font-bold">{item.totalNeeded} {item.unit}</td>
                        <td className="p-2 border text-center font-mono">[ &nbsp; &nbsp; ] Visto</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {printingOp.notes && (
                <div className="p-3 bg-white border border-slate-200 rounded">
                  <span className="font-bold text-slate-800">Roteiro Operacional: </span>
                  {printingOp.notes}
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200 text-center text-[10px] text-slate-500">
                <div className="border-t border-slate-400 pt-1">Responsável PCP</div>
                <div className="border-t border-slate-400 pt-1">Operador / Líder de Produção</div>
                <div className="border-t border-slate-400 pt-1">Inspeção de Qualidade</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setPrintingOp(null)}
                className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg"
              >
                Fechar
              </button>
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs"
              >
                <Printer className="w-3.5 h-3.5" />
                Imprimir Documento
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
