export type PropertyType = 'interno' | 'arrendatario' | 'arrendador';
export type PropertyStatus = 'activo' | 'en_mantenimiento' | 'inactivo';
export type ContractStatus = 'vigente' | 'por_vencer' | 'vencido';
export type MaintenanceStatus = 'pendiente' | 'en_proceso' | 'resuelto';
export type UserRole = 'admin' | 'operaciones' | 'jefatura';
export type ExpenseType = 'luz' | 'agua' | 'gastos_comunes' | 'internet' | 'otros';
export type SemaphoreStatus = 'al_dia' | 'por_vencer' | 'vencido';
export type AssetTag = 'comercial' | 'residencial' | 'industrial' | 'oficina' | 'mixto' | 'terreno' | 'bodega';
export type FutureTaskTag = 'remodelacion' | 'cierre' | 'nuevo' | 'ampliacion' | 'venta' | 'arriendo' | 'regularizacion';

export interface FutureTask {
  id: string;
  tag: FutureTaskTag;
  description: string;
}

export const futureTaskTagLabels: Record<FutureTaskTag, string> = {
  remodelacion: 'Remodelación',
  cierre: 'Cierre',
  nuevo: 'Nuevo',
  ampliacion: 'Ampliación',
  venta: 'Venta',
  arriendo: 'Arriendo',
  regularizacion: 'Regularización',
};

export const futureTaskTagColors: Record<FutureTaskTag, string> = {
  remodelacion: 'bg-amber-100 text-amber-800',
  cierre: 'bg-red-100 text-red-800',
  nuevo: 'bg-emerald-100 text-emerald-800',
  ampliacion: 'bg-blue-100 text-blue-800',
  venta: 'bg-purple-100 text-purple-800',
  arriendo: 'bg-indigo-100 text-indigo-800',
  regularizacion: 'bg-orange-100 text-orange-800',
};

export interface Property {
  id: string;
  name: string;
  type: PropertyType;
  status: PropertyStatus;
  address: string;
  city: string;
  region: string;
  area: number;
  responsible: string;
  contractId: string | null;
  riskLevel: 'ok' | 'warning' | 'critical';
  lat: number;
  lng: number;
  // Legal / identity
  rol: string;
  rut: string;
  avaluoFiscal: number;
  valorContribucion: number;
  seguros: string[];
  escritura: string | null;
  planos: string[];
  // Physical
  assetTags: AssetTag[];
  m2Construidos: number;
  m2Terreno: number;
  photos: string[];
  // New fields
  anexo: string;
  sociedad: string;
  pais: string;
  comuna: string;
  habilitada: boolean;
  amoblada: boolean;
  antiguedad: number; // year built
  valorLibro: number;
  ultimoPago: string | null;
  observaciones: string;
  // Future tasks
  futureTasks: FutureTask[];
}

export interface Contract {
  id: string;
  propertyId: string;
  propertyName: string;
  type: 'arrendatario' | 'arrendador';
  startDate: string;
  endDate: string;
  monthlyAmount: number;
  status: ContractStatus;
  counterpart: string;
  documents: string[];
}

export interface Expense {
  id: string;
  propertyId: string;
  propertyName: string;
  type: ExpenseType;
  accountId: string;
  dueDate: string;
  amount: number;
  status: SemaphoreStatus;
}

export interface MaintenanceTicket {
  id: string;
  propertyId: string;
  propertyName: string;
  title: string;
  description: string;
  status: MaintenanceStatus;
  priority: 'baja' | 'media' | 'alta' | 'critica';
  responsible: string;
  cost: number;
  createdAt: string;
  resolvedAt: string | null;
}

export interface Alert {
  id: string;
  type: 'contrato' | 'mantenimiento' | 'documento' | 'gasto';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  propertyId: string;
  date: string;
  read: boolean;
}

// ── Helpers ──

export function getDaysRemaining(dateStr: string): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + 'T12:00:00');
  target.setHours(0, 0, 0, 0);
  return Math.floor((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export function getContractSemaphore(endDate: string, thresholdDays = 90): SemaphoreStatus {
  const days = getDaysRemaining(endDate);
  if (days < 0) return 'vencido';
  if (days <= thresholdDays) return 'por_vencer';
  return 'al_dia';
}

export function getExpenseSemaphore(dueDate: string, thresholdDays = 7): SemaphoreStatus {
  const days = getDaysRemaining(dueDate);
  if (days < 0) return 'vencido';
  if (days <= thresholdDays) return 'por_vencer';
  return 'al_dia';
}

export function validateRut(rut: string): boolean {
  const clean = rut.replace(/[.\-]/g, '');
  if (clean.length < 2) return false;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1).toUpperCase();
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const expected = 11 - (sum % 11);
  const dvExpected = expected === 11 ? '0' : expected === 10 ? 'K' : String(expected);
  return dv === dvExpected;
}

export function formatRut(rut: string): string {
  const clean = rut.replace(/[.\-]/g, '');
  if (clean.length < 2) return rut;
  const body = clean.slice(0, -1);
  const dv = clean.slice(-1);
  const formatted = body.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return `${formatted}-${dv}`;
}

export const expenseTypeLabels: Record<ExpenseType, string> = {
  luz: 'Luz',
  agua: 'Agua',
  gastos_comunes: 'Gastos Comunes',
  internet: 'Internet',
  otros: 'Otros',
};

export const semaphoreLabels: Record<SemaphoreStatus, string> = {
  al_dia: 'Al día',
  por_vencer: 'Por vencer',
  vencido: 'Vencido',
};

export const assetTagLabels: Record<AssetTag, string> = {
  comercial: 'Comercial',
  residencial: 'Residencial',
  industrial: 'Industrial',
  oficina: 'Oficina',
  mixto: 'Mixto',
  terreno: 'Terreno',
  bodega: 'Bodega',
};

// ── Data generation ──

const cities = ['Santiago Centro', 'Las Condes', 'Providencia', 'Vitacura', 'Ñuñoa', 'La Florida', 'Maipú', 'Concepción', 'Valparaíso', 'Antofagasta', 'Temuco', 'Puerto Montt'];
const comunas = ['Santiago', 'Las Condes', 'Providencia', 'Vitacura', 'Ñuñoa', 'La Florida', 'Maipú', 'Concepción', 'Valparaíso', 'Antofagasta', 'Temuco', 'Puerto Montt'];
const regions = ['Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Biobío', 'Valparaíso', 'Antofagasta', 'Araucanía', 'Los Lagos'];
const cityCoords: [number, number][] = [
  [-33.4489, -70.6693], [-33.4080, -70.5670], [-33.4264, -70.6100], [-33.3850, -70.5790],
  [-33.4560, -70.5980], [-33.5170, -70.5980], [-33.5100, -70.7580], [-36.8270, -73.0500],
  [-33.0460, -71.6200], [-23.6500, -70.4000], [-38.7400, -72.5900], [-41.4700, -72.9400],
];
const responsibles = ['Juan Pérez', 'María González', 'Carlos López', 'Ana Rodríguez', 'Pedro Martínez', 'Sofía Torres', 'Diego Herrera'];
const counterparts = ['Inmobiliaria Andes SpA', 'Corp. Bienes Raíces Pacífico', 'Gestión Inmuebles Sur Ltda.', 'Inversiones Norte S.A.', 'Holding Territorial Central'];
const sociedades = ['Banco Nacional S.A.', 'Filial Inmobiliaria SpA', 'Holding Financiero Ltda.', 'Sociedad de Inversiones Central S.A.'];

const samplePhotos = [
  'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&h=600&fit=crop', // glass skyscraper
  'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&h=600&fit=crop', // corporate office
  'https://images.unsplash.com/photo-1497366811353-6870744d04b2?w=800&h=600&fit=crop', // office building
  'https://images.unsplash.com/photo-1486325212027-8081e485255e?w=800&h=600&fit=crop', // bank facade
  'https://images.unsplash.com/photo-1582407947304-fd86f28f1c20?w=800&h=600&fit=crop', // corporate tower
  'https://images.unsplash.com/photo-1464938050520-ef2270bb8ce8?w=800&h=600&fit=crop', // financial district
  'https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=800&h=600&fit=crop', // city skyscrapers
  'https://images.unsplash.com/photo-1554469384-e58fac16e23a?w=800&h=600&fit=crop', // commercial building
];

const segurosOptions = ['Incendio', 'Terremoto', 'Robo', 'Responsabilidad Civil', 'Todo Riesgo', 'Daños a Terceros'];
const allTags: AssetTag[] = ['comercial', 'residencial', 'industrial', 'oficina', 'mixto', 'terreno', 'bodega'];
const allFutureTags: FutureTaskTag[] = ['remodelacion', 'cierre', 'nuevo', 'ampliacion', 'venta', 'arriendo', 'regularizacion'];

const futureTaskDescriptions: Record<FutureTaskTag, string[]> = {
  remodelacion: ['Remodelación de oficinas piso 2 en noviembre', 'Actualización de fachada exterior', 'Renovación de baños comunes'],
  cierre: ['Cierre definitivo por reorganización', 'Cierre temporal por mantención estructural'],
  nuevo: ['Nueva sucursal en operación Q1 2027', 'Nuevo punto de atención al cliente'],
  ampliacion: ['Ampliación de bodega lateral', 'Ampliación segundo piso oficinas'],
  venta: ['En proceso de tasación para venta', 'Venta programada Q2 2027'],
  arriendo: ['Buscar nuevo arrendatario', 'Renovación de contrato de arriendo'],
  regularizacion: ['Regularización de permisos municipales', 'Regularización de escritura'],
};

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomSubset<T>(arr: T[], min: number, max: number): T[] {
  const count = min + Math.floor(Math.random() * (max - min + 1));
  const shuffled = [...arr].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

function generateRut(seed: number): string {
  const num = 10000000 + (seed * 7919) % 80000000;
  const body = String(num);
  let sum = 0;
  let mul = 2;
  for (let i = body.length - 1; i >= 0; i--) {
    sum += parseInt(body[i]) * mul;
    mul = mul === 7 ? 2 : mul + 1;
  }
  const r = 11 - (sum % 11);
  const dv = r === 11 ? '0' : r === 10 ? 'K' : String(r);
  return `${body}-${dv}`;
}

function generateFutureTasks(seed: number): FutureTask[] {
  if (seed % 3 === 0) return []; // ~1/3 have no tasks
  const count = 1 + (seed % 3);
  const tags = randomSubset(allFutureTags, 1, count);
  return tags.map((tag, i) => ({
    id: `FT-${seed}-${i}`,
    tag,
    description: randomFrom(futureTaskDescriptions[tag]),
  }));
}

function generateProperties(count: number): Property[] {
  const types: PropertyType[] = ['interno', 'arrendatario', 'arrendador'];
  const risks: Property['riskLevel'][] = ['ok', 'warning', 'critical'];
  const names = [
    'Sucursal', 'Oficina', 'Bodega', 'Local Comercial', 'Edificio', 'Casa Matriz', 'Agencia', 'Centro de Operaciones', 'Almacén', 'Torre'
  ];

  return Array.from({ length: count }, (_, i) => {
    const cityIdx = i % cities.length;
    const type = types[i % 3];
    const [baseLat, baseLng] = cityCoords[cityIdx];
    const m2Terreno = 100 + Math.floor(Math.random() * 3000);
    const m2Construidos = Math.floor(m2Terreno * (0.3 + Math.random() * 0.6));
    const lastPayOffset = Math.floor(Math.random() * 90);
    const lastPayDate = new Date();
    lastPayDate.setDate(lastPayDate.getDate() - lastPayOffset);

    return {
      id: `INM-${String(i + 1).padStart(4, '0')}`,
      name: `${randomFrom(names)} ${cities[cityIdx]}`,
      type,
      status: i % 7 === 0 ? 'en_mantenimiento' : i % 11 === 0 ? 'inactivo' : 'activo',
      address: `Av. ${randomFrom(['Apoquindo', 'Providencia', 'Libertador', 'Los Leones', 'Kennedy', 'Irarrázaval'])} ${1000 + i * 37}`,
      city: cities[cityIdx],
      region: regions[cityIdx],
      area: m2Construidos,
      responsible: randomFrom(responsibles),
      contractId: type !== 'interno' ? `CTR-${String(i + 1).padStart(4, '0')}` : null,
      riskLevel: randomFrom(risks),
      lat: baseLat + (Math.random() - 0.5) * 0.04,
      lng: baseLng + (Math.random() - 0.5) * 0.04,
      // Legal
      rol: `${100 + Math.floor(Math.random() * 900)}-${Math.floor(Math.random() * 9000)}`,
      seguros: randomSubset(segurosOptions, 1, 3),
      photos: randomSubset(samplePhotos, 2, 5),
      avaluoFiscal: Math.floor(Math.random() * 800000000) + 50000000,
      rut: formatRut(generateRut(i)),
      assetTags: randomSubset(allTags, 1, 3),
      m2Construidos,
      m2Terreno,
      escritura: i % 3 === 0 ? `Escritura_INM-${String(i + 1).padStart(4, '0')}.pdf` : null,
      planos: i % 2 === 0 ? [`Plano_Piso1_INM-${String(i + 1).padStart(4, '0')}.pdf`, `Plano_Piso2_INM-${String(i + 1).padStart(4, '0')}.pdf`] : [],
      valorContribucion: Math.floor(Math.random() * 5000000) + 200000,
      // New fields
      anexo: i % 4 === 0 ? `Anexo-${String(i + 1).padStart(3, '0')}` : '',
      sociedad: randomFrom(sociedades),
      pais: 'Chile',
      comuna: comunas[cityIdx],
      habilitada: i % 5 !== 0,
      amoblada: i % 3 === 0,
      antiguedad: 1980 + Math.floor(Math.random() * 44),
      valorLibro: Math.floor(Math.random() * 500000000) + 30000000,
      ultimoPago: i % 6 !== 0 ? lastPayDate.toISOString().split('T')[0] : null,
      observaciones: i % 4 === 0 ? 'Inmueble en buenas condiciones generales. Requiere mantención preventiva de HVAC.' : '',
      futureTasks: generateFutureTasks(i),
    };
  });
}

export const properties: Property[] = generateProperties(312);

export const contracts: Contract[] = properties
  .filter(p => p.contractId)
  .map((p) => {
    const start = new Date(2022, Math.floor(Math.random() * 12), 1);
    const end = new Date(start);
    end.setFullYear(end.getFullYear() + Math.floor(Math.random() * 3) + 1);
    const now = new Date();
    const daysToEnd = Math.floor((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    
    return {
      id: p.contractId!,
      propertyId: p.id,
      propertyName: p.name,
      type: p.type as 'arrendatario' | 'arrendador',
      startDate: start.toISOString().split('T')[0],
      endDate: end.toISOString().split('T')[0],
      monthlyAmount: Math.floor(Math.random() * 8000000) + 500000,
      status: daysToEnd < 0 ? 'vencido' : daysToEnd < 90 ? 'por_vencer' : 'vigente',
      counterpart: randomFrom(counterparts),
      documents: [`Contrato_${p.contractId}.pdf`, `Anexo_${p.contractId}.pdf`],
    };
  });

// ── Expenses ──

const expenseTypes: ExpenseType[] = ['luz', 'agua', 'gastos_comunes', 'internet', 'otros'];

export const expenses: Expense[] = properties.flatMap((p, pi) => {
  const count = 2 + (pi % 4);
  return Array.from({ length: count }, (_, ei) => {
    const type = expenseTypes[(pi + ei) % expenseTypes.length];
    const offsetDays = ((pi * 7 + ei * 13) % 60) - 15;
    const due = new Date();
    due.setDate(due.getDate() + offsetDays);
    const dueDateStr = due.toISOString().split('T')[0];

    return {
      id: `EXP-${String(pi * 10 + ei + 1).padStart(5, '0')}`,
      propertyId: p.id,
      propertyName: p.name,
      type,
      accountId: `${String(10000 + (pi * 7 + ei * 31) % 90000)}`,
      dueDate: dueDateStr,
      amount: Math.floor(Math.random() * 500000) + 20000,
      status: getExpenseSemaphore(dueDateStr, 7),
    };
  });
});

export const maintenanceTickets: MaintenanceTicket[] = Array.from({ length: 45 }, (_, i) => {
  const prop = randomFrom(properties);
  const statuses: MaintenanceStatus[] = ['pendiente', 'en_proceso', 'resuelto'];
  const priorities: MaintenanceTicket['priority'][] = ['baja', 'media', 'alta', 'critica'];
  const titles = ['Fuga de agua', 'Falla eléctrica', 'Reparación HVAC', 'Pintura interior', 'Cambio cerraduras', 'Impermeabilización', 'Reparación ascensor', 'Mantención jardín', 'Cambio luminarias', 'Reparación techo'];
  const status = statuses[i % 3];

  return {
    id: `MNT-${String(i + 1).padStart(4, '0')}`,
    propertyId: prop.id,
    propertyName: prop.name,
    title: randomFrom(titles),
    description: 'Incidencia reportada por personal de turno.',
    status,
    priority: randomFrom(priorities),
    responsible: randomFrom(responsibles),
    cost: Math.floor(Math.random() * 5000000) + 50000,
    createdAt: new Date(2024, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0],
    resolvedAt: status === 'resuelto' ? new Date(2025, Math.floor(Math.random() * 3), Math.floor(Math.random() * 28) + 1).toISOString().split('T')[0] : null,
  };
});

// ── Alerts (combined: contracts + expenses) ──

const contractAlerts: Alert[] = [
  ...contracts.filter(c => c.status === 'por_vencer').slice(0, 5).map((c, i) => ({
    id: `ALT-CTR-${i + 1}`,
    type: 'contrato' as const,
    message: `Contrato ${c.id} de "${c.propertyName}" vence el ${c.endDate}`,
    severity: 'warning' as const,
    propertyId: c.propertyId,
    date: new Date().toISOString().split('T')[0],
    read: false,
  })),
  ...contracts.filter(c => c.status === 'vencido').slice(0, 3).map((c, i) => ({
    id: `ALT-VNC-${i + 1}`,
    type: 'contrato' as const,
    message: `Contrato ${c.id} de "${c.propertyName}" está VENCIDO desde ${c.endDate}`,
    severity: 'critical' as const,
    propertyId: c.propertyId,
    date: new Date().toISOString().split('T')[0],
    read: false,
  })),
];

const expenseAlerts: Alert[] = [
  ...expenses.filter(e => e.status === 'vencido').slice(0, 5).map((e, i) => ({
    id: `ALT-EXP-V-${i + 1}`,
    type: 'gasto' as const,
    message: `Gasto ${expenseTypeLabels[e.type]} (cuenta ${e.accountId}) de "${e.propertyName}" está VENCIDO`,
    severity: 'critical' as const,
    propertyId: e.propertyId,
    date: new Date().toISOString().split('T')[0],
    read: false,
  })),
  ...expenses.filter(e => e.status === 'por_vencer').slice(0, 5).map((e, i) => ({
    id: `ALT-EXP-P-${i + 1}`,
    type: 'gasto' as const,
    message: `Gasto ${expenseTypeLabels[e.type]} (cuenta ${e.accountId}) de "${e.propertyName}" por vencer`,
    severity: 'warning' as const,
    propertyId: e.propertyId,
    date: new Date().toISOString().split('T')[0],
    read: false,
  })),
];

const maintenanceAlerts: Alert[] = maintenanceTickets
  .filter(m => m.priority === 'critica' && m.status !== 'resuelto')
  .slice(0, 3)
  .map((m, i) => ({
    id: `ALT-MNT-${i + 1}`,
    type: 'mantenimiento' as const,
    message: `Mantención crítica pendiente: "${m.title}" en ${m.propertyName}`,
    severity: 'critical' as const,
    propertyId: m.propertyId,
    date: m.createdAt,
    read: false,
  }));

export const alerts: Alert[] = [...contractAlerts, ...expenseAlerts, ...maintenanceAlerts];

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
