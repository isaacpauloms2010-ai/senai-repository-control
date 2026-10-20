export type UnitOfMeasure = 'kg' | 'm' | 'm²' | 'un' | 'l' | 'g' | 'peça' | 'conjunto';

export interface RawMaterial {
  id: string;
  code: string;
  name: string;
  unit: UnitOfMeasure;
  currentStock: number;
  minStock: number;
  costPerUnit?: number;
  supplierId?: string;
  notes?: string;
}

export interface ProductMaterialItem {
  materialId: string;
  quantityNeeded: number; // Quantidade de matéria-prima necessária por 1 unidade de produto
}

export interface Product {
  id: string;
  code: string;
  name: string;
  description: string;
  unit: string; // padrão: 'un'
  processTimeMinutes: number; // Tempo de processo de fabricação por unidade em minutos
  materials: ProductMaterialItem[]; // Ficha técnica (BOM)
  currentStock: number; // Estoque de produto acabado
  category?: string;
}

export interface Address {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
}

export interface Client {
  id: string;
  name: string;
  document: string; // CNPJ ou CPF
  contactName: string;
  phone: string;
  email: string;
  address: Address;
  notes?: string;
}

export interface Supplier {
  id: string;
  name: string;
  document: string; // CNPJ
  contactName: string;
  phone: string;
  email: string;
  category: string;
  address: Address;
  notes?: string;
}

export interface OrderItem {
  productId: string;
  quantity: number;
}

export type OrderStatus = 'Pendente' | 'Em Produção' | 'Entregue' | 'Cancelado';

export interface CustomerOrder {
  id: string;
  code: string;
  clientId: string;
  orderDate: string; // YYYY-MM-DD
  deliveryDate: string; // YYYY-MM-DD
  items: OrderItem[];
  status: OrderStatus;
  notes?: string;
  generatedOpIds?: string[]; // IDs das OPs geradas a partir deste pedido
}

export type ProductionOrderStatus = 'Planejada' | 'Em Produção' | 'Concluída' | 'Cancelada';

export interface OpMaterialRequirement {
  materialId: string;
  materialName: string;
  unit: UnitOfMeasure;
  quantityPerUnit: number;
  totalNeeded: number;
  currentStock: number;
  isStockSufficient: boolean;
  deficit: number;
}

export interface ProductionOrder {
  id: string;
  code: string;
  originOrderId?: string; // Vínculo com pedido de cliente, se houver
  productId: string;
  quantity: number;
  createdDate: string; // YYYY-MM-DD
  targetDeliveryDate: string; // YYYY-MM-DD
  status: ProductionOrderStatus;
  estimatedDurationHours: number; // (processTimeMinutes * quantity) / 60
  stockDeducted: boolean; // se as matérias-primas já foram baixadas
  productStockAdded: boolean; // se os produtos acabados foram adicionados ao estoque
  notes?: string;
}

export interface ProductionCapacity {
  periodType: 'semana' | 'mes';
  periodLabel: string; // ex: "Mês Atual (Outubro)" ou "Semana Atual (Semana 43)"
  workDaysPerPeriod: number; // dias úteis (ex: 22 dias no mês, 5 dias na semana)
  shiftsPerDay: number; // turnos de trabalho (ex: 1)
  hoursPerShift: number; // horas por turno (ex: 8)
  numberOfWorkers: number; // quantidade de operadores/postos de trabalho produtivos
  efficiencyRate: number; // taxa de eficiência estimada em % (ex: 85%)
  customTotalHours?: number; // caso deseje definir diretamente a capacidade nominal
}

export interface AppData {
  rawMaterials: RawMaterial[];
  products: Product[];
  clients: Client[];
  suppliers: Supplier[];
  customerOrders: CustomerOrder[];
  productionOrders: ProductionOrder[];
  capacity: ProductionCapacity;
  lastUpdated: string;
}
