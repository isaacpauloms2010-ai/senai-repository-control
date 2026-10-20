import React, { useState, useEffect } from 'react';
import {
  AppData,
  Product,
  RawMaterial,
  Client,
  Supplier,
  CustomerOrder,
  ProductionOrder,
  ProductionCapacity,
  ProductionOrderStatus
} from './types/erp';
import { storageService, calculateOrderDurationHours } from './services/storageService';
import { Header } from './components/Header';
import { Sidebar, NavTab } from './components/Sidebar';
import { DashboardView } from './components/DashboardView';
import { ProductsView } from './components/ProductsView';
import { MaterialsView } from './components/MaterialsView';
import { CapacityView } from './components/CapacityView';
import { OrdersView } from './components/OrdersView';
import { ProductionOrdersView } from './components/ProductionOrdersView';
import { PartnersView } from './components/PartnersView';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function App() {
  const [appData, setAppData] = useState<AppData>(() => storageService.loadData());
  const [activeTab, setActiveTab] = useState<NavTab>('dashboard');

  // Navigation passing context (e.g. from Products or Orders to OP creation)
  const [navMeta, setNavMeta] = useState<{ productId?: string; orderId?: string }>({});

  // Notification Toast State
  const [toast, setToast] = useState<{
    message: string;
    type: 'success' | 'warning' | 'info';
  } | null>(null);

  const showToast = (message: string, type: 'success' | 'warning' | 'info' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  // Sync state to local storage whenever appData changes
  useEffect(() => {
    storageService.saveData(appData);
  }, [appData]);

  // Handle Tab Navigation
  const handleSelectTab = (tab: NavTab, meta?: { productId?: string; orderId?: string }) => {
    setActiveTab(tab);
    if (meta) {
      setNavMeta(meta);
    } else {
      setNavMeta({});
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Backup & Restore
  const handleExportBackup = () => {
    storageService.exportBackup(appData);
    showToast('Backup exportado com sucesso no formato JSON!', 'success');
  };

  const handleImportBackup = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = e => {
      try {
        const content = e.target?.result as string;
        const importedData = storageService.importBackup(content);
        setAppData(importedData);
        showToast('Backup restaurado e dados sincronizados com sucesso!', 'success');
      } catch (err: unknown) {
        const errorMsg = err instanceof Error ? err.message : 'Falha ao processar arquivo JSON';
        showToast(`Erro na importação: ${errorMsg}`, 'warning');
      }
    };
    reader.readAsText(file);
    // Reset file input
    event.target.value = '';
  };

  const handleResetData = () => {
    if (
      confirm(
        'Deseja recarregar os dados padrão de fábrica? Todas as alterações manuais serão substituídas pelo conjunto de demonstração.'
      )
    ) {
      const reset = storageService.resetToDefault();
      setAppData(reset);
      showToast('Dados restaurados para o modelo padrão da indústria.', 'info');
    }
  };

  // CRUD Products
  const handleSaveProduct = (product: Product) => {
    const exists = appData.products.some(p => p.id === product.id);
    let updatedProducts: Product[];
    if (exists) {
      updatedProducts = appData.products.map(p => (p.id === product.id ? product : p));
      showToast(`Produto "${product.name}" atualizado com sucesso.`, 'success');
    } else {
      updatedProducts = [product, ...appData.products];
      showToast(`Produto "${product.name}" e ficha técnica cadastrados.`, 'success');
    }
    setAppData(prev => ({ ...prev, products: updatedProducts }));
  };

  const handleDeleteProduct = (productId: string) => {
    // Check if in use in active OPs or orders
    const inUseInOps = appData.productionOrders.some(
      op => op.productId === productId && (op.status === 'Planejada' || op.status === 'Em Produção')
    );
    if (inUseInOps) {
      showToast('Não é possível excluir: existem Ordens de Produção ativas vinculadas a este produto.', 'warning');
      return;
    }

    setAppData(prev => ({
      ...prev,
      products: prev.products.filter(p => p.id !== productId)
    }));
    showToast('Produto removido da base de dados.', 'info');
  };

  // CRUD Raw Materials
  const handleSaveMaterial = (material: RawMaterial) => {
    const exists = appData.rawMaterials.some(m => m.id === material.id);
    let updatedMaterials: RawMaterial[];
    if (exists) {
      updatedMaterials = appData.rawMaterials.map(m => (m.id === material.id ? material : m));
      showToast(`Matéria-prima "${material.name}" atualizada.`, 'success');
    } else {
      updatedMaterials = [material, ...appData.rawMaterials];
      showToast(`Matéria-prima "${material.name}" cadastrada com sucesso.`, 'success');
    }
    setAppData(prev => ({ ...prev, rawMaterials: updatedMaterials }));
  };

  const handleDeleteMaterial = (materialId: string) => {
    // Check if used in any product BOM
    const isUsedInBOM = appData.products.some(p =>
      p.materials.some(m => m.materialId === materialId)
    );
    if (isUsedInBOM) {
      showToast('Não é possível excluir: este insumo está presente na Ficha Técnica de produtos ativos.', 'warning');
      return;
    }

    setAppData(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.filter(m => m.id !== materialId)
    }));
    showToast('Matéria-prima excluída com sucesso.', 'info');
  };

  const handleUpdateMaterialStock = (materialId: string, newStock: number) => {
    setAppData(prev => ({
      ...prev,
      rawMaterials: prev.rawMaterials.map(m =>
        m.id === materialId ? { ...m, currentStock: newStock } : m
      )
    }));
    showToast('Estoque de matéria-prima atualizado.', 'success');
  };

  // Capacity Settings
  const handleSaveCapacity = (newCapacity: ProductionCapacity) => {
    setAppData(prev => ({ ...prev, capacity: newCapacity }));
    showToast('Parâmetros de capacidade produtiva e turnos atualizados.', 'success');
  };

  // CRUD Partners (Clients & Suppliers)
  const handleSaveClient = (client: Client) => {
    const exists = appData.clients.some(c => c.id === client.id);
    const updated = exists
      ? appData.clients.map(c => (c.id === client.id ? client : c))
      : [client, ...appData.clients];
    setAppData(prev => ({ ...prev, clients: updated }));
    showToast(`Cliente "${client.name}" salvo com sucesso.`, 'success');
  };

  const handleDeleteClient = (clientId: string) => {
    const hasOrders = appData.customerOrders.some(o => o.clientId === clientId);
    if (hasOrders) {
      showToast('Não é possível excluir: cliente possui pedidos registrados.', 'warning');
      return;
    }
    setAppData(prev => ({
      ...prev,
      clients: prev.clients.filter(c => c.id !== clientId)
    }));
    showToast('Cliente removido.', 'info');
  };

  const handleSaveSupplier = (supplier: Supplier) => {
    const exists = appData.suppliers.some(s => s.id === supplier.id);
    const updated = exists
      ? appData.suppliers.map(s => (s.id === supplier.id ? supplier : s))
      : [supplier, ...appData.suppliers];
    setAppData(prev => ({ ...prev, suppliers: updated }));
    showToast(`Fornecedor "${supplier.name}" salvo com sucesso.`, 'success');
  };

  const handleDeleteSupplier = (supplierId: string) => {
    setAppData(prev => ({
      ...prev,
      suppliers: prev.suppliers.filter(s => s.id !== supplierId)
    }));
    showToast('Fornecedor removido.', 'info');
  };

  // Customer Orders
  const handleSaveOrder = (order: CustomerOrder) => {
    const exists = appData.customerOrders.some(o => o.id === order.id);
    const updated = exists
      ? appData.customerOrders.map(o => (o.id === order.id ? order : o))
      : [order, ...appData.customerOrders];
    setAppData(prev => ({ ...prev, customerOrders: updated }));
    showToast(`Pedido "${order.code}" registrado com sucesso.`, 'success');
  };

  const handleDeleteOrder = (orderId: string) => {
    setAppData(prev => ({
      ...prev,
      customerOrders: prev.customerOrders.filter(o => o.id !== orderId)
    }));
    showToast('Pedido cancelado e excluído.', 'info');
  };

  // Direct Emission of Production Orders from Customer Order
  const handleGenerateProductionOrdersFromOrder = (order: CustomerOrder) => {
    const productsMap = new Map(appData.products.map(p => [p.id, p]));
    const newGeneratedOps: ProductionOrder[] = [];
    const generatedOpIds: string[] = [];

    order.items.forEach((item, index) => {
      const product = productsMap.get(item.productId);
      if (!product) return;

      const duration = calculateOrderDurationHours(product, item.quantity);
      const opId = `op-${Date.now()}-${index}`;
      const opCode = `OP-2026-${String(appData.productionOrders.length + newGeneratedOps.length + 86).padStart(3, '0')}`;

      const newOp: ProductionOrder = {
        id: opId,
        code: opCode,
        originOrderId: order.id,
        productId: item.productId,
        quantity: item.quantity,
        createdDate: new Date().toISOString().split('T')[0],
        targetDeliveryDate: order.deliveryDate,
        status: 'Planejada',
        estimatedDurationHours: duration,
        stockDeducted: false,
        productStockAdded: false,
        notes: `Ordem gerada automaticamente a partir do Pedido ${order.code}.`
      };

      newGeneratedOps.push(newOp);
      generatedOpIds.push(opId);
    });

    if (newGeneratedOps.length === 0) {
      showToast('Nenhum item válido encontrado no pedido para emitir OP.', 'warning');
      return;
    }

    // Update order status to "Em Produção" and store generatedOpIds
    const updatedOrders = appData.customerOrders.map(o => {
      if (o.id === order.id) {
        return {
          ...o,
          status: 'Em Produção' as const,
          generatedOpIds: [...(o.generatedOpIds || []), ...generatedOpIds]
        };
      }
      return o;
    });

    setAppData(prev => ({
      ...prev,
      customerOrders: updatedOrders,
      productionOrders: [...newGeneratedOps, ...prev.productionOrders]
    }));

    showToast(
      `${newGeneratedOps.length} Ordem(ns) de Produção emitida(s) com sucesso para o Pedido ${order.code}!`,
      'success'
    );

    // Navigate to production screen
    setActiveTab('production');
  };

  // Production Orders CRUD and Status Workflow
  const handleSaveProductionOrder = (order: ProductionOrder) => {
    const exists = appData.productionOrders.some(op => op.id === order.id);
    const updated = exists
      ? appData.productionOrders.map(op => (op.id === order.id ? order : op))
      : [order, ...appData.productionOrders];
    setAppData(prev => ({ ...prev, productionOrders: updated }));
    showToast(`Ordem de Produção "${order.code}" gravada no PCP.`, 'success');
  };

  const handleDeleteProductionOrder = (orderId: string) => {
    setAppData(prev => ({
      ...prev,
      productionOrders: prev.productionOrders.filter(op => op.id !== orderId)
    }));
    showToast('Ordem de Produção excluída.', 'info');
  };

  // Update OP status with inventory synchronization
  const handleUpdateOrderStatus = (
    orderId: string,
    newStatus: ProductionOrderStatus,
    options?: { deductStock?: boolean; addFinishedStock?: boolean }
  ) => {
    const targetOp = appData.productionOrders.find(op => op.id === orderId);
    if (!targetOp) return;

    const product = appData.products.find(p => p.id === targetOp.productId);
    let updatedMaterials = [...appData.rawMaterials];
    let updatedProducts = [...appData.products];

    let stockDeducted = targetOp.stockDeducted;
    let productStockAdded = targetOp.productStockAdded;

    // Deduct raw materials if requested and not yet deducted
    if (options?.deductStock && !targetOp.stockDeducted && product) {
      const deductionMap = new Map<string, number>();
      product.materials.forEach(item => {
        const needed = item.quantityNeeded * targetOp.quantity;
        deductionMap.set(item.materialId, needed);
      });

      updatedMaterials = updatedMaterials.map(mat => {
        const deduction = deductionMap.get(mat.id);
        if (deduction !== undefined) {
          const newCurrentStock = Math.max(0, Number((mat.currentStock - deduction).toFixed(3)));
          return { ...mat, currentStock: newCurrentStock };
        }
        return mat;
      });

      stockDeducted = true;
    }

    // Add finished product stock upon completion if requested
    if (options?.addFinishedStock && !targetOp.productStockAdded && product) {
      updatedProducts = updatedProducts.map(p => {
        if (p.id === product.id) {
          return { ...p, currentStock: p.currentStock + targetOp.quantity };
        }
        return p;
      });

      productStockAdded = true;
    }

    const updatedOps = appData.productionOrders.map(op => {
      if (op.id === orderId) {
        return {
          ...op,
          status: newStatus,
          stockDeducted,
          productStockAdded
        };
      }
      return op;
    });

    // Check if all OPs for origin order are complete
    let updatedOrders = appData.customerOrders;
    if (newStatus === 'Concluída' && targetOp.originOrderId) {
      const allOpsForOrder = updatedOps.filter(op => op.originOrderId === targetOp.originOrderId);
      const allCompleted = allOpsForOrder.length > 0 && allOpsForOrder.every(op => op.status === 'Concluída');
      if (allCompleted) {
        updatedOrders = updatedOrders.map(o =>
          o.id === targetOp.originOrderId ? { ...o, status: 'Entregue' } : o
        );
      }
    }

    setAppData(prev => ({
      ...prev,
      productionOrders: updatedOps,
      rawMaterials: updatedMaterials,
      products: updatedProducts,
      customerOrders: updatedOrders
    }));

    showToast(`Status da ${targetOp.code} alterado para "${newStatus}".`, 'success');
  };

  const currentDateFormatted = new Date().toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  });

  const pendingOrdersCount = appData.customerOrders.filter(
    o => o.status === 'Pendente'
  ).length;

  const activeOpsCount = appData.productionOrders.filter(
    op => op.status === 'Planejada' || op.status === 'Em Produção'
  ).length;

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col antialiased text-slate-900 font-sans">
      {/* Top Header */}
      <Header
        currentDateFormatted={currentDateFormatted}
        onExportBackup={handleExportBackup}
        onImportBackup={handleImportBackup}
        onResetData={handleResetData}
        appData={appData}
      />

      {/* Main Body with Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto p-4 md:p-6 gap-6">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          onSelectTab={handleSelectTab}
          pendingOrdersCount={pendingOrdersCount}
          activeOpsCount={activeOpsCount}
        />

        {/* Viewport Content */}
        <main className="flex-1 min-w-0">
          {activeTab === 'dashboard' && (
            <DashboardView
              appData={appData}
              onNavigateTab={handleSelectTab}
            />
          )}

          {activeTab === 'products' && (
            <ProductsView
              products={appData.products}
              rawMaterials={appData.rawMaterials}
              onSaveProduct={handleSaveProduct}
              onDeleteProduct={handleDeleteProduct}
              onNavigateToProduction={(productId?: string) =>
                handleSelectTab('production', { productId })
              }
            />
          )}

          {activeTab === 'materials' && (
            <MaterialsView
              rawMaterials={appData.rawMaterials}
              suppliers={appData.suppliers}
              onSaveMaterial={handleSaveMaterial}
              onDeleteMaterial={handleDeleteMaterial}
              onUpdateStock={handleUpdateMaterialStock}
            />
          )}

          {activeTab === 'capacity' && (
            <CapacityView
              capacity={appData.capacity}
              productionOrders={appData.productionOrders}
              products={appData.products}
              onSaveCapacity={handleSaveCapacity}
              onNavigateToProduction={() => handleSelectTab('production')}
            />
          )}

          {activeTab === 'orders' && (
            <OrdersView
              orders={appData.customerOrders}
              clients={appData.clients}
              products={appData.products}
              productionOrders={appData.productionOrders}
              onSaveOrder={handleSaveOrder}
              onDeleteOrder={handleDeleteOrder}
              onGenerateProductionOrdersFromOrder={handleGenerateProductionOrdersFromOrder}
              onNavigateToProduction={(orderId?: string) =>
                handleSelectTab('production', { orderId })
              }
            />
          )}

          {activeTab === 'production' && (
            <ProductionOrdersView
              productionOrders={appData.productionOrders}
              products={appData.products}
              rawMaterials={appData.rawMaterials}
              customerOrders={appData.customerOrders}
              onSaveProductionOrder={handleSaveProductionOrder}
              onDeleteProductionOrder={handleDeleteProductionOrder}
              onUpdateOrderStatus={handleUpdateOrderStatus}
              initialProductId={navMeta.productId}
              initialOrderId={navMeta.orderId}
            />
          )}

          {activeTab === 'partners' && (
            <PartnersView
              clients={appData.clients}
              suppliers={appData.suppliers}
              onSaveClient={handleSaveClient}
              onDeleteClient={handleDeleteClient}
              onSaveSupplier={handleSaveSupplier}
              onDeleteSupplier={handleDeleteSupplier}
            />
          )}
        </main>
      </div>

      {/* Floating Notification Toast */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-lg bg-slate-900 text-white shadow-lg border border-slate-700 animate-in fade-in slide-in-from-bottom-2 text-xs font-medium max-w-md">
          {toast.type === 'success' && (
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
          )}
          {toast.type === 'warning' && (
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
          )}
          {toast.type === 'info' && (
            <Info className="w-4 h-4 text-blue-400 shrink-0" />
          )}
          <span className="flex-1">{toast.message}</span>
          <button
            onClick={() => setToast(null)}
            className="text-slate-400 hover:text-white"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
