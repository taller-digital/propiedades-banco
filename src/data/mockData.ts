export type PropertyType = 'interno' | 'arrendatario' | 'arrendador';
export type PropertyStatus = 'activo' | 'en_mantenimiento' | 'inactivo';
export type ContractStatus = 'vigente' | 'por_vencer' | 'vencido';
export type MaintenanceStatus = 'pendiente' | 'en_proceso' | 'resuelto';
export type UserRole = 'admin' | 'operaciones' | 'jefatura';

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
  type: 'contrato' | 'mantenimiento' | 'documento';
  message: string;
  severity: 'info' | 'warning' | 'critical';
  propertyId: string;
  date: string;
  read: boolean;
}

const cities = ['Santiago Centro', 'Las Condes', 'Providencia', 'Vitacura', 'Ñuñoa', 'La Florida', 'Maipú', 'Concepción', 'Valparaíso', 'Antofagasta', 'Temuco', 'Puerto Montt'];
const regions = ['Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Metropolitana', 'Biobío', 'Valparaíso', 'Antofagasta', 'Araucanía', 'Los Lagos'];
const cityCoords: [number, number][] = [
  [-33.4489, -70.6693], [-33.4080, -70.5670], [-33.4264, -70.6100], [-33.3850, -70.5790],
  [-33.4560, -70.5980], [-33.5170, -70.5980], [-33.5100, -70.7580], [-36.8270, -73.0500],
  [-33.0460, -71.6200], [-23.6500, -70.4000], [-38.7400, -72.5900], [-41.4700, -72.9400],
];
const responsibles = ['Juan Pérez', 'María González', 'Carlos López', 'Ana Rodríguez', 'Pedro Martínez', 'Sofía Torres', 'Diego Herrera'];
const counterparts = ['Inmobiliaria Andes SpA', 'Corp. Bienes Raíces Pacífico', 'Gestión Propiedades Sur Ltda.', 'Inversiones Norte S.A.', 'Holding Territorial Central'];

function randomFrom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function generateProperties(count: number): Property[] {
  const types: PropertyType[] = ['interno', 'arrendatario', 'arrendador'];
  const statuses: PropertyStatus[] = ['activo', 'en_mantenimiento', 'inactivo'];
  const risks: Property['riskLevel'][] = ['ok', 'warning', 'critical'];
  const names = [
    'Sucursal', 'Oficina', 'Bodega', 'Local Comercial', 'Edificio', 'Casa Matriz', 'Agencia', 'Centro de Operaciones', 'Almacén', 'Torre'
  ];

  return Array.from({ length: count }, (_, i) => {
    const cityIdx = i % cities.length;
    const type = types[i % 3];
    return {
      id: `PROP-${String(i + 1).padStart(4, '0')}`,
      name: `${randomFrom(names)} ${cities[cityIdx]}`,
      type,
      status: i % 7 === 0 ? 'en_mantenimiento' : i % 11 === 0 ? 'inactivo' : 'activo',
      address: `Av. ${randomFrom(['Apoquindo', 'Providencia', 'Libertador', 'Los Leones', 'Kennedy', 'Irarrázaval'])} ${1000 + i * 37}`,
      city: cities[cityIdx],
      region: regions[cityIdx],
      area: 80 + Math.floor(Math.random() * 2000),
      responsible: randomFrom(responsibles),
      contractId: type !== 'interno' ? `CTR-${String(i + 1).padStart(4, '0')}` : null,
      riskLevel: randomFrom(risks),
    };
  });
}

export const properties: Property[] = generateProperties(312);

export const contracts: Contract[] = properties
  .filter(p => p.contractId)
  .map((p, i) => {
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

export const alerts: Alert[] = [
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
  ...maintenanceTickets.filter(m => m.priority === 'critica' && m.status !== 'resuelto').slice(0, 3).map((m, i) => ({
    id: `ALT-MNT-${i + 1}`,
    type: 'mantenimiento' as const,
    message: `Mantención crítica pendiente: "${m.title}" en ${m.propertyName}`,
    severity: 'critical' as const,
    propertyId: m.propertyId,
    date: m.createdAt,
    read: false,
  })),
];

export function formatCLP(amount: number): string {
  return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 }).format(amount);
}

export function formatDate(date: string): string {
  return new Date(date + 'T12:00:00').toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
}
