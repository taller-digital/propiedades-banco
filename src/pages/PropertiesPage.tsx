import { useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Filter, ChevronLeft, ChevronRight, Map, List, X } from 'lucide-react';
import { properties, propertyTypeLabels, propertyTypeColors, type PropertyType, type PropertyStatus, type FutureTaskTag, futureTaskTagLabels, futureTaskTagColors } from '@/data/mockData';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PAGE_SIZE = 15;

const typeMapColors: Record<PropertyType, string> = {
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
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [typeFilters, setTypeFilters] = useState<PropertyType[]>([]);
  const [statusFilters, setStatusFilters] = useState<PropertyStatus[]>([]);
  const [tagFilters, setTagFilters] = useState<FutureTaskTag[]>([]);
  const [comunaFilters, setComunaFilters] = useState<string[]>([]);

  function toggleIn<T extends string>(arr: T[], val: T, setter: (a: T[]) => void) {
    setter(arr.includes(val) ? arr.filter(x => x !== val) : [...arr, val]);
    setPage(1);
  }
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [page, setPage] = useState(1);

  const allUsedTags = useMemo(() => {
    const tagSet = new Set<FutureTaskTag>();
    properties.forEach(p => p.futureTasks.forEach(t => tagSet.add(t.tag)));
    return Array.from(tagSet).sort();
  }, []);

  const allComunas = useMemo(() => {
    const s = new Set<string>();
    properties.forEach(p => s.add(p.comuna));
    return Array.from(s).sort();
  }, []);

  const filtered = useMemo(() => {
    return properties.filter(p => {
      if (typeFilters.length > 0 && !typeFilters.includes(p.type)) return false;
      if (statusFilters.length > 0 && !statusFilters.includes(p.status)) return false;
      if (tagFilters.length > 0 && !p.futureTasks.some(t => tagFilters.includes(t.tag))) return false;
      if (comunaFilters.length > 0 && !comunaFilters.includes(p.comuna)) return false;
      if (search) {
        const q = search.toLowerCase();
        return p.name.toLowerCase().includes(q) || p.id.toLowerCase().includes(q) || p.city.toLowerCase().includes(q) || p.comuna.toLowerCase().includes(q);
      }
      return true;
    });
  }, [search, typeFilters, statusFilters, tagFilters, comunaFilters]);

  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const statusLabels: Record<PropertyStatus, string> = { activo: 'Activo', en_mantenimiento: 'En Mantención', inactivo: 'Inactivo' };

  // Active filter chips — one chip per selected value
  const activeFilters: { label: string; clear: () => void }[] = [
    ...typeFilters.map(t => ({ label: `Tipo: ${propertyTypeLabels[t]}`, clear: () => { setTypeFilters(prev => prev.filter(x => x !== t)); setPage(1); } })),
    ...statusFilters.map(s => ({ label: `Estado: ${statusLabels[s]}`, clear: () => { setStatusFilters(prev => prev.filter(x => x !== s)); setPage(1); } })),
    ...tagFilters.map(tag => ({ label: `Planif.: ${futureTaskTagLabels[tag]}`, clear: () => { setTagFilters(prev => prev.filter(x => x !== tag)); setPage(1); } })),
    ...comunaFilters.map(c => ({ label: `Comuna: ${c}`, clear: () => { setComunaFilters(prev => prev.filter(x => x !== c)); setPage(1); } })),
  ];

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Inventario de Inmuebles</h1>
          <p className="text-sm text-muted-foreground mt-1">{filtered.length} inmuebles encontrados</p>
        </div>
        {/* View toggle */}
        <div className="flex items-center gap-1 border border-border rounded p-1">
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'list' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <List className="h-3.5 w-3.5" /> Lista
          </button>
          <button
            onClick={() => setViewMode('map')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded transition-colors ${viewMode === 'map' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
            <Map className="h-3.5 w-3.5" /> Mapa
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Buscar por nombre, ID, ciudad o comuna..."
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            className="w-full h-9 pl-9 pr-3 text-sm border border-input rounded bg-card focus:outline-none focus:ring-1 focus:ring-ring"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5">
            <Filter className="h-3.5 w-3.5 text-muted-foreground" />
            <select value="" onChange={e => toggleIn(typeFilters, e.target.value as PropertyType, setTypeFilters)}
              className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
              <option value="" disabled>Tipo{typeFilters.length > 0 ? ` (${typeFilters.length})` : ''}</option>
              {(['work_cafe', 'oficina_central', 'sucursal'] as PropertyType[]).map(t => (
                <option key={t} value={t}>{typeFilters.includes(t) ? '✓ ' : ''}{propertyTypeLabels[t]}</option>
              ))}
            </select>
          </div>
          <select value="" onChange={e => toggleIn(statusFilters, e.target.value as PropertyStatus, setStatusFilters)}
            className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="" disabled>Estado{statusFilters.length > 0 ? ` (${statusFilters.length})` : ''}</option>
            <option value="activo">{statusFilters.includes('activo') ? '✓ ' : ''}Activo</option>
            <option value="en_mantenimiento">{statusFilters.includes('en_mantenimiento') ? '✓ ' : ''}En Mantención</option>
            <option value="inactivo">{statusFilters.includes('inactivo') ? '✓ ' : ''}Inactivo</option>
          </select>
          <select value="" onChange={e => toggleIn(comunaFilters, e.target.value, setComunaFilters)}
            className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="" disabled>Comuna{comunaFilters.length > 0 ? ` (${comunaFilters.length})` : ''}</option>
            {allComunas.map(c => <option key={c} value={c}>{comunaFilters.includes(c) ? '✓ ' : ''}{c}</option>)}
          </select>
          <select value="" onChange={e => toggleIn(tagFilters, e.target.value as FutureTaskTag, setTagFilters)}
            className="h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
            <option value="" disabled>Planif.{tagFilters.length > 0 ? ` (${tagFilters.length})` : ''}</option>
            {allUsedTags.map(tag => <option key={tag} value={tag}>{tagFilters.includes(tag) ? '✓ ' : ''}{futureTaskTagLabels[tag]}</option>)}
          </select>
        </div>
      </div>

      {/* Active filter chips */}
      {activeFilters.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-3">
          {activeFilters.map((f, i) => (
            <span key={i} className="inline-flex items-center gap-1 text-xs font-medium bg-primary/10 text-primary px-2.5 py-1 rounded-full">
              {f.label}
              <button onClick={f.clear} className="hover:text-primary/70 ml-0.5"><X className="h-3 w-3" /></button>
            </span>
          ))}
          <button
            onClick={() => { setTypeFilters([]); setStatusFilters([]); setTagFilters([]); setComunaFilters([]); setSearch(''); setPage(1); }}
            className="text-xs text-muted-foreground hover:text-foreground underline">
            Limpiar todo
          </button>
        </div>
      )}

      {/* MAP VIEW */}
      {viewMode === 'map' && (
        <div className="border border-border rounded-md overflow-hidden bg-card mb-4">
          <div className="h-[500px]">
            <MapContainer center={[-33.45, -70.65]} zoom={5} scrollWheelZoom={true} style={{ height: '100%', width: '100%' }}>
              <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a>' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              {filtered.map(p => (
                <Marker key={p.id} position={[p.lat, p.lng]} icon={createIcon(typeMapColors[p.type] || '#64748b')}>
                  <Popup>
                    <div className="text-xs space-y-1">
                      <p className="font-semibold">{p.name}</p>
                      <p className="text-muted-foreground">{p.address}, {p.comuna}</p>
                      <p className="capitalize">{propertyTypeLabels[p.type]} · {p.status === 'activo' ? 'Activo' : p.status === 'en_mantenimiento' ? 'En Mantención' : 'Inactivo'}</p>
                      <a href={`/inmuebles/${p.id}`} className="text-blue-600 hover:underline block mt-1">Ver detalle →</a>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          </div>
          <div className="flex items-center gap-4 p-3 border-t border-border bg-muted/30">
            {(Object.entries(typeMapColors) as [PropertyType, string][]).map(([type, color]) => (
              <div key={type} className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                <div className="h-2.5 w-2.5 rounded-full" style={{ background: color }} /> {propertyTypeLabels[type]}
              </div>
            ))}
            <span className="text-[10px] text-muted-foreground ml-auto">{filtered.length} inmuebles</span>
          </div>
        </div>
      )}

      {/* LIST VIEW */}
      {viewMode === 'list' && (
        <>
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
                    <th className="table-header-cell text-left">Comuna</th>
                    <th className="table-header-cell text-left">Planificación</th>
                    <th className="table-header-cell text-right">m² Constr.</th>
                  </tr>
                </thead>
                <tbody>
                  {paginated.map(p => (
                    <tr key={p.id} className="table-row-hover border-t border-border">
                      <td className="px-4 py-3 font-mono-numeric text-xs text-muted-foreground">
                        <Link to={`/inmuebles/${p.id}`} className="hover:text-primary hover:underline">{p.id}</Link>
                      </td>
                      <td className="px-4 py-3 font-medium">
                        <Link to={`/inmuebles/${p.id}`} className="hover:text-primary hover:underline">{p.name}</Link>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded ${propertyTypeColors[p.type]}`}>
                          {propertyTypeLabels[p.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3"><PropertyStatusBadge status={p.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground">{p.city}</td>
                      <td className="px-4 py-3 text-muted-foreground">{p.comuna}</td>
                      <td className="px-4 py-3">
                        {p.futureTasks.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {p.futureTasks.map(t => (
                              <span key={t.id} className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full ${futureTaskTagColors[t.tag]}`} title={t.description}>
                                {futureTaskTagLabels[t.tag]}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono-numeric text-right">{p.m2Construidos.toLocaleString('es-CL')}</td>
                    </tr>
                  ))}
                  {paginated.length === 0 && (
                    <tr><td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">No se encontraron registros para los filtros seleccionados.</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

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
                        ${page === pageNum ? 'bg-primary text-primary-foreground' : 'border border-input hover:bg-muted'}`}>
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
        </>
      )}
    </div>
  );
}
