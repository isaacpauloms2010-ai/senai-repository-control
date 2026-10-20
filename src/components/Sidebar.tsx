import React from 'react';
import {
  LayoutDashboard,
  Layers,
  Boxes,
  Gauge,
  ShoppingCart,
  Cog,
  Users
} from 'lucide-react';

export type NavTab =
  | 'dashboard'
  | 'products'
  | 'materials'
  | 'capacity'
  | 'orders'
  | 'production'
  | 'partners';

interface SidebarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingOrdersCount: number;
  activeOpsCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingOrdersCount,
  activeOpsCount
}) => {
  const menuItems: Array<{
    id: NavTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
  }> = [
    {
      id: 'dashboard',
      label: 'Visão Geral PCP',
      icon: LayoutDashboard
    },
    {
      id: 'products',
      label: 'Fichas Técnicas (BOM)',
      icon: Layers
    },
    {
      id: 'materials',
      label: 'Matérias-Primas',
      icon: Boxes
    },
    {
      id: 'capacity',
      label: 'Capacidade Produtiva',
      icon: Gauge
    },
    {
      id: 'orders',
      label: 'Pedidos de Clientes',
      icon: ShoppingCart,
      badge: pendingOrdersCount > 0 ? pendingOrdersCount : undefined
    },
    {
      id: 'production',
      label: 'Ordens de Produção',
      icon: Cog,
      badge: activeOpsCount > 0 ? activeOpsCount : undefined
    },
    {
      id: 'partners',
      label: 'Clientes & Fornecedores',
      icon: Users
    }
  ];

  return (
    <aside className="w-full md:w-64 bg-slate-900 text-slate-300 flex-shrink-0 flex flex-col justify-between p-4 border-r border-slate-800">
      <div className="space-y-6">
        <div>
          <div className="text-[11px] font-semibold text-slate-400 tracking-wider uppercase px-3 mb-2">
            Módulos Fabris
          </div>
          <nav className="space-y-1">
            {menuItems.map(item => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => onSelectTab(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-slate-800 text-white shadow-xs'
                      : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-3 truncate">
                    <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-amber-400' : 'text-slate-400'}`} />
                    <span className="truncate">{item.label}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span
                      className={`text-xs px-2 py-0.5 rounded-md font-mono tabular-nums ${
                        isActive
                          ? 'bg-amber-400/20 text-amber-300'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Info card at bottom */}
      <div className="pt-4 border-t border-slate-800/80 text-xs text-slate-500">
        <div className="px-3">
          <p className="font-medium text-slate-400">PCP Enxuto</p>
          <p className="mt-0.5 text-[11px] leading-relaxed text-slate-500">
            Planejamento, roteiro de processo e explosão de materiais sincronizados.
          </p>
        </div>
      </div>
    </aside>
  );
};
