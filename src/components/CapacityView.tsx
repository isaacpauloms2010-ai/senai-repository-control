import React, { useState } from 'react';
import { ProductionCapacity, ProductionOrder, Product } from '../types/erp';
import { calculateCapacityMetrics, formatProcessTime } from '../services/storageService';
import { Gauge, Settings2, Clock, AlertTriangle, CheckCircle, Flame, Users, Calendar, ArrowRight, Activity } from 'lucide-react';

interface CapacityViewProps {
  capacity: ProductionCapacity;
  productionOrders: ProductionOrder[];
  products: Product[];
  onSaveCapacity: (capacity: ProductionCapacity) => void;
  onNavigateToProduction: () => void;
}

export const CapacityView: React.FC<CapacityViewProps> = ({
  capacity,
  productionOrders,
  products,
  onSaveCapacity,
  onNavigateToProduction
}) => {
  const [isEditingSettings, setIsEditingSettings] = useState(false);

  // Form states
  const [periodType, setPeriodType] = useState<'mes' | 'semana'>(capacity.periodType);
  const [periodLabel, setPeriodLabel] = useState(capacity.periodLabel);
  const [workDays, setWorkDays] = useState(capacity.workDaysPerPeriod);
  const [shifts, setShifts] = useState(capacity.shiftsPerDay);
  const [hoursPerShift, setHoursPerShift] = useState(capacity.hoursPerShift);
  const [workers, setWorkers] = useState(capacity.numberOfWorkers);
  const [efficiency, setEfficiency] = useState(capacity.efficiencyRate);
  const [customTotalHours, setCustomTotalHours] = useState<number | undefined>(capacity.customTotalHours);

  // Simulation state
  const [simProductId, setSimProductId] = useState<string>(products[0]?.id || '');
  const [simQuantity, setSimQuantity] = useState<number>(10);

  const productsMap = new Map(products.map(p => [p.id, p]));

  const metrics = calculateCapacityMetrics(capacity, productionOrders);

  // Active orders impacting capacity
  const activeOrders = productionOrders.filter(
    op => op.status === 'Planejada' || op.status === 'Em Produção'
  );

  // Simulation calculation
  const simProduct = productsMap.get(simProductId);
  const simHours = simProduct ? Number(((simProduct.processTimeMinutes * simQuantity) / 60).toFixed(1)) : 0;
  const simulatedTotalHours = Number((metrics.plannedProductionHours + simHours).toFixed(1));
  const simulatedRate = metrics.effectiveCapacityHours > 0
    ? Number(((simulatedTotalHours / metrics.effectiveCapacityHours) * 100).toFixed(1))
    : 0;

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: ProductionCapacity = {
      periodType,
      periodLabel: periodLabel.trim() || (periodType === 'mes' ? 'Mês Vigente' : 'Semana Vigente'),
      workDaysPerPeriod: Number(workDays),
      shiftsPerDay: Number(shifts),
      hoursPerShift: Number(hoursPerShift),
      numberOfWorkers: Number(workers),
      efficiencyRate: Number(efficiency),
      customTotalHours: customTotalHours && customTotalHours > 0 ? Number(customTotalHours) : undefined
    };

    onSaveCapacity(updated);
    setIsEditingSettings(false);
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">
            Capacidade Produtiva da Fábrica (PCP)
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Planejamento de carga fabril vs. horas disponíveis no período de referência.
          </p>
        </div>

        <button
          onClick={() => setIsEditingSettings(!isEditingSettings)}
          className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-300 hover:bg-slate-50 rounded-lg shadow-xs transition-colors self-start sm:self-auto"
        >
          <Settings2 className="w-4 h-4 text-slate-500" />
          {isEditingSettings ? 'Fechar Configurações' : 'Configurar Turnos & Capacidade'}
        </button>
      </div>

      {/* Settings Panel (collapsible) */}
      {isEditingSettings && (
        <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-slate-700" />
              Parâmetros da Capacidade Fabril
            </h3>
            <span className="text-xs text-slate-500">
              Atualize turnos, operadores e taxa de eficiência
            </span>
          </div>

          <form onSubmit={handleSaveSettings} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Tipo de Período
                </label>
                <select
                  value={periodType}
                  onChange={e => setPeriodType(e.target.value as 'mes' | 'semana')}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                >
                  <option value="mes">Mensal</option>
                  <option value="semana">Semanal</option>
                </select>
              </div>

              <div className="sm:col-span-3">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Rótulo do Período de Referência
                </label>
                <input
                  type="text"
                  value={periodLabel}
                  onChange={e => setPeriodLabel(e.target.value)}
                  placeholder="Ex: Outubro 2026 ou Semana 43"
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Dias Úteis
                </label>
                <input
                  type="number"
                  min={1}
                  max={31}
                  required
                  value={workDays}
                  onChange={e => setWorkDays(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Turnos / Dia
                </label>
                <input
                  type="number"
                  min={1}
                  max={4}
                  required
                  value={shifts}
                  onChange={e => setShifts(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Horas / Turno
                </label>
                <input
                  type="number"
                  step="0.5"
                  min={1}
                  max={24}
                  required
                  value={hoursPerShift}
                  onChange={e => setHoursPerShift(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nº de Operadores
                </label>
                <input
                  type="number"
                  min={1}
                  max={100}
                  required
                  value={workers}
                  onChange={e => setWorkers(Math.max(1, Number(e.target.value)))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Eficiência / OEE (%)
                </label>
                <input
                  type="number"
                  min={10}
                  max={100}
                  required
                  value={efficiency}
                  onChange={e => setEfficiency(Math.max(10, Math.min(100, Number(e.target.value))))}
                  className="w-full px-3 py-2 text-xs bg-white border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
                />
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-200">
              <span className="text-xs text-slate-500 font-mono">
                Cálculo: {workDays} dias × {shifts} turnos × {hoursPerShift}h × {workers} operadores × {efficiency}% ={' '}
                <strong className="text-slate-900">
                  {((workDays * shifts * hoursPerShift * workers * efficiency) / 100).toFixed(1)} horas efetivas
                </strong>
              </span>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsEditingSettings(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-200 rounded-md"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-md shadow-xs"
                >
                  Salvar Parâmetros
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* Main KPI Status Strip */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Capacidade Efetiva</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.effectiveCapacityHours}h
            </span>
            <span className="text-xs text-slate-400">no período</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400 font-mono">
            Nominal Bruta: {metrics.nominalGrossHours}h
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Carga Planejada (OPs)</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold font-mono tabular-nums text-slate-900">
              {metrics.plannedProductionHours}h
            </span>
            <span className="text-xs text-slate-400">em {metrics.activeOrdersCount} OPs</span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Ordens Planejadas + Em Produção
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Saldo de Horas</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                metrics.remainingCapacityHours >= 0 ? 'text-emerald-600' : 'text-red-600'
              }`}
            >
              {metrics.remainingCapacityHours >= 0 ? `+${metrics.remainingCapacityHours}h` : `${metrics.remainingCapacityHours}h`}
            </span>
            <span className="text-xs text-slate-400">
              {metrics.remainingCapacityHours >= 0 ? 'disponíveis' : 'déficit'}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            {metrics.remainingCapacityHours >= 0 ? 'Folga para novas demandas' : 'Sobrecarga de fábrica!'}
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="text-xs font-medium text-slate-500">Taxa de Ocupação</div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-2xl font-bold font-mono tabular-nums ${
                metrics.status === 'Sobrecarga'
                  ? 'text-red-600'
                  : metrics.status === 'Equilibrada'
                  ? 'text-amber-600'
                  : 'text-emerald-600'
              }`}
            >
              {metrics.utilizationRatePercentage}%
            </span>
            <span className="text-xs font-semibold text-slate-600">
              {metrics.status}
            </span>
          </div>
          <div className="mt-1 text-[11px] text-slate-400">
            Meta operacional: 75% a 90%
          </div>
        </div>
      </div>

      {/* Visual Capacity Thermometer & Diagnostic Callout */}
      <div className="bg-white border border-slate-200 rounded-xl p-6 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-sm font-bold text-slate-900">
              Termômetro de Ocupação da Fábrica — {capacity.periodLabel}
            </h3>
            <p className="text-xs text-slate-500">
              Comparação visual direta entre as horas de fabricação das OPs ativas e o teto da fábrica.
            </p>
          </div>
          <div className="text-xs font-mono tabular-nums font-semibold text-slate-700">
            {metrics.plannedProductionHours}h / {metrics.effectiveCapacityHours}h alocadas
          </div>
        </div>

        {/* Progress bar container */}
        <div className="space-y-1.5">
          <div className="h-5 w-full bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200 flex items-center">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                metrics.status === 'Sobrecarga'
                  ? 'bg-red-500'
                  : metrics.status === 'Equilibrada'
                  ? 'bg-amber-500'
                  : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, metrics.utilizationRatePercentage)}%` }}
            />
          </div>

          <div className="flex justify-between text-[11px] text-slate-400 font-mono">
            <span>0h (0%)</span>
            <span>50%</span>
            <span className="text-amber-600 font-medium">75% (Ideal)</span>
            <span className="text-slate-800 font-bold">100% ({metrics.effectiveCapacityHours}h)</span>
            <span>120%+</span>
          </div>
        </div>

        {/* Real-time PCP Diagnostic Message */}
        <div
          className={`p-4 rounded-xl border flex items-start gap-3 ${
            metrics.status === 'Sobrecarga'
              ? 'bg-red-50 border-red-200 text-red-900'
              : metrics.status === 'Equilibrada'
              ? 'bg-amber-50 border-amber-200 text-amber-900'
              : 'bg-emerald-50 border-emerald-200 text-emerald-900'
          }`}
        >
          {metrics.status === 'Sobrecarga' ? (
            <Flame className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
          ) : metrics.status === 'Equilibrada' ? (
            <Activity className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
          )}

          <div className="text-xs leading-relaxed">
            {metrics.status === 'Sobrecarga' ? (
              <>
                <strong className="font-bold block mb-0.5">
                  Atenção: A fábrica está em sobrecarga de {Math.abs(metrics.remainingCapacityHours)} horas no período!
                </strong>
                O volume total das Ordens de Produção ({metrics.plannedProductionHours}h) excede a capacidade operacional ({metrics.effectiveCapacityHours}h). A produção <strong>não cabe</strong> no período sem ações corretivas. Ações sugeridas: autorizar horas extras, remanejar datas de entrega de pedidos menos urgentes ou terceirizar operações pontuais.
              </>
            ) : metrics.status === 'Equilibrada' ? (
              <>
                <strong className="font-bold block mb-0.5">
                  Produção viável com ocupação equilibrada ({metrics.utilizationRatePercentage}%)
                </strong>
                A produção planejada ({metrics.plannedProductionHours}h) <strong>cabe com precisão</strong> na capacidade disponível do período ({metrics.effectiveCapacityHours}h), com margem residual de {metrics.remainingCapacityHours}h para absorver pequenos imprevistos.
              </>
            ) : (
              <>
                <strong className="font-bold block mb-0.5">
                  Produção viável com folga de {metrics.remainingCapacityHours} horas ({metrics.utilizationRatePercentage}% de ocupação)
                </strong>
                A produção planejada ({metrics.plannedProductionHours}h) <strong>cabe com tranquilidade</strong> no período. A fábrica possui disponibilidade produtiva para absorver novas Ordens de Produção e antecipar pedidos de clientes.
              </>
            )}
          </div>
        </div>
      </div>

      {/* Simulator Section & Active Orders Detail Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Simulator Card */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <div className="flex items-center gap-2 mb-3">
            <Gauge className="w-4 h-4 text-slate-700" />
            <h3 className="text-sm font-bold text-slate-900">
              Simulador de Carga Produtiva
            </h3>
          </div>
          <p className="text-xs text-slate-500 mb-4">
            Avalie se uma nova ordem de produção cabe na capacidade antes de emitir.
          </p>

          <div className="space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Selecione o Produto
              </label>
              <select
                value={simProductId}
                onChange={e => setSimProductId(e.target.value)}
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
                Quantidade a Simular
              </label>
              <input
                type="number"
                min={1}
                value={simQuantity}
                onChange={e => setSimQuantity(Math.max(1, Number(e.target.value)))}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono focus:ring-2 focus:ring-slate-900"
              />
            </div>

            {simProduct && (
              <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs space-y-2 mt-2">
                <div className="flex justify-between">
                  <span className="text-slate-500">Tempo de Ciclo Unitário:</span>
                  <span className="font-mono text-slate-800 font-medium">
                    {formatProcessTime(simProduct.processTimeMinutes)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Horas Adicionadas:</span>
                  <span className="font-mono font-bold text-slate-900">
                    +{simHours} horas
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                  <span className="text-slate-700 font-semibold">Nova Ocupação Total:</span>
                  <span
                    className={`font-mono font-bold ${
                      simulatedRate > 100 ? 'text-red-600' : 'text-emerald-700'
                    }`}
                  >
                    {simulatedRate}% ({simulatedTotalHours}h)
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 italic mt-1">
                  {simulatedRate <= 100
                    ? `✓ Cabe no período! Restarão ${(metrics.effectiveCapacityHours - simulatedTotalHours).toFixed(1)}h livres.`
                    : `✗ Ultrapassa o teto do período em ${(simulatedTotalHours - metrics.effectiveCapacityHours).toFixed(1)}h.`}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Active Orders List Consuming Hours */}
        <div className="lg:col-span-2 bg-white border border-slate-200 rounded-xl p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className="text-sm font-bold text-slate-900">
                  Ordens de Produção Alocadas na Capacidade
                </h3>
                <p className="text-xs text-slate-500">
                  {activeOrders.length} ordens ativas gerando carga fabril de {metrics.plannedProductionHours} horas.
                </p>
              </div>

              <button
                onClick={onNavigateToProduction}
                className="text-xs text-slate-700 hover:text-slate-900 font-semibold inline-flex items-center gap-1"
              >
                Ver OPs <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="overflow-x-auto border border-slate-200 rounded-lg">
              <table className="w-full text-xs text-left">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold">
                  <tr>
                    <th className="py-2.5 px-3">Código OP</th>
                    <th className="py-2.5 px-3">Produto</th>
                    <th className="py-2.5 px-3 text-right">Qtd</th>
                    <th className="py-2.5 px-3 text-right">Carga Horária</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Entrega Meta</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {activeOrders.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-6 text-center text-slate-400">
                        Nenhuma ordem de produção ativa no momento.
                      </td>
                    </tr>
                  ) : (
                    activeOrders.map(op => {
                      const prod = productsMap.get(op.productId);
                      return (
                        <tr key={op.id} className="hover:bg-slate-50">
                          <td className="py-2.5 px-3 font-mono font-semibold text-slate-800">
                            {op.code}
                          </td>
                          <td className="py-2.5 px-3 font-medium text-slate-800 max-w-xs truncate">
                            {prod ? prod.name : 'Produto removido'}
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-semibold text-slate-700">
                            {op.quantity} un
                          </td>
                          <td className="py-2.5 px-3 text-right font-mono tabular-nums font-bold text-slate-900">
                            {op.estimatedDurationHours}h
                          </td>
                          <td className="py-2.5 px-3">
                            <span
                              className={`text-[11px] font-medium ${
                                op.status === 'Em Produção'
                                  ? 'text-amber-700 font-semibold'
                                  : 'text-slate-600'
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

          <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400 flex items-center justify-between">
            <span>Duração calculada automaticamente pelo tempo unitário da Ficha Técnica.</span>
            <span>Total: <strong className="text-slate-700 font-mono">{metrics.plannedProductionHours}h</strong></span>
          </div>
        </div>
      </div>
    </div>
  );
};
