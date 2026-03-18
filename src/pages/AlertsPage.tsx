import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Bell, AlertTriangle, FileText, Wrench, Check, Mail } from 'lucide-react';
import { alerts, formatDate } from '@/data/mockData';

export default function AlertsPage() {
  const [localAlerts, setLocalAlerts] = useState(alerts);
  const [filter, setFilter] = useState<'all' | 'contrato' | 'mantenimiento'>('all');

  const filtered = localAlerts.filter(a => filter === 'all' || a.type === filter);
  const unread = localAlerts.filter(a => !a.read).length;

  const markRead = (id: string) => {
    setLocalAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));
  };

  const markAllRead = () => {
    setLocalAlerts(prev => prev.map(a => ({ ...a, read: true })));
  };

  const severityIcon = (severity: string) => {
    if (severity === 'critical') return <AlertTriangle className="h-4 w-4 text-destructive" />;
    if (severity === 'warning') return <Bell className="h-4 w-4 text-warning" />;
    return <Bell className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Alertas y Notificaciones</h1>
          <p className="text-sm text-muted-foreground mt-1">{unread} sin leer de {localAlerts.length} alertas</p>
        </div>
        <div className="flex gap-2">
          <button onClick={markAllRead}
            className="h-9 px-4 text-sm font-medium border border-input rounded hover:bg-muted transition-colors flex items-center gap-2">
            <Check className="h-4 w-4" /> Marcar todas leídas
          </button>
          <button className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors flex items-center gap-2">
            <Mail className="h-4 w-4" /> Simular Envío Email
          </button>
        </div>
      </div>

      {/* Config banner */}
      <div className="border border-border rounded-md p-4 bg-card mb-6">
        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Configuración de Alertas</p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center justify-between p-3 border border-border rounded">
            <span className="text-muted-foreground">Contratos por vencer (30 días)</span>
            <div className="h-5 w-9 bg-primary rounded-full relative"><div className="absolute right-0.5 top-0.5 h-4 w-4 bg-primary-foreground rounded-full" /></div>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded">
            <span className="text-muted-foreground">Contratos por vencer (60 días)</span>
            <div className="h-5 w-9 bg-primary rounded-full relative"><div className="absolute right-0.5 top-0.5 h-4 w-4 bg-primary-foreground rounded-full" /></div>
          </div>
          <div className="flex items-center justify-between p-3 border border-border rounded">
            <span className="text-muted-foreground">Mantenciones críticas</span>
            <div className="h-5 w-9 bg-primary rounded-full relative"><div className="absolute right-0.5 top-0.5 h-4 w-4 bg-primary-foreground rounded-full" /></div>
          </div>
        </div>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-4">
        {(['all', 'contrato', 'mantenimiento'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)}
            className={`h-8 px-3 text-xs font-medium rounded transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'border border-input hover:bg-muted'}`}>
            {f === 'all' ? 'Todas' : f === 'contrato' ? 'Contratos' : 'Mantenimiento'}
          </button>
        ))}
      </div>

      {/* Alert list */}
      <div className="space-y-2">
        {filtered.map(a => (
          <div key={a.id}
            onClick={() => markRead(a.id)}
            className={`border border-border rounded p-4 bg-card flex items-start gap-3 cursor-pointer transition-all duration-150 hover:bg-muted/50
              ${!a.read ? 'border-l-4 border-l-primary' : 'opacity-70'}
              ${a.severity === 'critical' && !a.read ? 'border-l-destructive bg-red-50/50' : ''}
            `}>
            {severityIcon(a.severity)}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider ${a.type === 'contrato' ? 'text-blue-600' : 'text-amber-600'}`}>
                  {a.type === 'contrato' ? 'Contrato' : 'Mantenimiento'}
                </span>
                {!a.read && <span className="h-1.5 w-1.5 bg-primary rounded-full" />}
              </div>
              <p className="text-sm mt-0.5">{a.message}</p>
            </div>
            <span className="text-[10px] font-mono-numeric text-muted-foreground shrink-0">{formatDate(a.date)}</span>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-12">No hay alertas para mostrar.</p>
        )}
      </div>
    </div>
  );
}
