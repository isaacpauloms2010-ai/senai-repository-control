import { AppData, Product, RawMaterial, OpMaterialRequirement, ProductionCapacity, ProductionOrder } from '../types/erp';
import { initialMockData } from '../data/mockData';

const STORAGE_KEY = 'manufac_erp_production_data_v2';

export const storageService = {
  loadData(): AppData {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) {
        this.saveData(initialMockData);
        return initialMockData;
      }
      const parsed = JSON.parse(stored) as AppData;
      // Sanity checks or update to new product catalog if using previous mock dataset
      if (
        !parsed.products ||
        !parsed.rawMaterials ||
        !parsed.productionOrders ||
        !parsed.capacity ||
        !parsed.products.some(p => p.code === 'CAN-101')
      ) {
        this.saveData(initialMockData);
        return initialMockData;
      }
      return parsed;
    } catch (e) {
      console.error('Erro ao carregar dados do localStorage:', e);
      return initialMockData;
    }
  },

  saveData(data: AppData): void {
    try {
      const dataToSave: AppData = {
        ...data,
        lastUpdated: new Date().toISOString()
      };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(dataToSave));
    } catch (e) {
      console.error('Erro ao salvar dados no localStorage:', e);
    }
  },

  resetToDefault(): AppData {
    localStorage.removeItem(STORAGE_KEY);
    this.saveData(initialMockData);
    return JSON.parse(JSON.stringify(initialMockData));
  },

  exportBackup(data: AppData): void {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', jsonString);
    downloadAnchor.setAttribute(
      'download',
      `backup-manufac-erp-${new Date().toISOString().split('T')[0]}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  },

  importBackup(jsonString: string): AppData {
    const parsed = JSON.parse(jsonString) as AppData;
    if (!parsed.products || !parsed.rawMaterials || !parsed.productionOrders) {
      throw new Error('Formato de arquivo de backup inválido. Chaves essenciais não encontradas.');
    }
    this.saveData(parsed);
    return parsed;
  }
};

/**
 * Funções de Cálculo do PCP (Planejamento e Controle de Produção)
 */

export function calculateBOMRequirements(
  product: Product | undefined,
  quantityToProduce: number,
  allMaterials: RawMaterial[]
): OpMaterialRequirement[] {
  if (!product || !product.materials || quantityToProduce <= 0) return [];

  const materialsMap = new Map<string, RawMaterial>();
  allMaterials.forEach(m => materialsMap.set(m.id, m));

  return product.materials.map(item => {
    const raw = materialsMap.get(item.materialId);
    const totalNeeded = Number((item.quantityNeeded * quantityToProduce).toFixed(3));
    const currentStock = raw ? raw.currentStock : 0;
    const isStockSufficient = currentStock >= totalNeeded;
    const deficit = isStockSufficient ? 0 : Number((totalNeeded - currentStock).toFixed(3));

    return {
      materialId: item.materialId,
      materialCode: raw ? raw.code : '—',
      materialName: raw ? raw.name : 'Material Desconhecido',
      unit: raw ? raw.unit : 'un',
      quantityPerUnit: item.quantityNeeded,
      totalNeeded,
      currentStock,
      isStockSufficient,
      deficit
    };
  });
}

export function formatProcessTime(totalMinutes: number): string {
  if (totalMinutes <= 0) return '0 min';
  const hours = Math.floor(totalMinutes / 60);
  const rawMins = totalMinutes % 60;
  const mins = rawMins % 1 === 0 ? rawMins : Number(rawMins.toFixed(1));
  if (hours === 0) return `${mins} min`;
  if (mins === 0) return `${hours}h`;
  return `${hours}h ${mins}min`;
}

export function calculateOrderDurationHours(product: Product | undefined, quantity: number): number {
  if (!product || quantity <= 0) return 0;
  return Number(((product.processTimeMinutes * quantity) / 60).toFixed(2));
}

export interface CapacityMetricsResult {
  periodLabel: string;
  nominalGrossHours: number;
  effectiveCapacityHours: number;
  plannedProductionHours: number; // Ordens Planejadas + Em Produção
  completedProductionHours: number;
  remainingCapacityHours: number;
  utilizationRatePercentage: number;
  status: 'Folga' | 'Equilibrada' | 'Sobrecarga';
  activeOrdersCount: number;
}

export function calculateCapacityMetrics(
  capacity: ProductionCapacity,
  productionOrders: ProductionOrder[]
): CapacityMetricsResult {
  // Cálculo da capacidade nominal bruta em horas com validação contra 0 ou NaN
  const workDays = Math.max(1, capacity.workDaysPerPeriod || 22);
  const shifts = Math.max(1, capacity.shiftsPerDay || 1);
  const hoursPerShift = Math.max(0.1, capacity.hoursPerShift || 8);
  const workers = Math.max(1, capacity.numberOfWorkers || 1);
  const efficiency = Math.max(1, Math.min(100, capacity.efficiencyRate || 85));

  const grossHours = capacity.customTotalHours && capacity.customTotalHours > 0
    ? capacity.customTotalHours
    : workDays * shifts * hoursPerShift * workers;

  // Capacidade Efetiva considerando OEE/eficiência
  const effectiveCapacityHours = Number((grossHours * (efficiency / 100)).toFixed(1));

  // Soma de horas das ordens ativas (Planejada e Em Produção)
  const activeOrders = productionOrders.filter(
    op => op.status === 'Planejada' || op.status === 'Em Produção'
  );

  const plannedProductionHours = Number(
    activeOrders.reduce((sum, op) => sum + (Number(op.estimatedDurationHours) || 0), 0).toFixed(1)
  );

  const completedOrders = productionOrders.filter(op => op.status === 'Concluída');
  const completedProductionHours = Number(
    completedOrders.reduce((sum, op) => sum + (Number(op.estimatedDurationHours) || 0), 0).toFixed(1)
  );

  const remainingCapacityHours = Number(
    (effectiveCapacityHours - plannedProductionHours).toFixed(1)
  );

  const utilizationRatePercentage = effectiveCapacityHours > 0
    ? Number(((plannedProductionHours / effectiveCapacityHours) * 100).toFixed(1))
    : 0;

  let status: 'Folga' | 'Equilibrada' | 'Sobrecarga' = 'Folga';
  if (utilizationRatePercentage > 100) {
    status = 'Sobrecarga';
  } else if (utilizationRatePercentage >= 75) {
    status = 'Equilibrada';
  }

  return {
    periodLabel: capacity.periodLabel,
    nominalGrossHours: Number(grossHours.toFixed(1)),
    effectiveCapacityHours,
    plannedProductionHours,
    completedProductionHours,
    remainingCapacityHours,
    utilizationRatePercentage,
    status,
    activeOrdersCount: activeOrders.length
  };
}
