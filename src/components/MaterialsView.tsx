import React, { useState } from 'react';
import { RawMaterial, UnitOfMeasure, Supplier } from '../types/erp';
import { Plus, Search, Pencil, Trash2, Boxes, AlertTriangle, CheckCircle2, ArrowUpDown, X, AlertCircle } from 'lucide-react';

interface MaterialsViewProps {
  rawMaterials: RawMaterial[];
  suppliers: Supplier[];
  onSaveMaterial: (material: RawMaterial) => void;
  onDeleteMaterial: (materialId: string) => void;
  onUpdateStock: (materialId: string, newStock: number) => void;
}

export const MaterialsView: React.FC<MaterialsViewProps> = ({
  rawMaterials,
  suppliers,
  onSaveMaterial,
  onDeleteMaterial,
  onUpdateStock
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'critical' | 'ok'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingMaterial, setEditingMaterial] = useState<RawMaterial | null>(null);

  // Quick stock adjust modal
  const [adjustingMaterial, setAdjustingMaterial] = useState<RawMaterial | null>(null);
  const [adjustAmount, setAdjustAmount] = useState<number>(0);
  const [adjustType, setAdjustType] = useState<'add' | 'subtract' | 'set'>('add');

  // Form states
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [unit, setUnit] = useState<UnitOfMeasure>('kg');
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(10);
  const [costPerUnit, setCostPerUnit] = useState<number>(0);
  const [supplierId, setSupplierId] = useState('');
  const [notes, setNotes] = useState('');
  const [formError, setFormError] = useState('');

  const suppliersMap = new Map(suppliers.map(s => [s.id, s]));

  const filteredMaterials = rawMaterials.filter(m => {
    const matchesSearch =
      m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.code.toLowerCase().includes(searchTerm.toLowerCase());

    const isCritical = m.currentStock <= m.minStock;
    if (stockFilter === 'critical') return matchesSearch && isCritical;
    if (stockFilter === 'ok') return matchesSearch && !isCritical;
    return matchesSearch;
  });

  const criticalCount = rawMaterials.filter(m => m.currentStock <= m.minStock).length;

  const handleOpenCreateModal = () => {
    setEditingMaterial(null);
    setCode(`MP-${String(rawMaterials.length + 1).padStart(3, '0')}`);
    setName('');
    setUnit('kg');
    setCurrentStock(0);
    setMinStock(20);
    setCostPerUnit(0);
    setSupplierId('');
    setNotes('');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (material: RawMaterial) => {
    setEditingMaterial(material);
    setCode(material.code);
    setName(material.name);
    setUnit(material.unit);
    setCurrentStock(material.currentStock);
    setMinStock(material.minStock);
    setCostPerUnit(material.costPerUnit || 0);
    setSupplierId(material.supplierId || '');
    setNotes(material.notes || '');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome da matéria-prima é obrigatório.');
      return;
    }
    if (!code.trim()) {
      setFormError('O código da matéria-prima é obrigatório.');
      return;
    }

    const newMaterial: RawMaterial = {
      id: editingMaterial ? editingMaterial.id : `mat-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      unit,
      currentStock: Number(currentStock),
      minStock: Number(minStock),
      costPerUnit: costPerUnit > 0 ? Number(costPerUnit) : undefined,
      supplierId: supplierId || undefined,
      notes: notes.trim() || undefined
    };

    onSaveMaterial(newMaterial);
    setIsModalOpen(false);
  };

  const handleConfirmStockAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingMaterial) return;

    let updatedStock = adjustingMaterial.currentStock;
    if (adjustType === 'add') {
      updatedStock += adjustAmount;
    } else if (adjustType === 'subtract') {
      updatedStock = Math.max(0, updatedStock - adjustAmount);
    } else {
      updatedStock = Math.max(0, adjustAmount);
    }

    onUpdateStock(adjustingMaterial.id, Number(updatedStock.toFixed(3)));
    setAdjustingMaterial(null);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Cadastro de Matérias-Primas & Insumos
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Controle de estoque, unidades de medida e pontos de reposição para o chão de fábrica.
          </p>
        </div>

        <button
          onClick={handleOpenCreateModal}
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap self-start sm:self-auto"
        >
          <Plus className="w-4 h-4" />
          Nova Matéria-Prima
        </button>
      </div>

      {/* Quick Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código ou descrição da matéria-prima..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
          />
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setStockFilter('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              stockFilter === 'all'
                ? 'bg-white text-slate-900 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Todas ({rawMaterials.length})
          </button>
          <button
            onClick={() => setStockFilter('critical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              stockFilter === 'critical'
                ? 'bg-white text-amber-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Abaixo do Mínimo ({criticalCount})
          </button>
          <button
            onClick={() => setStockFilter('ok')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
              stockFilter === 'ok'
                ? 'bg-white text-emerald-700 shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Estoque Regular ({rawMaterials.length - criticalCount})
          </button>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase tracking-wider">
              <tr>
                <th className="py-3 px-4">Código</th>
                <th className="py-3 px-4">Descrição da Matéria-Prima</th>
                <th className="py-3 px-4">Unidade</th>
                <th className="py-3 px-4 text-right">Estoque Atual</th>
                <th className="py-3 px-4 text-right">Estoque Mínimo</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Fornecedor Preferencial</th>
                <th className="py-3 px-4 text-center">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredMaterials.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-500">
                    Nenhuma matéria-prima encontrada com os filtros atuais.
                  </td>
                </tr>
              ) : (
                filteredMaterials.map(material => {
                  const isLow = material.currentStock <= material.minStock;
                  const supplier = material.supplierId ? suppliersMap.get(material.supplierId) : null;

                  return (
                    <tr key={material.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="py-3 px-4 font-mono font-semibold text-slate-700">
                        {material.code}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-semibold text-slate-900">{material.name}</div>
                        {material.notes && (
                          <div className="text-[11px] text-slate-400 mt-0.5 line-clamp-1">{material.notes}</div>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-600">
                        {material.unit}
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums font-bold text-sm">
                        <span className={isLow ? 'text-amber-600' : 'text-slate-900'}>
                          {material.currentStock}
                        </span>{' '}
                        <span className="text-[11px] font-normal text-slate-500">{material.unit}</span>
                      </td>
                      <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-500">
                        {material.minStock} {material.unit}
                      </td>
                      <td className="py-3 px-4">
                        {isLow ? (
                          <div className="inline-flex items-center gap-1.5 text-amber-700 font-medium">
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-500" />
                            <span>Reposição Necessária</span>
                          </div>
                        ) : (
                          <div className="inline-flex items-center gap-1.5 text-emerald-700 font-medium">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Regular</span>
                          </div>
                        )}
                      </td>
                      <td className="py-3 px-4 text-slate-600">
                        {supplier ? supplier.name : '—'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => {
                              setAdjustingMaterial(material);
                              setAdjustAmount(0);
                              setAdjustType('add');
                            }}
                            className="px-2 py-1 text-[11px] font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                            title="Ajustar ou dar entrada no estoque"
                          >
                            <ArrowUpDown className="w-3 h-3 inline mr-1" />
                            Ajustar
                          </button>
                          <button
                            onClick={() => handleOpenEditModal(material)}
                            className="p-1 text-slate-400 hover:text-slate-700 rounded-md transition-colors"
                            title="Editar Matéria-Prima"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Deseja excluir a matéria-prima "${material.name}"?`)) {
                                onDeleteMaterial(material.id);
                              }
                            }}
                            className="p-1 text-slate-400 hover:text-red-600 rounded-md transition-colors"
                            title="Excluir Matéria-Prima"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal for Create/Edit Raw Material */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingMaterial ? 'Editar Matéria-Prima' : 'Nova Matéria-Prima'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informe as características e limites de estoque do insumo.
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

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="MP-001"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Descrição do Insumo *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Chapa de Aço Inox 2mm"
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade *
                  </label>
                  <select
                    value={unit}
                    onChange={e => setUnit(e.target.value as UnitOfMeasure)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="kg">kg (Quilograma)</option>
                    <option value="m">m (Metro linear)</option>
                    <option value="m²">m² (Metro quadrado)</option>
                    <option value="un">un (Unidade)</option>
                    <option value="l">l (Litro)</option>
                    <option value="g">g (Grama)</option>
                    <option value="peça">peça</option>
                    <option value="conjunto">conjunto</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Atual *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={currentStock}
                    onChange={e => setCurrentStock(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Mínimo *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={minStock}
                    onChange={e => setMinStock(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Custo Unitário (R$ Ref.)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    value={costPerUnit}
                    onChange={e => setCostPerUnit(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Fornecedor Principal
                  </label>
                  <select
                    value={supplierId}
                    onChange={e => setSupplierId(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                  >
                    <option value="">Nenhum fornecedor vinculado</option>
                    {suppliers.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Observações Técnicas / Almoxarifado
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={e => setNotes(e.target.value)}
                  placeholder="Localização na prateleira, lote de compra ou especificações..."
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
                  {editingMaterial ? 'Salvar Insumo' : 'Cadastrar Insumo'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Quick Stock Adjust Modal */}
      {adjustingMaterial && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-sm w-full border border-slate-200 shadow-xl overflow-hidden p-6">
            <h3 className="text-sm font-bold text-slate-900">
              Ajuste Rápido de Estoque
            </h3>
            <p className="text-xs text-slate-500 mt-1 font-mono">
              {adjustingMaterial.code} — {adjustingMaterial.name}
            </p>

            <div className="my-4 p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs">
              <span className="text-slate-500">Estoque atual registrado: </span>
              <span className="font-mono font-bold text-slate-900">
                {adjustingMaterial.currentStock} {adjustingMaterial.unit}
              </span>
            </div>

            <form onSubmit={handleConfirmStockAdjust} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Operação
                </label>
                <div className="grid grid-cols-3 gap-1 p-1 bg-slate-100 rounded-lg text-xs font-medium">
                  <button
                    type="button"
                    onClick={() => setAdjustType('add')}
                    className={`py-1.5 rounded-md ${adjustType === 'add' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'}`}
                  >
                    + Entrada
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('subtract')}
                    className={`py-1.5 rounded-md ${adjustType === 'subtract' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'}`}
                  >
                    - Saída
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdjustType('set')}
                    className={`py-1.5 rounded-md ${adjustType === 'set' ? 'bg-white shadow-xs text-slate-900 font-bold' : 'text-slate-600'}`}
                  >
                    Definir
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Quantidade ({adjustingMaterial.unit})
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  required
                  value={adjustAmount}
                  onChange={e => setAdjustAmount(Math.max(0, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setAdjustingMaterial(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-lg"
                >
                  Confirmar Estoque
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
