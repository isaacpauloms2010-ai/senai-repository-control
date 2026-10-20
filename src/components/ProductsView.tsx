import React, { useState } from 'react';
import { Product, RawMaterial, ProductMaterialItem } from '../types/erp';
import { formatProcessTime } from '../services/storageService';
import { Plus, Search, Pencil, Trash2, Layers, Clock, AlertCircle, X, ChevronRight, ChevronDown } from 'lucide-react';

interface ProductsViewProps {
  products: Product[];
  rawMaterials: RawMaterial[];
  onSaveProduct: (product: Product) => void;
  onDeleteProduct: (productId: string) => void;
  onNavigateToProduction: (productId?: string) => void;
}

export const ProductsView: React.FC<ProductsViewProps> = ({
  products,
  rawMaterials,
  onSaveProduct,
  onDeleteProduct,
  onNavigateToProduction
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedProductId, setExpandedProductId] = useState<string | null>(products[0]?.id || null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form State
  const [code, setCode] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [processTimeMinutes, setProcessTimeMinutes] = useState<number>(60);
  const [currentStock, setCurrentStock] = useState<number>(0);
  const [category, setCategory] = useState('');
  const [materialsList, setMaterialsList] = useState<ProductMaterialItem[]>([]);
  const [formError, setFormError] = useState('');

  // Material item add temp state
  const [selectedMatId, setSelectedMatId] = useState('');
  const [matQuantityInput, setMatQuantityInput] = useState<string>('1');

  const materialsMap = new Map(rawMaterials.map(m => [m.id, m]));

  const parseQuantity = (val: string | number): number => {
    if (typeof val === 'number') return isNaN(val) ? 0 : val;
    if (!val) return 0;
    const clean = val.replace(',', '.').trim();
    const parsed = parseFloat(clean);
    return isNaN(parsed) ? 0 : parsed;
  };

  const filteredProducts = products.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleOpenCreateModal = () => {
    setEditingProduct(null);
    setCode(`PA-${String(products.length + 101).padStart(3, '0')}`);
    setName('');
    setDescription('');
    setProcessTimeMinutes(60);
    setCurrentStock(0);
    setCategory('Linha Padrão');
    setMaterialsList([]);
    setSelectedMatId('');
    setMatQuantityInput('1');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (product: Product) => {
    setEditingProduct(product);
    setCode(product.code);
    setName(product.name);
    setDescription(product.description || '');
    setProcessTimeMinutes(product.processTimeMinutes);
    setCurrentStock(product.currentStock || 0);
    setCategory(product.category || 'Geral');
    setMaterialsList([...product.materials]);
    setSelectedMatId('');
    setMatQuantityInput('1');
    setFormError('');
    setIsModalOpen(true);
  };

  const handleAddMaterialToBOM = () => {
    if (!selectedMatId) {
      setFormError('Selecione uma matéria-prima para adicionar à ficha técnica.');
      return;
    }
    const qty = parseQuantity(matQuantityInput);
    if (qty <= 0) {
      setFormError('Informe uma quantidade válida por unidade (maior que zero, ex: 1 ou 0,5).');
      return;
    }

    const existingIndex = materialsList.findIndex(m => m.materialId === selectedMatId);
    if (existingIndex >= 0) {
      const updated = [...materialsList];
      updated[existingIndex].quantityNeeded = Number((updated[existingIndex].quantityNeeded + qty).toFixed(3));
      setMaterialsList(updated);
    } else {
      setMaterialsList([...materialsList, { materialId: selectedMatId, quantityNeeded: qty }]);
    }

    setSelectedMatId('');
    setMatQuantityInput('1');
    setFormError('');
  };

  const handleUpdateItemQuantity = (materialId: string, rawVal: string) => {
    const qty = parseQuantity(rawVal);
    setMaterialsList(prev =>
      prev.map(item =>
        item.materialId === materialId ? { ...item, quantityNeeded: Math.max(0.001, qty) } : item
      )
    );
  };

  const handleRemoveMaterialFromBOM = (materialId: string) => {
    setMaterialsList(materialsList.filter(m => m.materialId !== materialId));
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setFormError('O nome do produto é obrigatório.');
      return;
    }
    if (!code.trim()) {
      setFormError('O código do produto é obrigatório.');
      return;
    }
    if (processTimeMinutes <= 0) {
      setFormError('O tempo de processo deve ser superior a 0 minutos.');
      return;
    }

    let finalMaterials = [...materialsList];

    // Se o usuário selecionou uma matéria-prima no formulário mas não clicou no botão "Adicionar Insumo", inclui automaticamente
    if (selectedMatId) {
      const qty = parseQuantity(matQuantityInput);
      if (qty > 0) {
        const existingIndex = finalMaterials.findIndex(m => m.materialId === selectedMatId);
        if (existingIndex >= 0) {
          finalMaterials[existingIndex].quantityNeeded = Number(
            (finalMaterials[existingIndex].quantityNeeded + qty).toFixed(3)
          );
        } else {
          finalMaterials.push({ materialId: selectedMatId, quantityNeeded: qty });
        }
      }
    }

    const newProduct: Product = {
      id: editingProduct ? editingProduct.id : `prod-${Date.now()}`,
      code: code.trim(),
      name: name.trim(),
      description: description.trim(),
      unit: 'un',
      processTimeMinutes: Number(processTimeMinutes),
      currentStock: Number(currentStock),
      category: category.trim(),
      materials: finalMaterials
    };

    onSaveProduct(newProduct);
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-6">
      {/* Header section with actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Fichas Técnicas dos Produtos (BOM)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Defina o tempo de ciclo de manufatura e a lista de matérias-primas por unidade de produto acabado.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleOpenCreateModal}
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors whitespace-nowrap"
          >
            <Plus className="w-4 h-4" />
            Novo Produto
          </button>
        </div>
      </div>

      {/* Filter and search */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Buscar por código, nome ou categoria..."
            className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-slate-900 focus:border-slate-900 text-slate-900 placeholder:text-slate-400"
          />
        </div>
        <div className="text-xs text-slate-500 font-medium">
          Total de Produtos Cadastrados: <span className="font-mono font-semibold text-slate-800 tabular-nums">{products.length}</span>
        </div>
      </div>

      {/* Main product list */}
      {filteredProducts.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-xl p-12 text-center">
          <Layers className="w-10 h-10 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">Nenhum produto encontrado</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            {searchTerm
              ? 'Nenhum resultado corresponde à sua pesquisa.'
              : 'Cadastre seu primeiro produto com sua respectiva ficha técnica para iniciar o planejamento.'}
          </p>
          {!searchTerm && (
            <button
              onClick={handleOpenCreateModal}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-slate-900 rounded-lg hover:bg-slate-800"
            >
              <Plus className="w-4 h-4" />
              Cadastrar Produto
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProducts.map(product => {
            const isExpanded = expandedProductId === product.id;
            return (
              <div
                key={product.id}
                className="bg-white border border-slate-200 rounded-xl transition-all shadow-xs overflow-hidden"
              >
                {/* Product Header Row */}
                <div className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <button
                      onClick={() => setExpandedProductId(isExpanded ? null : product.id)}
                      className="mt-0.5 p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                      title={isExpanded ? 'Recolher Ficha Técnica' : 'Expandir Ficha Técnica'}
                    >
                      {isExpanded ? <ChevronDown className="w-5 h-5" /> : <ChevronRight className="w-5 h-5" />}
                    </button>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 bg-slate-100 text-slate-700 rounded-md">
                          {product.code}
                        </span>
                        <h3 className="text-base font-bold text-slate-900">
                          {product.name}
                        </h3>
                        {product.category && (
                          <span className="text-xs text-slate-400">· {product.category}</span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 line-clamp-2 max-w-2xl">
                        {product.description || 'Sem descrição cadastrada.'}
                      </p>
                    </div>
                  </div>

                  {/* Metrics and quick stats */}
                  <div className="flex items-center gap-6 text-xs text-slate-600 pl-8 md:pl-0">
                    <div>
                      <span className="text-slate-400 block text-[11px]">Tempo de Processo</span>
                      <div className="flex items-center gap-1 font-mono tabular-nums font-semibold text-slate-800 text-sm mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-amber-500" />
                        {formatProcessTime(product.processTimeMinutes)}
                        <span className="text-slate-400 text-xs font-normal">({product.processTimeMinutes} min)</span>
                      </div>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Estoque Acabado</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 text-sm mt-0.5 block">
                        {product.currentStock} {product.unit}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-400 block text-[11px]">Insumos na BOM</span>
                      <span className="font-mono tabular-nums font-semibold text-slate-800 text-sm mt-0.5 block">
                        {product.materials.length} {product.materials.length === 1 ? 'matéria-prima' : 'matérias-primas'}
                      </span>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onNavigateToProduction(product.id)}
                        className="px-2.5 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors"
                        title="Emitir Ordem de Produção para este produto"
                      >
                        Emitir OP
                      </button>
                      <button
                        onClick={() => handleOpenEditModal(product)}
                        className="p-1.5 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-md transition-colors"
                        title="Editar Produto e Ficha Técnica"
                      >
                        <Pencil className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Tem certeza que deseja excluir o produto "${product.name}"?`)) {
                            onDeleteProduct(product.id);
                          }
                        }}
                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                        title="Excluir Produto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Expanded BOM detail table */}
                {isExpanded && (
                  <div className="bg-slate-50/70 border-t border-slate-200 p-4 sm:p-5">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-600">
                        Estrutura do Produto (BOM) — Consumo Unitário
                      </h4>
                      <span className="text-xs text-slate-400">
                        Cálculo baseado em 1 unidade de {product.unit}
                      </span>
                    </div>

                    <div className="overflow-x-auto border border-slate-200 rounded-lg bg-white">
                      <table className="w-full text-xs text-left">
                        <thead className="bg-slate-100/70 text-slate-600 border-b border-slate-200">
                          <tr>
                            <th className="py-2.5 px-4 font-semibold">Código</th>
                            <th className="py-2.5 px-4 font-semibold">Matéria-Prima</th>
                            <th className="py-2.5 px-4 font-semibold">Consumo por Unidade</th>
                            <th className="py-2.5 px-4 font-semibold">Estoque Atual Almoxarifado</th>
                            <th className="py-2.5 px-4 font-semibold text-right">Potencial de Produção</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {product.materials.map(item => {
                            const raw = materialsMap.get(item.materialId);
                            const currentStock = raw ? raw.currentStock : 0;
                            const potentialUnits = item.quantityNeeded > 0
                              ? Math.floor(currentStock / item.quantityNeeded)
                              : 0;

                            return (
                              <tr key={item.materialId} className="hover:bg-slate-50/60">
                                <td className="py-2.5 px-4 font-mono font-medium text-slate-600">
                                  {raw ? raw.code : '—'}
                                </td>
                                <td className="py-2.5 px-4 font-medium text-slate-800">
                                  {raw ? raw.name : 'Matéria-prima removida do cadastro'}
                                </td>
                                <td className="py-2.5 px-4 font-mono tabular-nums text-slate-700">
                                  <span className="font-semibold">{item.quantityNeeded}</span> {raw?.unit} / {product.unit}
                                </td>
                                <td className="py-2.5 px-4 font-mono tabular-nums">
                                  <span className={currentStock <= (raw?.minStock || 0) ? 'text-amber-600 font-semibold' : 'text-slate-800'}>
                                    {currentStock} {raw?.unit}
                                  </span>
                                </td>
                                <td className="py-2.5 px-4 font-mono tabular-nums text-right font-medium text-slate-800">
                                  {potentialUnits} unidades
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {/* Modal for Create/Edit Product */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-2xl w-full border border-slate-200 shadow-xl overflow-hidden my-8">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  {editingProduct ? 'Editar Ficha Técnica do Produto' : 'Novo Produto & Ficha Técnica'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Informe dados básicos, tempo de fabricação e adicione os insumos consumidos.
                </p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700 rounded-md"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSave} className="p-6 space-y-5">
              {formError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{formError}</span>
                </div>
              )}

              {/* Basic Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Código Interno *
                  </label>
                  <input
                    type="text"
                    required
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Ex: PA-104"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nome do Produto *
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={e => setName(e.target.value)}
                    placeholder="Ex: Armário de Aço 2 Portas"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Categoria
                  </label>
                  <input
                    type="text"
                    value={category}
                    onChange={e => setCategory(e.target.value)}
                    placeholder="Ex: Mobiliário"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Tempo de Processo (minutos) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      required
                      min={0.1}
                      step="any"
                      value={processTimeMinutes}
                      onChange={e => setProcessTimeMinutes(Math.max(0.1, Number(e.target.value)))}
                      className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400">
                      = {formatProcessTime(processTimeMinutes)}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Estoque Atual Acabado
                  </label>
                  <input
                    type="number"
                    min={0}
                    step={1}
                    value={currentStock}
                    onChange={e => setCurrentStock(Math.max(0, Number(e.target.value)))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Descrição Técnica
                </label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  placeholder="Especificações dimensionais, acabamento e instruções de montagem..."
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900 focus:outline-none"
                />
              </div>

              {/* BOM Materials Section */}
              <div className="pt-3 border-t border-slate-200">
                <div className="flex items-center justify-between mb-2">
                  <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Ficha Técnica (BOM) — Matérias-Primas por Unidade
                  </h4>
                  <span className="text-xs text-slate-500">
                    {materialsList.length} itens adicionados
                  </span>
                </div>

                {/* Add material row */}
                {(() => {
                  const selectedRaw = selectedMatId ? materialsMap.get(selectedMatId) : null;
                  return (
                    <div className="bg-slate-50 p-3 rounded-lg border border-slate-200 mb-3 space-y-2">
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-end gap-3">
                        <div className="flex-1">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Matéria-Prima
                          </label>
                          <select
                            value={selectedMatId}
                            onChange={e => setSelectedMatId(e.target.value)}
                            className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none"
                          >
                            <option value="">Selecione uma matéria-prima...</option>
                            {rawMaterials.map(m => (
                              <option key={m.id} value={m.id}>
                                {m.code} - {m.name} ({m.unit})
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="w-full sm:w-44">
                          <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                            Qtd. por Unidade {selectedRaw ? `(${selectedRaw.unit} / un)` : ''}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              inputMode="decimal"
                              value={matQuantityInput}
                              onChange={e => setMatQuantityInput(e.target.value)}
                              placeholder="1 ou 0.5"
                              className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-md focus:ring-2 focus:ring-slate-900 focus:outline-none font-mono"
                            />
                            {selectedRaw && (
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-mono">
                                {selectedRaw.unit}
                              </span>
                            )}
                          </div>
                        </div>

                        <button
                          type="button"
                          onClick={handleAddMaterialToBOM}
                          className="px-3 py-2 text-xs font-semibold text-white bg-slate-800 hover:bg-slate-700 rounded-md transition-colors whitespace-nowrap self-end"
                        >
                          Adicionar Insumo
                        </button>
                      </div>

                      <div className="text-[11px] text-slate-500">
                        * Aceita números inteiros ou decimais com vírgula ou ponto (ex: <strong>1</strong>, <strong>0,5</strong>, <strong>2.4</strong>). Se selecionar a matéria-prima e salvar, ela será incluída automaticamente.
                      </div>
                    </div>
                  );
                })()}

                {/* Table of BOM items with inline quantity adjustment */}
                {materialsList.length === 0 ? (
                  <div className="p-4 bg-slate-50/60 rounded-lg border border-dashed border-slate-300 text-center">
                    <p className="text-xs text-slate-500">
                      Nenhuma matéria-prima associada ainda. Selecione um insumo acima para adicionar à ficha técnica.
                    </p>
                  </div>
                ) : (
                  <div className="border border-slate-200 rounded-lg overflow-hidden max-h-56 overflow-y-auto">
                    <table className="w-full text-xs text-left">
                      <thead className="bg-slate-100 text-slate-600 border-b border-slate-200">
                        <tr>
                          <th className="py-2 px-3">Código</th>
                          <th className="py-2 px-3">Insumo</th>
                          <th className="py-2 px-3 text-right">Qtd. por Unidade</th>
                          <th className="py-2 px-3 text-center w-12">Ação</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {materialsList.map(item => {
                          const raw = materialsMap.get(item.materialId);
                          return (
                            <tr key={item.materialId} className="hover:bg-slate-50">
                              <td className="py-2 px-3 font-mono text-slate-600">{raw?.code || '—'}</td>
                              <td className="py-2 px-3 font-medium text-slate-800">{raw?.name || 'Insumo não encontrado'}</td>
                              <td className="py-2 px-3 text-right">
                                <div className="inline-flex items-center gap-1.5">
                                  <input
                                    type="text"
                                    inputMode="decimal"
                                    value={item.quantityNeeded}
                                    onChange={e => handleUpdateItemQuantity(item.materialId, e.target.value)}
                                    className="w-20 px-2 py-1 text-xs border border-slate-300 rounded font-mono tabular-nums text-right font-bold text-slate-900 focus:outline-none focus:ring-1 focus:ring-slate-900"
                                    title="Ajuste a quantidade por unidade diretamente aqui"
                                  />
                                  <span className="font-mono text-slate-500 text-xs w-8 text-left">{raw?.unit}</span>
                                </div>
                              </td>
                              <td className="py-2 px-3 text-center">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveMaterialFromBOM(item.materialId)}
                                  className="text-slate-400 hover:text-red-600 transition-colors"
                                  title="Remover insumo"
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

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
                >
                  {editingProduct ? 'Salvar Alterações' : 'Cadastrar Produto'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
