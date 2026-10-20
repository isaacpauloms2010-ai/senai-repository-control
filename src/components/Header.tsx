import React from 'react';
import { Factory, Download, Upload, RotateCcw, ShieldCheck } from 'lucide-react';
import { AppData } from '../types/erp';

interface HeaderProps {
  currentDateFormatted: string;
  onExportBackup: () => void;
  onImportBackup: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onResetData: () => void;
  appData: AppData;
}

export const Header: React.FC<HeaderProps> = ({
  currentDateFormatted,
  onExportBackup,
  onImportBackup,
  onResetData,
  appData
}) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const activeOpsCount = appData.productionOrders.filter(
    op => op.status === 'Planejada' || op.status === 'Em Produção'
  ).length;

  const lowStockCount = appData.rawMaterials.filter(
    m => m.currentStock <= m.minStock
  ).length;

  return (
    <header className="h-16 bg-white border-b border-slate-200 px-4 md:px-8 flex items-center justify-between gap-4 sticky top-0 z-20">
      {/* Zone 1: Brand title */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-lg bg-slate-900 text-white flex items-center justify-center shadow-xs">
          <Factory className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <span className="text-base font-bold tracking-tight text-slate-900 whitespace-nowrap">
            ManufacERP
          </span>
          <span className="hidden sm:inline-block ml-2 text-xs text-slate-500 font-medium">
            PCP Industrial
          </span>
        </div>
      </div>

      {/* Zone 2: Real-time quick context (unboxed, clean typography) */}
      <div className="hidden lg:flex items-center gap-4 text-xs text-slate-600 font-medium">
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Data Base:</span>
          <span className="font-mono tabular-nums text-slate-800">{currentDateFormatted}</span>
        </div>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">OPs Ativas:</span>
          <span className="font-mono tabular-nums text-slate-800 font-semibold">{activeOpsCount}</span>
        </div>
        <span className="text-slate-300" aria-hidden="true">·</span>
        <div className="flex items-center gap-1.5">
          <span className="text-slate-400">Estoque Crítico:</span>
          <span className={`font-mono tabular-nums font-semibold ${lowStockCount > 0 ? 'text-amber-600' : 'text-slate-800'}`}>
            {lowStockCount} {lowStockCount === 1 ? 'item' : 'itens'}
          </span>
        </div>
      </div>

      {/* Zone 3: Data actions */}
      <div className="flex items-center gap-2">
        <input
          type="file"
          ref={fileInputRef}
          onChange={onImportBackup}
          accept=".json"
          className="hidden"
        />

        <button
          onClick={onExportBackup}
          title="Exportar backup dos dados (JSON)"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
        >
          <Download className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Backup</span>
        </button>

        <button
          onClick={() => fileInputRef.current?.click()}
          title="Restaurar backup de arquivo JSON"
          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-md transition-colors whitespace-nowrap"
        >
          <Upload className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Restaurar</span>
        </button>

        <button
          onClick={onResetData}
          title="Recarregar dados iniciais de exemplo"
          className="inline-flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-md transition-colors"
        >
          <RotateCcw className="w-3.5 h-3.5" />
        </button>
      </div>
    </header>
  );
};
