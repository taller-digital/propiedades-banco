import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight } from 'lucide-react';
import { properties, type PropertyType, type PropertyStatus } from '@/data/mockData';

const PAGE_SIZE = 15;

function StatusBadge({ type }: { type: PropertyType }) {
  const cls = type === 'interno' ? 'status-interno' : type === 'arrendatario' ? 'status-arrendatario' : 'status-arrendador';
  const label = type === 'interno' ? 'Uso Interno' : type === 'arrendatario' ? 'Arrendatario' : 'Arrendador';
  return <span className={cls}>{label}</span>;
}

function PropertyStatusBadge({ status }: { status: PropertyStatus }) {
  const colors = {
    activo: 'bg-emerald-50 text-emerald-700',
    en_mantenimiento: 'bg-amber-50 text-amber-700',
    inactivo: 'bg-slate-100 text-slate-500',
  };
  const labels = { activo: 'Activo', en_mantenimiento: 'En Mantención', inactivo: 'Inactivo' };
  return <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${colors[status]}`}>{labels[status]}</span>;
}

export default function PropertiesPage() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<PropertyType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<PropertyStatus | 'all'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      if (typeFilter !== 'all' && p.type !== typeFilter) return false;
      if (statusFilter !== 'all' && p.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.city.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, typeFilter, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Inventario de Propiedades</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} propiedades encontradas</p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID o ciudad..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 text-sm border border-input rounded bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select
              value={typeFilter}
              onChange={e => { setTypeFilter(e.target.value as any); setPage(1); }}
              className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring"
            >
              <option value="all">Todos los tipos</option>
              <option value="interno">Uso Interno</option>
              <option value="arrendatario">Arrendatario</option>
              <option value="arrendador">Arrendador</option>
            </select>
          </div>
          <select
            value={statusFilter}
            onChange={e => { setStatusFilter(e.target.value as any); setPage(1); }}
            className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring"
          >
            <option value="all">Todos los estados</option>
            <option value="activo">Activo</option>
            <option value="en_mantenimiento">En Mantención</option>
            <option value="inactivo">Inactivo</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header-cell text-left">ID</th>
                <th className="table-header-cell text-left">Nombre</th>
                <th className="table-header-cell text-left">Tipo</th>
                <th className="table-header-cell text-left">Estado</th>
                <th className="table-header-cell text-left">Ciudad</th>
                <th className="table-header-cell text-left">Responsable</th>
                <th className="table-header-cell text-right">Área (m²)</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(p => (
                <tr key={p.id} className="table-row-hover border-t border-border">
                  <td className="px-4 py-3 font-mono-numeric text-xs text-muted-foreground">
                    <Link to={`/propiedades/${p.id}`} className="hover:text-primary hover:underline">{p.id}</Link>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    <Link to={`/propiedades/${p.id}`} className="hover:text-primary hover:underline">{p.name}</Link>
                  </td>
                  <td className="px-4 py-3"><StatusBadge type={p.type} /></td>
                  <td className="px-4 py-3"><PropertyStatusBadge status={p.status} /></td>
                  <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                  <td className="px-4 py-3 text-muted-foreground">{p.responsible}</td>
                  <td className="px-4 py-3 font-mono-numeric text-right">{p.area.toLocaleString('es-CL')}</td>
                </tr>
              ))}
              {paginated.length === 0 && (
                <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No se encontraron registros para el filtro seleccionado.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-muted-foreground">
            Mostrando {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} de {filtered.length}
          </p>
          <div className="flex items-center gap-1">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
              className="h-8 w-8 flex items-center justify-center rounded border border-input hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronLeft className="h-4 w-4" />
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
              let pageNum: number;
              if (totalPages <= 7) pageNum = i + 1;
              else if (page <= 4) pageNum = i + 1;
              else if (page >= totalPages - 3) pageNum = totalPages - 6 + i;
              else pageNum = page - 3 + i;
              return (
                <button key={pageNum} onClick={() => setPage(pageNum)}
                  className={`h-8 w-8 flex items-center justify-center rounded text-xs font-medium transition-colors
                    ${page === pageNum ? 'bg-primary text-primary-foreground' : 'border border-input hover:bg-muted'}
                  `}>
                  {pageNum}
                </button>
              );
            })}
            <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
              className="h-8 w-8 flex items-center justify-center rounded border border-input hover:bg-muted disabled:opacity-40 transition-colors">
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
