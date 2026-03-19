import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Search, ChevronLeft, ChevronRight } from 'lucide-react';
import { contracts, formatCLP, formatDate, getContractSemaphore, getDaysRemaining, type Contract } from '@/data/mockData';
import SemaphoreBadge from '@/components/SemaphoreBadge';

const PAGE_SIZE = 12;

export default function ContractsPage() {
  const [tab, setTab] = useState<'arrendatario' | 'arrendador'>('arrendatario');
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'vigente' | 'por_vencer' | 'vencido'>('all');
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return contracts.filter(c => {
      if (c.type !== tab) return false;
      if (statusFilter !== 'all' && c.status !== statusFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return c.propertyName.toLowerCase().includes(q) || c.id.toLowerCase().includes(q) || c.counterpart.toLowerCase().includes(q);
      }
      return true;
    });
  }, [tab, search, statusFilter]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  // Summary counts for current tab
  const tabContracts = contracts.filter(c => c.type === tab);
  const tabExpired = tabContracts.filter(c => c.status === 'vencido').length;
  const tabWarning = tabContracts.filter(c => c.status === 'por_vencer').length;
  const tabActive = tabContracts.filter(c => c.status === 'vigente').length;

  return (
    <div>
      <h1 className="text-xl font-semibold mb-1">Gestión de Contratos</h1>
      <p className="text-sm text-muted-foreground mb-6">{contracts.length} contratos registrados</p>

      {/* Tabs */}
      <div className="flex gap-0 border-b border-border mb-6">
        <button onClick={() => { setTab('arrendatario'); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'arrendatario' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Banco como Arrendatario
        </button>
        <button onClick={() => { setTab('arrendador'); setPage(1); }}
          className={`px-4 py-2.5 text-sm font-medium border-b-2 -mb-px transition-colors ${tab === 'arrendador' ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
          Banco como Arrendador
        </button>
      </div>

      {/* Summary badges */}
      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={() => { setStatusFilter('all'); setPage(1); }}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${statusFilter === 'all' ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
          Todos ({tabContracts.length})
        </button>
        <button onClick={() => { setStatusFilter('vigente'); setPage(1); }}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${statusFilter === 'vigente' ? 'bg-emerald-600 text-white border-emerald-600' : 'border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100'}`}>
          🟢 Vigente ({tabActive})
        </button>
        <button onClick={() => { setStatusFilter('por_vencer'); setPage(1); }}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${statusFilter === 'por_vencer' ? 'bg-amber-600 text-white border-amber-600' : 'border-amber-200 text-amber-700 bg-amber-50 hover:bg-amber-100'}`}>
          🟡 Por vencer ({tabWarning})
        </button>
        <button onClick={() => { setStatusFilter('vencido'); setPage(1); }}
          className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${statusFilter === 'vencido' ? 'bg-red-600 text-white border-red-600' : 'border-red-200 text-red-700 bg-red-50 hover:bg-red-100'}`}>
          🔴 Vencido ({tabExpired})
        </button>
      </div>

      {/* Search */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input type="text" placeholder="Buscar contrato, propiedad o contraparte..." value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 text-sm border border-input rounded bg-card focus:outline-none focus:ring-1 focus:ring-ring" />
        </div>
      </div>

      {/* Table */}
      <div className="border border-border rounded-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header-cell text-left">Contrato</th>
                <th className="table-header-cell text-left">Propiedad</th>
                <th className="table-header-cell text-left">Contraparte</th>
                <th className="table-header-cell text-left">Inicio</th>
                <th className="table-header-cell text-left">Término</th>
                <th className="table-header-cell text-right">Monto Mensual</th>
                <th className="table-header-cell text-center">Estado</th>
                <th className="table-header-cell text-center">Días</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const sem = getContractSemaphore(c.endDate);
                const days = getDaysRemaining(c.endDate);
                return (
                  <tr key={c.id} className="table-row-hover border-t border-border">
                    <td className="px-4 py-3 font-mono-numeric text-xs">{c.id}</td>
                    <td className="px-4 py-3">
                      <Link to={`/propiedades/${c.propertyId}`} className="hover:text-primary hover:underline">{c.propertyName}</Link>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.counterpart}</td>
                    <td className="px-4 py-3 font-mono-numeric text-xs">{formatDate(c.startDate)}</td>
                    <td className="px-4 py-3 font-mono-numeric text-xs">{formatDate(c.endDate)}</td>
                    <td className="px-4 py-3 font-mono-numeric text-right">{formatCLP(c.monthlyAmount)}</td>
                    <td className="px-4 py-3 text-center">
                      <SemaphoreBadge status={sem} dueDate={c.endDate} showDays={false} size="sm" />
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`text-xs font-mono-numeric font-semibold ${days < 0 ? 'text-red-600' : days <= 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {days < 0 ? `${Math.abs(days)}d vencido` : `${days}d`}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No se encontraron contratos.</td></tr>
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
