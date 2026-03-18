import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, FileText, Wrench, FolderOpen, MapPin, User, Calendar, DollarSign } from 'lucide-react';
import { properties, contracts, maintenanceTickets, formatCLP, formatDate } from '@/data/mockData';
import { useRole } from '@/hooks/useRole';

const tabs = ['General', 'Contratos', 'Mantenimiento', 'Documentos'] as const;
type Tab = typeof tabs[number];

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>('General');

  const property = properties.find(p => p.id === id);
  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Propiedad no encontrada.</p>
        <Link to="/propiedades" className="text-primary text-sm mt-2 hover:underline">← Volver al inventario</Link>
      </div>
    );
  }

  const propContracts = contracts.filter(c => c.propertyId === property.id);
  const propTickets = maintenanceTickets.filter(m => m.propertyId === property.id);
  const nextMaintenance = propTickets.find(t => t.status !== 'resuelto');
  const activeContract = propContracts.find(c => c.status === 'vigente' || c.status === 'por_vencer');

  const typeLabel = property.type === 'interno' ? 'Uso Interno' : property.type === 'arrendatario' ? 'Arrendatario' : 'Arrendador';
  const typeCls = property.type === 'interno' ? 'status-interno' : property.type === 'arrendatario' ? 'status-arrendatario' : 'status-arrendador';

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <Link to="/propiedades" className="hover:text-foreground">Inventario</Link>
        <span>/</span>
        <span>{typeLabel}</span>
        <span>/</span>
        <span className="text-foreground font-medium">Detalle</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/propiedades" className="p-2 rounded hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{property.id} — {property.name}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={typeCls}>{typeLabel}</span>
              <span className="text-xs text-muted-foreground">{property.address}, {property.city}</span>
            </div>
          </div>
        </div>
        {role === 'admin' && (
          <div className="flex gap-2">
            <button className="h-9 px-4 text-sm font-medium border border-input rounded hover:bg-muted transition-colors active:scale-[0.98]">
              Editar
            </button>
            <button className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors active:scale-[0.98]">
              Descargar PDF
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content (2 cols) */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-6">
            {tabs.map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px
                  ${activeTab === tab
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                  }
                `}
              >
                {tab}
              </button>
            ))}
          </div>

          {/* Tab Content */}
          {activeTab === 'General' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {[
                { icon: Building2, label: 'Tipo', value: typeLabel },
                { icon: MapPin, label: 'Dirección', value: `${property.address}, ${property.city}` },
                { icon: MapPin, label: 'Región', value: property.region },
                { icon: User, label: 'Responsable', value: property.responsible },
                { icon: Building2, label: 'Área', value: `${property.area.toLocaleString('es-CL')} m²` },
                { icon: Building2, label: 'Estado', value: property.status === 'activo' ? 'Activo' : property.status === 'en_mantenimiento' ? 'En Mantención' : 'Inactivo' },
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                  <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                    <p className="text-sm mt-0.5">{item.value}</p>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Contratos' && (
            <div className="space-y-3">
              {propContracts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay contratos asociados.</p>
              ) : propContracts.map(c => (
                <div key={c.id} className="border border-border rounded p-4 bg-card">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-mono-numeric text-sm font-medium">{c.id}</span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded
                      ${c.status === 'vigente' ? 'bg-emerald-50 text-emerald-700' : ''}
                      ${c.status === 'por_vencer' ? 'bg-amber-50 text-amber-700' : ''}
                      ${c.status === 'vencido' ? 'bg-red-50 text-red-700' : ''}
                    `}>
                      {c.status === 'vigente' ? 'Vigente' : c.status === 'por_vencer' ? 'Por Vencer' : 'Vencido'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div>
                      <p className="text-muted-foreground">Inicio</p>
                      <p className="font-medium">{formatDate(c.startDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Término</p>
                      <p className="font-medium">{formatDate(c.endDate)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Monto Mensual</p>
                      <p className="font-medium font-mono-numeric">{formatCLP(c.monthlyAmount)}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground">Contraparte</p>
                      <p className="font-medium">{c.counterpart}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Mantenimiento' && (
            <div className="space-y-3">
              {propTickets.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay tickets de mantenimiento.</p>
              ) : propTickets.map(t => (
                <div key={t.id} className="border border-border rounded p-4 bg-card">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Wrench className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm font-medium">{t.title}</span>
                    </div>
                    <span className={`text-xs font-medium px-2.5 py-0.5 rounded
                      ${t.status === 'pendiente' ? 'bg-amber-50 text-amber-700' : ''}
                      ${t.status === 'en_proceso' ? 'bg-blue-50 text-blue-700' : ''}
                      ${t.status === 'resuelto' ? 'bg-emerald-50 text-emerald-700' : ''}
                    `}>
                      {t.status === 'pendiente' ? 'Pendiente' : t.status === 'en_proceso' ? 'En Proceso' : 'Resuelto'}
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                    <div><p className="text-muted-foreground">Prioridad</p><p className="font-medium capitalize">{t.priority}</p></div>
                    <div><p className="text-muted-foreground">Responsable</p><p className="font-medium">{t.responsible}</p></div>
                    <div><p className="text-muted-foreground">Costo</p><p className="font-medium font-mono-numeric">{formatCLP(t.cost)}</p></div>
                    <div><p className="text-muted-foreground">Fecha</p><p className="font-medium">{formatDate(t.createdAt)}</p></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'Documentos' && (
            <div className="border border-border rounded p-6 bg-card text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Repositorio de documentos</p>
              <p className="text-xs text-muted-foreground mt-1">
                {propContracts.flatMap(c => c.documents).length} documento(s) asociado(s)
              </p>
              <div className="mt-4 space-y-2">
                {propContracts.flatMap(c => c.documents).map((doc, i) => (
                  <div key={i} className="flex items-center gap-2 text-sm p-2 border border-border rounded hover:bg-muted transition-colors cursor-pointer">
                    <FileText className="h-4 w-4 text-muted-foreground" />
                    <span>{doc}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          <div className="kpi-card">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Estado Crítico</p>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Wrench className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Próximo Mantenimiento</p>
                  <p className="text-sm font-medium">{nextMaintenance ? `${nextMaintenance.title} — ${formatDate(nextMaintenance.createdAt)}` : 'Sin pendientes'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Vencimiento Contrato</p>
                  <p className="text-sm font-medium">{activeContract ? formatDate(activeContract.endDate) : 'Sin contrato'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <DollarSign className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Monto Mensual</p>
                  <p className="text-sm font-medium font-mono-numeric">{activeContract ? formatCLP(activeContract.monthlyAmount) : '—'}</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <User className="h-4 w-4 text-muted-foreground mt-0.5" />
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Responsable</p>
                  <p className="text-sm font-medium">{property.responsible}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="kpi-card">
            <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Resumen</p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Contratos</span>
                <span className="font-mono-numeric">{propContracts.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Mantenciones</span>
                <span className="font-mono-numeric">{propTickets.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documentos</span>
                <span className="font-mono-numeric">{propContracts.flatMap(c => c.documents).length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
