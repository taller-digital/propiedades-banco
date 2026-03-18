import { useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, FileText, Wrench, AlertTriangle, TrendingUp, ArrowRight, MapPin } from 'lucide-react';
import { properties, contracts, maintenanceTickets, alerts, formatCLP, type Property } from '@/data/mockData';
import { useRole } from '@/hooks/useRole';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

function KPICard({ label, value, icon: Icon, subtitle, trend }: {
  label: string; value: string | number; icon: React.ElementType; subtitle?: string; trend?: string;
}) {
  return (
    <div className="kpi-card">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{label}</p>
          <p className="text-2xl font-semibold font-mono-numeric mt-1">{value}</p>
          {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        </div>
        <div className="p-2 bg-muted rounded">
          <Icon className="h-5 w-5 text-muted-foreground" />
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

function AlertBanner() {
  const criticalAlerts = alerts.filter(a => a.severity === 'critical' && !a.read);
  if (criticalAlerts.length === 0) return null;

  return (
    <div className="critical-alert rounded-md mb-6">
      <div className="flex items-center gap-3">
        <AlertTriangle className="h-5 w-5 text-destructive shrink-0" />
        <div className="flex-1">
          <p className="text-sm font-semibold">Acción requerida: {criticalAlerts.length} alerta(s) crítica(s)</p>
          <p className="text-xs mt-0.5">{criticalAlerts[0].message}</p>
        </div>
        <Link to="/alertas" className="text-xs font-medium text-destructive hover:underline shrink-0">
          Ver todas →
        </Link>
      </div>
    </div>
  );
}

function RiskHeatmap({ props }: { props: Property[] }) {
  const cells = props.slice(0, 300);
  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">
        Mapa de Riesgo — {props.length} Propiedades
      </p>
      <div className="grid gap-[2px]" style={{ gridTemplateColumns: 'repeat(20, 1fr)' }}>
        {cells.map((p) => (
          <div
            key={p.id}
            title={`${p.id}: ${p.name}`}
            className={`aspect-square rounded-sm cursor-pointer transition-all duration-150 hover:scale-150 hover:z-10 relative
              ${p.riskLevel === 'ok' ? 'bg-slate-200 hover:bg-slate-300' : ''}
              ${p.riskLevel === 'warning' ? 'bg-amber-400 hover:bg-amber-500' : ''}
              ${p.riskLevel === 'critical' ? 'bg-red-400 hover:bg-red-500' : ''}
            `}
          />
        ))}
      </div>
      <div className="flex items-center gap-4 mt-3">
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-slate-200" /> Sin riesgo
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-amber-400" /> Mantenimiento
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
          <div className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Contrato
        </div>
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
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">
        Contratos por Vencer / Vencidos
      </p>
      <div className="flex items-end gap-2 h-32">
        {byMonth.map(([month, count]) => (
          <div key={month} className="flex-1 flex flex-col items-center gap-1">
            <span className="text-[10px] font-mono-numeric text-muted-foreground">{count}</span>
            <div
              className="w-full bg-primary/80 rounded-t transition-all duration-300"
              style={{ height: `${(count / max) * 100}%`, minHeight: 4 }}
            />
            <span className="text-[9px] text-muted-foreground">{month.substring(5)}/{month.substring(2, 4)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

function TypeDistribution() {
  const interno = properties.filter(p => p.type === 'interno').length;
  const arrendatario = properties.filter(p => p.type === 'arrendatario').length;
  const arrendador = properties.filter(p => p.type === 'arrendador').length;
  const total = properties.length;

  const items = [
    { label: 'Uso Interno', count: interno, pct: ((interno / total) * 100).toFixed(1), color: 'bg-slate-400' },
    { label: 'Arrendatario', count: arrendatario, pct: ((arrendatario / total) * 100).toFixed(1), color: 'bg-primary' },
    { label: 'Arrendador', count: arrendador, pct: ((arrendador / total) * 100).toFixed(1), color: 'bg-indigo-500' },
  ];

  return (
    <div className="kpi-card">
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-4">
        Distribución por Tipo
      </p>
      {/* Stacked bar */}
      <div className="h-3 flex rounded overflow-hidden mb-4">
        {items.map(i => (
          <div key={i.label} className={`${i.color} transition-all`} style={{ width: `${i.pct}%` }} />
        ))}
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

function RecentActivity() {
  const recentTickets = maintenanceTickets.slice(0, 5);

  return (
    <div className="kpi-card">
      <div className="flex items-center justify-between mb-4">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">
          Actividad Reciente
        </p>
        <Link to="/mantenimiento" className="text-[10px] text-primary font-medium hover:underline flex items-center gap-1">
          Ver todo <ArrowRight className="h-3 w-3" />
        </Link>
      </div>
      <div className="space-y-3">
        {recentTickets.map(t => (
          <div key={t.id} className="flex items-start gap-3 pb-3 border-b border-border last:border-0 last:pb-0">
            <div className={`mt-0.5 h-2 w-2 rounded-full shrink-0 ${
              t.status === 'pendiente' ? 'bg-amber-400' : t.status === 'en_proceso' ? 'bg-primary' : 'bg-success'
            }`} />
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
  const totalContractValue = contracts.reduce((s, c) => s + c.monthlyAmount, 0);

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-xl font-semibold">Estado de Activos: {totalProperties} Propiedades bajo gestión</h1>
        <p className="text-sm text-muted-foreground mt-1">Resumen operativo — {new Date().toLocaleDateString('es-CL', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      <AlertBanner />

      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <KPICard label="Total Propiedades" value={totalProperties} icon={Building2} subtitle={`${properties.filter(p => p.status === 'activo').length} activas`} />
        <KPICard label="Contratos por Vencer" value={contractsExpiring} icon={FileText} subtitle={`${contractsExpired} vencidos`} />
        <KPICard label="Mantenciones Pendientes" value={pendingMaintenance} icon={Wrench} subtitle={`${maintenanceTickets.filter(t => t.priority === 'critica').length} críticas`} />
        <KPICard label="Valor Mensual Contratos" value={formatCLP(totalContractValue)} icon={TrendingUp} />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
        <TypeDistribution />
        <ContractExpiryChart />
        <RecentActivity />
      </div>

      {/* Heatmap */}
      {(role === 'admin' || role === 'jefatura') && (
        <RiskHeatmap props={properties} />
      )}
    </div>
  );
}
