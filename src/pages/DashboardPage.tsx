import { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Wrench, AlertTriangle, TrendingUp, ArrowRight, MapPin, Zap, DollarSign, CheckCircle2, BarChart2 } from 'lucide-react';
import { properties, contracts, maintenanceTickets, alerts, expenses, formatCLP, type Property, getContractSemaphore, getDaysRemaining, propertyTypeLabels, futureTaskTagLabels, type FutureTaskTag } from '@/data/mockData';
import { useRole } from '@/hooks/useRole';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import SemaphoreBadge from '@/components/SemaphoreBadge';

function KPICard({ label, value, icon: Icon, subtitle, trend, accent }: {
  label: string; value: string | number; icon: React.ElementType; subtitle?: string; trend?: string; accent?: 'destructive' | 'warning';
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
          <p className={`text-2xl font-semibold font-mono-numeric mt-1 ${accent === 'destructive' ? 'text-red-600' : accent === 'warning' ? 'text-amber-600' : ''}`}>{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className={`p-2 rounded ${accent === 'destructive' ? 'bg-red-50' : accent === 'warning' ? 'bg-amber-50' : 'bg-muted'}`}>
          <Icon className={`h-5 w-5 ${accent === 'destructive' ? 'text-red-500' : accent === 'warning' ? 'text-amber-500' : 'text-muted-foreground'}`} />
        </div>
      </div>
      {trend && (
        <div className="flex items-center gap-1 mt-3 text-xs text-success">
          <TrendingUp className="h-3 w-3" />
          <span>{trend}</span>
        </div>
      )}
    </div>
  );
}

function CombinedAlertBanner() {
  const contractCritical = contracts.filter(c => c.status === 'vencido').length;
  const contractWarning = contracts.filter(c => c.status === 'por_vencer').length;
  const expensesCritical = expenses.filter(e => e.status === 'vencido').length;
  const expensesWarning = expenses.filter(e => e.status === 'por_vencer').length;
  const totalAlerts = contractCritical + contractWarning + expensesCritical + expensesWarning;

  if (totalAlerts === 0) return null;

  const parts: string[] = [];
  if (contractCritical > 0) parts.push(`${contractCritical} contrato(s) vencido(s)`);
  if (contractWarning > 0) parts.push(`${contractWarning} contrato(s) por vencer`);
  if (expensesCritical > 0) parts.push(`${expensesCritical} gasto(s) vencido(s)`);
  if (expensesWarning > 0) parts.push(`${expensesWarning} gasto(s) por vencer`);

  return (
    <div className="critical-alert rounded-md mb-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">{totalAlerts} alertas activas: {parts.slice(0, 2).join(' y ')}</p>
          {parts.length > 2 && <p className="text-xs mt-0.5">{parts.slice(2).join(', ')}</p>}
        </div>
        <Link to="/alertas" className="text-xs font-medium text-destructive hover:underline shrink-0">
          Ver todas →
        </Link>
      </div>
    </div>
  );
}

const typeMapColors: Record<string, string> = {
  work_cafe: '#d97706',
  oficina_central: '#1e40af',
  sucursal: '#059669',
};

function createIcon(color: string) {
  return L.divIcon({
    className: '',
    html: `<div style="width:12px;height:12px;border-radius:50%;background:${color};border:2px solid white;box-shadow:0 1px 4px rgba(0,0,0,0.3)"></div>`,
    iconSize: [12, 12],
    iconAnchor: [6, 6],
  });
}

function PropertyMap({ props }: { props: Property[] }) {
  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">
        Ubicación de Inmuebles — {props.length} en total
      </p>
      <div className="h-[320px] rounded overflow-hidden border border-border">
        <MapContainer center={[-33.45, -70.65]} zoom={4} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
          <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          {props.map(p => (
            <Marker key={p.id} position={[p.lat, p.lng]} icon={createIcon(typeMapColors[p.type] || '#64748b')}>
              <Popup>
                <div className="text-xs">
                  <p className="font-semibold">{p.name}</p>
                  <p className="text-muted-foreground">{p.address}, {p.city}</p>
                  <p className="mt-1">{propertyTypeLabels[p.type]} · {p.status}</p>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
      <div className="flex items-center gap-4 mt-3">
        {Object.entries(typeMapColors).map(([type, color]) => (
          <div key={type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
            <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} />
            {propertyTypeLabels[type as keyof typeof propertyTypeLabels]}
          </div>
        ))}
      </div>
    </div>
  );
}

function ContractExpiryChart() {
  const byMonth = useMemo(() => {
    const months: Record<string, number> = {};
    contracts.filter(c => c.status === 'por_vencer' || c.status === 'vencido').forEach(c => {
      const m = c.endDate.substring(0, 7);
      months[m] = (months[m] || 0) + 1;
    });
    return Object.entries(months).sort().slice(0, 6);
  }, []);

  const max = Math.max(...byMonth.map(([, v]) => v), 1);

  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">Contratos por Vencer / Vencidos</p>
      <div className="flex items-end gap-2 h-32">
        {byMonth.map(([month, count]) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono-numeric text-muted-foreground">{count}</span>
            <div className="w-full bg-primary/80 rounded-t transition-all duration-300" style={{ height: `${(count / max) * 100}%`, minHeight: 4 }} />
            <span className="text-[9px] text-muted-foreground">{month.substring(5)}/{month.substring(2, 4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeDistribution() {
  const total = properties.length;
  const items = (Object.keys(propertyTypeLabels) as Array<keyof typeof propertyTypeLabels>).map(type => {
    const count = properties.filter(p => p.type === type).length;
    const colorMap: Record<string, string> = { work_cafe: 'bg-amber-500', oficina_central: 'bg-primary', sucursal: 'bg-emerald-500' };
    return { label: propertyTypeLabels[type], count, pct: ((count / total) * 100).toFixed(1), color: colorMap[type] || 'bg-slate-400' };
  });

  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">Distribución por Tipo de Inmueble</p>
      <div className="h-3 flex rounded overflow-hidden mb-4">
        {items.map(i => (<div key={i.label} className={`${i.color} transition-all`} style={{ width: `${i.pct}%` }} />))}
      </div>
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.label} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-sm ${i.color}`} />
              <span className="text-muted-foreground text-xs">{i.label}</span>
            </div>
            <span className="font-mono-numeric text-xs">{i.count} <span className="text-muted-foreground">({i.pct}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function StatusDistribution() {
  const total = properties.length;
  const items = [
    { label: 'Activo', key: 'activo', color: 'bg-emerald-500', textColor: 'text-emerald-700' },
    { label: 'En Mantención', key: 'en_mantenimiento', color: 'bg-amber-500', textColor: 'text-amber-700' },
    { label: 'Inactivo', key: 'inactivo', color: 'bg-slate-400', textColor: 'text-slate-600' },
  ].map(i => ({ ...i, count: properties.filter(p => p.status === i.key).length, pct: ((properties.filter(p => p.status === i.key).length / total) * 100).toFixed(1) }));

  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">Distribución por Estado</p>
      <div className="h-3 flex rounded overflow-hidden mb-4">
        {items.map(i => (<div key={i.key} className={`${i.color}`} style={{ width: `${i.pct}%` }} />))}
      </div>
      <div className="space-y-2">
        {items.map(i => (
          <div key={i.key} className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-2">
              <div className={`h-2.5 w-2.5 rounded-sm ${i.color}`} />
              <span className="text-muted-foreground text-xs">{i.label}</span>
            </div>
            <span className="font-mono-numeric text-xs">{i.count} <span className="text-muted-foreground">({i.pct}%)</span></span>
          </div>
        ))}
      </div>
    </div>
  );
}

function ComunaDistribution() {
  const byComuna = useMemo(() => {
    const map: Record<string, number> = {};
    properties.forEach(p => { map[p.comuna] = (map[p.comuna] || 0) + 1; });
    return Object.entries(map).sort((a, b) => b[1] - a[1]).slice(0, 8);
  }, []);
  const max = Math.max(...byComuna.map(([, v]) => v), 1);

  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">Top Comunas por Inmuebles</p>
      <div className="space-y-2">
        {byComuna.map(([comuna, count]) => (
          <div key={comuna} className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground w-24 shrink-0 truncate">{comuna}</span>
            <div className="flex-1 h-2 bg-muted rounded overflow-hidden">
              <div className="h-full bg-primary/70 rounded" style={{ width: `${(count / max) * 100}%` }} />
            </div>
            <span className="text-xs font-mono-numeric w-6 text-right">{count}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CriticalProperties() {
  const critical = useMemo(() => properties.filter(p => p.riskLevel === 'critical').slice(0, 6), []);

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Estado Crítico</p>
        <Link to="/inmuebles" className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1">
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      {critical.length === 0 ? (
        <div className="flex items-center gap-2 text-xs text-emerald-600">
          <CheckCircle2 className="h-4 w-4" /> Sin inmuebles en estado crítico
        </div>
      ) : (
        <div className="space-y-2.5">
          {critical.map(p => (
            <Link key={p.id} to={`/inmuebles/${p.id}`} className="flex items-center gap-3 text-xs hover:bg-muted/50 -mx-1 px-1 py-1 rounded transition-colors">
              <div className="h-2 w-2 rounded-full bg-red-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{p.name}</p>
                <p className="text-[10px] text-muted-foreground">{p.comuna} · {propertyTypeLabels[p.type]}</p>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}

function PlanificacionSummary() {
  const byTag = useMemo(() => {
    const map: Record<string, number> = {};
    properties.forEach(p => p.futureTasks.forEach(t => { map[t.tag] = (map[t.tag] || 0) + 1; }));
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, []);

  const totalWithTasks = useMemo(() => properties.filter(p => p.futureTasks.length > 0).length, []);

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Planificación</p>
        <span className="text-[10px] text-muted-foreground">{totalWithTasks} inmuebles con tareas</span>
      </div>
      {byTag.length === 0 ? (
        <p className="text-xs text-muted-foreground">Sin tareas de planificación registradas.</p>
      ) : (
        <div className="space-y-2">
          {byTag.map(([tag, count]) => (
            <div key={tag} className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">{futureTaskTagLabels[tag as FutureTaskTag]}</span>
              <span className="font-mono-numeric font-semibold">{count}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function UpcomingContracts() {
  const upcoming = useMemo(() => {
    return contracts
      .filter(c => c.status === 'por_vencer' || c.status === 'vencido')
      .sort((a, b) => getDaysRemaining(a.endDate) - getDaysRemaining(b.endDate))
      .slice(0, 6);
  }, []);

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Contratos Críticos</p>
        <Link to="/contratos" className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1">
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-2.5">
        {upcoming.map(c => {
          const sem = getContractSemaphore(c.endDate);
          return (
            <div key={c.id} className="flex items-center gap-3 text-xs">
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{c.propertyName}</p>
                <p className="text-[10px] text-muted-foreground font-mono-numeric">{c.id}</p>
              </div>
              <SemaphoreBadge status={sem} dueDate={c.endDate} size="sm" />
            </div>
          );
        })}
      </div>
    </div>
  );
}

function RecentActivity() {
  const recentTickets = maintenanceTickets.slice(0, 5);

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Actividad Reciente</p>
        <Link to="/mantenimiento" className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1">
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {recentTickets.map(t => (
          <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${t.status === 'pendiente' ? 'bg-amber-400' : t.status === 'en_proceso' ? 'bg-primary' : 'bg-success'}`} />
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium truncate">{t.title}</p>
              <p className="text-[10px] text-muted-foreground">{t.propertyName}</p>
            </div>
            <span className="text-[10px] text-muted-foreground font-mono-numeric shrink-0">{t.createdAt}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { role } = useRole();
  const totalProperties = properties.length;
  const contractsExpiring = contracts.filter(c => c.status === 'por_vencer').length;
  const contractsExpired = contracts.filter(c => c.status === 'vencido').length;
  const pendingMaintenance = maintenanceTickets.filter(t => t.status !== 'resuelto').length;
  const expensesOverdue = expenses.filter(e => e.status === 'vencido').length;
  const expensesDueSoon = expenses.filter(e => e.status === 'por_vencer').length;
  const criticalCount = properties.filter(p => p.riskLevel === 'critical').length;

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Estado de Activos: {totalProperties} Inmuebles bajo gestión</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen operativo — {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <CombinedAlertBanner />

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-4 mb-6">
        <KPICard label="Total Inmuebles" value={totalProperties} icon={Building2} subtitle={`${properties.filter(p => p.status === 'activo').length} activos`} />
        <KPICard label="Estado Crítico" value={criticalCount} icon={AlertTriangle} accent="destructive" subtitle="requieren atención" />
        <KPICard label="Contratos por Vencer" value={contractsExpiring} icon={FileText} subtitle="próx. 90 días" accent="warning" />
        <KPICard label="Contratos Vencidos" value={contractsExpired} icon={FileText} accent="destructive" />
        <KPICard label="Gastos Vencidos" value={expensesOverdue} icon={DollarSign} accent="destructive" />
        <KPICard label="Mantenciones Pend." value={pendingMaintenance} icon={Wrench} subtitle={`${maintenanceTickets.filter(t => t.priority === 'critica').length} críticas`} />
      </div>

      {/* Distribuciones */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <TypeDistribution />
        <StatusDistribution />
        <ComunaDistribution />
      </div>

      {/* Análisis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <CriticalProperties />
        <PlanificacionSummary />
        <ContractExpiryChart />
      </div>

      {/* Actividad y mapa */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-6">
        <RecentActivity />
        {(role === 'admin' || role === 'jefatura') && <PropertyMap props={properties} />}
      </div>

      {/* Contratos críticos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingContracts />
      </div>
    </div>
  );
}
