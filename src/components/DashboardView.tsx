import React from 'react';
import { AppData, Product, RawMaterial, ProductionOrder } from '../types/erp';
import { calculateCapacityMetrics, formatProcessTime } from '../services/storageService';
import {
  Factory,
  Cog,
  Boxes,
  Gauge,
  ShoppingCart,
  Layers,
  AlertTriangle,
  CheckCircle2,
  Clock,
  ArrowRight,
  TrendingUp,
  Flame,
  Plus
} from 'lucide-react';
import { NavTab } from './Sidebar';

interface DashboardViewProps {
  appData: AppData;
  onNavigateTab: (tab: NavTab, meta?: { productId?: string; orderId?: string }) => void;
  onOpenCreateOpModal?: () => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  appData,
  onNavigateTab
}) => {
  const { rawMaterials, products, customerOrders, productionOrders, capacity } = appData;

  const capacityMetrics = calculateCapacityMetrics(capacity, productionOrders);
  const productsMap = new Map(products.map(p => [p.id, p]));

  // Active OPs
  const activeOps = productionOrders.filter(
    op => op.status === 'Planejada' || op.status === 'Em Produção'
  );

  // Critical raw materials
  const criticalMaterials = rawMaterials.filter(m => m.currentStock <= m.minStock);

  // Pending customer orders
  const pendingOrders = customerOrders.filter(
    o => o.status === 'Pendente' || o.status === 'Em Produção'
  );

  return (
    <div className="space-y-6">
      {/* Top Banner / Welcome */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
            <Factory className="w-4 h-4 text-amber-500" />
            <span>PCP Industrial · Planejamento e Controle da Produção</span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900 mt-1">
            Painel Geral de Manufatura
          </h1>
          <p className="text-sm text-slate-500 mt-0.5">
            Visão consolidada de ordens em andamento, suprimentos críticos e disponibilidade da linha.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => onNavigateTab('production')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-amber-400" />
            Nova OP
          </button>
          <button
            onClick={() => onNavigateTab('orders')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <ShoppingCart className="w-3.5 h-3.5 text-slate-600" />
            Novo Pedido
          </button>
          <button
            onClick={() => onNavigateTab('products')}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
          >
            <Layers className="w-3.5 h-3.5 text-slate-600" />
            Fichas Técnicas
          </button>
        </div>
      </div>

      {/* 4 Core KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* KPI 1: Ordens de Produção Ativas */}
        <div
          onClick={() => onNavigateTab('production')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Ordens em Andamento</span>
            <Cog className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {activeOps.length}
            </span>
            <span className="text-xs text-slate-500">OPs abertas</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{capacityMetrics.plannedProductionHours}h alocadas</span>
            <span className="text-slate-800 font-semibold group-hover:underline flex items-center gap-0.5">
              Acessar <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 2: Capacidade Produtiva */}
        <div
          onClick={() => onNavigateTab('capacity')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Carga da Fábrica</span>
            <Gauge className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                capacityMetrics.status === 'Sobrecarga'
                  ? 'text-red-600'
                  : capacityMetrics.status === 'Equilibrada'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {capacityMetrics.utilizationRatePercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {capacityMetrics.status}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>
              {capacityMetrics.remainingCapacityHours >= 0
                ? `${capacityMetrics.remainingCapacityHours}h livres`
                : `${Math.abs(capacityMetrics.remainingCapacityHours)}h de déficit`}
            </span>
            <span className="text-slate-800 font-semibold group-hover:underline flex items-center gap-0.5">
              Ver Carga <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 3: Insumos Críticos */}
        <div
          onClick={() => onNavigateTab('materials')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Estoque de Matérias-Primas</span>
            <Boxes className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-3xl font-bold font-mono tabular-nums ${
                criticalMaterials.length > 0 ? 'text-amber-600' : 'text-slate-900'
              }`}
            >
              {criticalMaterials.length}
            </span>
            <span className="text-xs text-slate-500">
              {criticalMaterials.length === 1 ? 'item crítico' : 'itens críticos'}
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{rawMaterials.length} itens monitorados</span>
            <span className="text-slate-800 font-semibold group-hover:underline flex items-center gap-0.5">
              Almoxarifado <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>

        {/* KPI 4: Carteira de Pedidos */}
        <div
          onClick={() => onNavigateTab('orders')}
          className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs hover:border-slate-300 transition-all cursor-pointer group"
        >
          <div className="flex items-center justify-between text-slate-500 text-xs font-medium">
            <span>Pedidos em Aberto</span>
            <ShoppingCart className="w-4 h-4 text-slate-400 group-hover:text-slate-900 transition-colors" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-bold font-mono tabular-nums text-slate-900">
              {pendingOrders.length}
            </span>
            <span className="text-xs text-slate-500">em carteira</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500 flex items-center justify-between">
            <span>{customerOrders.length} pedidos totais</span>
            <span className="text-slate-800 font-semibold group-hover:underline flex items-center gap-0.5">
              Pedidos <ArrowRight className="w-3 h-3" />
            </span>
          </div>
        </div>
      </div>

      {/* Mid Section: Production Schedule vs Materials Alert */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left: OPs in Progress & Pipeline */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Fila de Ordens de Produção (Cronograma)
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Próximos lotes de fabricação programados na fábrica.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('production')}
                className="text-xs font-semibold text-slate-700 hover:text-slate-900 inline-flex items-center gap-1"
              >
                Ver Todas ({productionOrders.length}) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Código</th>
                    <th className="py-2.5 px-3">Produto Acabado</th>
                    <th className="py-2.5 px-3 text-right">Lote</th>
                    <th className="py-2.5 px-3 text-right">Tempo Estimado</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Meta de Entrega</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeOps.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Nenhuma ordem de produção em andamento no momento.
                      </td>
                    </tr>
                  ) : (
                    activeOps.slice(0, 5).map(op => {
                      const prod = productsMap.get(op.productId);
                      return (
                        <tr key={op.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            {op.code}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800">
                            {prod ? prod.name : 'Produto removido'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                            {op.quantity} un
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-700">
                            {op.estimatedDurationHours}h
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[11px] font-semibold px-2 py-0.5 rounded ${
                                op.status === 'Em Produção'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {op.status}
                            </span>
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums text-slate-600">
                            {op.targetDeliveryDate}
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
            <span>Durações calculadas a partir da Ficha Técnica (BOM).</span>
            <button
              onClick={() => onNavigateTab('production')}
              className="text-slate-800 font-semibold hover:underline"
            >
              Gerenciar Ordens & Apontamento →
            </button>
          </div>
        </div>

        {/* Right: Low stock materials & Replenishment Alert */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-amber-500" />
                  Alerta de Compras
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Insumos com estoque abaixo do ponto de reposição.
                </p>
              </div>
            </div>

            {criticalMaterials.length === 0 ? (
              <div className="p-6 bg-emerald-50/50 border border-emerald-200 rounded-lg text-center text-xs text-emerald-800 mt-2">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto mb-1.5" />
                <span className="font-semibold block">Estoque Regular</span>
                Nenhuma matéria-prima em nível crítico no momento.
              </div>
            ) : (
              <div className="space-y-2.5 mt-3">
                {criticalMaterials.map(mat => (
                  <div
                    key={mat.id}
                    className="p-3 bg-amber-50/60 border border-amber-200 rounded-lg text-xs flex items-center justify-between gap-2"
                  >
                    <div>
                      <div className="font-semibold text-slate-900">{mat.name}</div>
                      <div className="font-mono text-[11px] text-slate-500">
                        {mat.code} · Mínimo: {mat.minStock} {mat.unit}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-amber-700 text-sm">
                        {mat.currentStock} {mat.unit}
                      </div>
                      <div className="text-[10px] text-amber-600 font-medium">Comprar Insumo</div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              onClick={() => onNavigateTab('materials')}
              className="w-full py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg text-center transition-colors block"
            >
              Ir para Controle de Almoxarifado
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
