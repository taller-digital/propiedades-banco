import { useState, useMemo } from 'react';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { maintenanceTickets, formatCLP, formatDate, type MaintenanceTicket } from '@/data/mockData';

const PAGE_SIZE = 12;

export default function MaintenancePage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<MaintenanceTicket['status'] | 'all'>('all');
  const [priorityFilter, setPriorityFilter] = useState<MaintenanceTicket['priority'] | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return maintenanceTickets.filter(t => {
      if (statusFilter !== 'all' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return t.title.toLowerCase().includes(q) || t.propertyName.toLowerCase().includes(q) || t.id.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, statusFilter, priorityFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const priorityColors: Record<string, string> = {
    baja: 'bg-slate-100 text-slate-600',
    media: 'bg-blue-50 text-blue-700',
    alta: 'bg-amber-50 text-amber-700',
    critica: 'bg-red-50 text-red-700',
  };

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Mantenimiento y Reparaciones</h1>
      <p className="text-sm text-muted-foreground mb-6">{maintenanceTickets.length} incidencias registradas</p>

      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar incidencia..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 text-sm border border-input rounded bg-card focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
        <select value={statusFilter} onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
          className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="all">Todos los estados</option>
          <option value="pendiente">Pendiente</option>
          <option value="en_proceso">En Proceso</option>
          <option value="resuelto">Resuelto</option>
        </select>
        <select value={priorityFilter} onChange={e => { setPriorityFilter(e.target.value as any); setPage(1); }}
          className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
          <option value="all">Todas las prioridades</option>
          <option value="critica">Crítica</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header-cell text-left">ID</th>
                <th className="table-header-cell text-left">Título</th>
                <th className="table-header-cell text-left">Inmueble</th>
                <th className="table-header-cell text-center">Prioridad</th>
                <th className="table-header-cell text-center">Estado</th>
                <th className="table-header-cell text-left">Responsable</th>
                <th className="table-header-cell text-right">Costo</th>
                <th className="table-header-cell text-left">Fecha</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(t => (
                <tr key={t.id} className="table-row-hover border-t border-border">
                  <td className="px-4 py-3 font-mono-numeric text-xs text-muted-foreground">{t.id}</td>
                  <td className="px-4 py-3 font-medium">{t.title}</td>
                  <td className="px-4 py-3 text-muted-foreground">{t.propertyName}</td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded capitalize ${priorityColors[t.priority]}`}>{t.priority}</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded
                      ${t.status === 'pendiente' ? 'bg-amber-50 text-amber-700' : ''}
                      ${t.status === 'en_proceso' ? 'bg-blue-50 text-blue-700' : ''}
                      ${t.status === 'resuelto' ? 'bg-emerald-50 text-emerald-700' : ''}
                    `}>
                      {t.status === 'pendiente' ? 'Pendiente' : t.status === 'en_proceso' ? 'En Proceso' : 'Resuelto'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{t.responsible}</td>
                  <td className="px-4 py-3 font-mono-numeric text-right">{formatCLP(t.cost)}</td>
                  <td className="px-4 py-3 font-mono-numeric text-xs">{formatDate(t.createdAt)}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No se encontraron incidencias.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}</p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded border border-input hover:bg-muted disabled:opacity-40"><ChevronLeft className="h-4 w-4" /></button>
            {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)}
                className={`h-8 w-8 flex items-center justify-center rounded text-xs font-medium ${page === p ? 'bg-primary text-primary-foreground' : 'border border-input hover:bg-muted'}`}>{p}</button>
            ))}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded border border-input hover:bg-muted disabled:opacity-40"><ChevronRight className="h-4 w-4" /></button>
          </div>
        </div>
      )}
    </div>
  );
}