import { useState, useEffect, useCallback } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Building2, FileText, Wrench, FolderOpen, MapPin, User, Calendar, DollarSign, Zap, ChevronLeft, ChevronRight, ChevronUp, ChevronDown, Shield, Ruler, Tag, Image as ImageIcon, Download, Loader2, Plus, Pencil, Trash2, X, CheckCircle2, Globe, Home, Briefcase, Clock, MessageSquare, ZoomIn } from 'lucide-react';
import { properties, contracts, maintenanceTickets, expenses, formatCLP, formatDate, getContractSemaphore, getExpenseSemaphore, getDaysRemaining, expenseTypeLabels, assetTagLabels, futureTaskTagLabels, futureTaskTagColors, propertyTypeLabels, propertyTypeColors, type FutureTask, type FutureTaskTag } from '@/data/mockData';
import { useRole } from '@/hooks/useRole';
import SemaphoreBadge from '@/components/SemaphoreBadge';
import { generatePropertyPdf } from '@/utils/generatePdf';

const tabs = ['General', 'Contratos', 'Gastos Generales', 'Mantenimiento', 'Documentos', 'Planificación'] as const;
type Tab = typeof tabs[number];

const CAROUSEL_VISIBLE = 5;

function PhotoGallery({ photos }: { photos: string[] }) {
  const [offset, setOffset] = useState(0);
  const [lightbox, setLightbox] = useState<number | null>(null);

  const canUp = offset > 0;
  const canDown = offset + CAROUSEL_VISIBLE < photos.length;

  const closeLightbox = useCallback(() => setLightbox(null), []);

  const prevLightbox = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
  }, [photos.length]);

  const nextLightbox = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setLightbox(i => i !== null ? (i + 1) % photos.length : null);
  }, [photos.length]);

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') closeLightbox();
      if (e.key === 'ArrowLeft') setLightbox(i => i !== null ? (i - 1 + photos.length) % photos.length : null);
      if (e.key === 'ArrowRight') setLightbox(i => i !== null ? (i + 1) % photos.length : null);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [lightbox, photos.length, closeLightbox]);

  if (photos.length === 0) return null;

  const visiblePhotos = photos.slice(offset, offset + CAROUSEL_VISIBLE);

  return (
    <>
      {/* Vertical image carousel */}
      <div className="w-full">
        <div className="flex flex-col gap-2">
          {/* Scroll up */}
          <button
            onClick={() => setOffset(o => Math.max(0, o - 1))}
            disabled={!canUp}
            className={`w-full flex items-center justify-center py-1.5 rounded-lg border transition-colors
              ${canUp
                ? 'bg-muted border-border hover:bg-accent cursor-pointer'
                : 'bg-muted/40 border-border/40 cursor-not-allowed opacity-40'}`}
            aria-label="Imagen anterior"
          >
            <ChevronUp className="h-4 w-4 text-muted-foreground" />
          </button>

          {/* Image tiles */}
          {visiblePhotos.map((photo, i) => {
            const idx = offset + i;
            return (
              <button
                key={idx}
                onClick={() => setLightbox(idx)}
                className="relative rounded-lg overflow-hidden border border-border bg-muted group focus:outline-none focus:ring-2 focus:ring-primary"
                style={{ aspectRatio: '4/3' }}
                aria-label={`Ver imagen ${idx + 1}`}
              >
                <img
                  src={photo}
                  alt={`Imagen ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  loading="lazy"
                />
                {/* Hover overlay */}
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ZoomIn className="h-6 w-6 text-white opacity-0 group-hover:opacity-100 transition-opacity drop-shadow" />
                </div>
                {/* Counter badge */}
                <span className="absolute bottom-1.5 right-1.5 bg-foreground/60 text-background text-[10px] px-1.5 py-0.5 rounded-full pointer-events-none">
                  {idx + 1}/{photos.length}
                </span>
              </button>
            );
          })}

          {/* Scroll down */}
          <button
            onClick={() => setOffset(o => Math.min(photos.length - CAROUSEL_VISIBLE, o + 1))}
            disabled={!canDown}
            className={`w-full flex items-center justify-center py-1.5 rounded-lg border transition-colors
              ${canDown
                ? 'bg-muted border-border hover:bg-accent cursor-pointer'
                : 'bg-muted/40 border-border/40 cursor-not-allowed opacity-40'}`}
            aria-label="Siguiente imagen"
          >
            <ChevronDown className="h-4 w-4 text-muted-foreground" />
          </button>
        </div>

        {/* Dot indicators */}
        {photos.length > CAROUSEL_VISIBLE && (
          <div className="flex gap-1 mt-2 justify-center flex-wrap">
            {photos.map((_, i) => (
              <button
                key={i}
                onClick={() => setOffset(Math.min(Math.max(0, i), photos.length - CAROUSEL_VISIBLE))}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i >= offset && i < offset + CAROUSEL_VISIBLE
                    ? 'bg-primary w-4'
                    : 'bg-muted-foreground/30 w-1.5 hover:bg-muted-foreground/60'
                }`}
                aria-label={`Ir a imagen ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={closeLightbox}
          role="dialog"
          aria-modal="true"
          aria-label="Visor de imagen"
        >
          {/* Close */}
          <button
            className="absolute top-4 right-4 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
            onClick={closeLightbox}
            aria-label="Cerrar"
          >
            <X className="h-5 w-5" />
          </button>

          {/* Prev */}
          {photos.length > 1 && (
            <button
              className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={prevLightbox}
              aria-label="Imagen anterior"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
          )}

          <img
            src={photos[lightbox]}
            alt={`Imagen ${lightbox + 1}`}
            className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
            onClick={e => e.stopPropagation()}
          />

          {/* Next */}
          {photos.length > 1 && (
            <button
              className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white bg-black/50 hover:bg-black/70 rounded-full p-2 transition-colors"
              onClick={nextLightbox}
              aria-label="Siguiente imagen"
            >
              <ChevronRight className="h-6 w-6" />
            </button>
          )}

          {/* Counter */}
          <span className="absolute bottom-4 left-1/2 -translate-x-1/2 text-white/70 text-sm bg-black/40 px-3 py-1 rounded-full">
            {lightbox + 1} / {photos.length}
          </span>
        </div>
      )}
    </>
  );
}

export default function PropertyDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { role } = useRole();
  const [activeTab, setActiveTab] = useState<Tab>('General');
  const [expenseStatusFilter, setExpenseStatusFilter] = useState<'all' | 'vencido' | 'por_vencer' | 'al_dia'>('all');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  // Future tasks state
  const property = properties.find(p => p.id === id);
  const [localTasks, setLocalTasks] = useState<FutureTask[]>(property?.futureTasks ?? []);
  const [showAddTask, setShowAddTask] = useState(false);
  const [editingTask, setEditingTask] = useState<string | null>(null);
  const [newTag, setNewTag] = useState<FutureTaskTag>('remodelacion');
  const [newDesc, setNewDesc] = useState('');

  if (!property) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <p className="text-muted-foreground">Inmueble no encontrado.</p>
        <Link to="/inmuebles" className="text-primary text-sm mt-2 hover:underline">← Volver al inventario</Link>
      </div>
    );
  }

  const propContracts = contracts.filter(c => c.propertyId === property.id);
  const propTickets = maintenanceTickets.filter(m => m.propertyId === property.id);
  const propExpenses = expenses.filter(e => e.propertyId === property.id);
  const filteredExpenses = expenseStatusFilter === 'all' ? propExpenses : propExpenses.filter(e => e.status === expenseStatusFilter);
  const nextMaintenance = propTickets.find(t => t.status !== 'resuelto');
  const activeContract = propContracts.find(c => c.status === 'vigente' || c.status === 'por_vencer');

  const typeLabel = propertyTypeLabels[property.type] ?? property.type;
  const typeCls = propertyTypeColors[property.type] ?? 'bg-muted text-muted-foreground';

  const expOverdue = propExpenses.filter(e => e.status === 'vencido').length;
  const expWarning = propExpenses.filter(e => e.status === 'por_vencer').length;

  const handleDownloadPdf = async () => {
    setIsGeneratingPdf(true);
    // Small delay for UI feedback
    await new Promise(r => setTimeout(r, 300));
    try {
      generatePropertyPdf(property, propContracts, propExpenses, propTickets);
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const addTask = () => {
    if (!newDesc.trim()) return;
    const task: FutureTask = { id: `FT-new-${Date.now()}`, tag: newTag, description: newDesc.trim() };
    setLocalTasks(prev => [...prev, task]);
    setNewDesc('');
    setShowAddTask(false);
  };

  const deleteTask = (taskId: string) => {
    setLocalTasks(prev => prev.filter(t => t.id !== taskId));
  };

  const updateTask = (taskId: string, desc: string) => {
    setLocalTasks(prev => prev.map(t => t.id === taskId ? { ...t, description: desc } : t));
    setEditingTask(null);
  };

  return (
    <div>
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground mb-4">
        <Link to="/inmuebles" className="hover:text-foreground">Inventario</Link>
        <span>/</span>
        <span>{typeLabel}</span>
        <span>/</span>
        <span className="text-foreground font-medium">Detalle</span>
      </div>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link to="/inmuebles" className="p-2 rounded hover:bg-muted transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </Link>
          <div>
            <h1 className="text-xl font-semibold">{property.id} — {property.name}</h1>
            <div className="flex items-center gap-2 mt-1 flex-wrap">
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${typeCls}`}>{typeLabel}</span>
              <span className="text-xs text-muted-foreground">{property.address}, {property.city}</span>
              {/* Future task tags in header */}
              {localTasks.length > 0 && (
                <div className="flex gap-1 flex-wrap">
                  {localTasks.map(t => (
                    <span key={t.id} className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${futureTaskTagColors[t.tag]}`} title={t.description}>
                      {futureTaskTagLabels[t.tag]}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        <div className="flex gap-2">
          {role === 'admin' && (
            <button className="h-9 px-4 text-sm font-medium border border-input rounded hover:bg-muted transition-colors active:scale-[0.98]">Editar</button>
          )}
          <button
            onClick={handleDownloadPdf}
            disabled={isGeneratingPdf}
            className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors active:scale-[0.98] inline-flex items-center gap-2 disabled:opacity-60">
            {isGeneratingPdf ? <Loader2 className="h-4 w-4 animate-spin" /> : <Download className="h-4 w-4" />}
            {isGeneratingPdf ? 'Generando...' : 'Descargar PDF'}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="lg:col-span-2">
          {/* Tabs */}
          <div className="flex gap-0 border-b border-border mb-6 overflow-x-auto">
            {tabs.map(tab => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px whitespace-nowrap
                  ${activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'}`}>
                {tab}
                {tab === 'Gastos Generales' && expOverdue > 0 && (
                  <span className="ml-1.5 bg-red-100 text-red-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{expOverdue}</span>
                )}
                {tab === 'Planificación' && localTasks.length > 0 && (
                  <span className="ml-1.5 bg-blue-100 text-blue-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full">{localTasks.length}</span>
                )}
              </button>
            ))}
          </div>

          {/* General */}
          {activeTab === 'General' && (
            <div className="space-y-6">
              {/* Información General */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Información General</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: Building2, label: 'Tipo', value: typeLabel },
                    { icon: MapPin, label: 'Dirección', value: `${property.address}, ${property.city}` },
                    { icon: Globe, label: 'País', value: property.pais },
                    { icon: MapPin, label: 'Región', value: property.region },
                    { icon: MapPin, label: 'Comuna', value: property.comuna },
                    { icon: Briefcase, label: 'Sociedad', value: property.sociedad },
                    { icon: User, label: 'Responsable', value: property.responsible },
                    { icon: Building2, label: 'Estado', value: property.status === 'activo' ? 'Activo' : property.status === 'en_mantenimiento' ? 'En Mantención' : 'Inactivo' },
                    { icon: CheckCircle2, label: 'Habilitada', value: property.habilitada ? 'Sí' : 'No' },
                    { icon: Home, label: 'Amoblada', value: property.amoblada ? 'Sí' : 'No' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                      <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                        <p className="text-sm mt-0.5">{item.value}</p>
                      </div>
                    </div>
                  ))}
                  {property.anexo && (
                    <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                      <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Anexo</p>
                        <p className="text-sm mt-0.5">{property.anexo}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Información Física */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Información Física</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                    <Ruler className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">m² Construidos</p>
                      <p className="text-sm mt-0.5 font-mono-numeric">{property.m2Construidos.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                    <Ruler className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">m² Terreno</p>
                      <p className="text-sm mt-0.5 font-mono-numeric">{property.m2Terreno.toLocaleString('es-CL')}</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Antigüedad</p>
                      <p className="text-sm mt-0.5 font-mono-numeric">{property.antiguedad} ({new Date().getFullYear() - property.antiguedad} años)</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card sm:col-span-2 lg:col-span-3">
                    <Tag className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Tipo de Activo</p>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {property.assetTags.map(tag => (
                          <span key={tag} className="text-[10px] font-medium bg-muted px-2 py-0.5 rounded-full">{assetTagLabels[tag]}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Información Legal */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Información Legal</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {[
                    { icon: FileText, label: 'Rol', value: property.rol, mono: true },
                    { icon: User, label: 'RUT Asociado', value: property.rut, mono: true },
                    { icon: DollarSign, label: 'Avalúo Fiscal', value: formatCLP(property.avaluoFiscal), mono: true },
                    { icon: DollarSign, label: 'Valor Contribuciones', value: formatCLP(property.valorContribucion), mono: true },
                    { icon: DollarSign, label: 'Valor Libro', value: formatCLP(property.valorLibro), mono: true },
                    { icon: Calendar, label: 'Último Pago', value: property.ultimoPago ? formatDate(property.ultimoPago) : '—', mono: true },
                  ].map((item, i) => (
                    <div key={i} className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                      <item.icon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                      <div>
                        <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">{item.label}</p>
                        <p className={`text-sm mt-0.5 ${item.mono ? 'font-mono-numeric' : ''}`}>{item.value}</p>
                      </div>
                    </div>
                  ))}
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card sm:col-span-2">
                    <Shield className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Seguros</p>
                      <div className="flex flex-wrap gap-1.5 mt-1">
                        {property.seguros.map(s => (
                          <span key={s} className="text-[10px] font-medium bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">{s}</span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Documentos del Inmueble */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Documentos del Inmueble</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                    <FileText className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Escritura</p>
                      {property.escritura ? (
                        <p className="text-sm mt-0.5 text-primary hover:underline cursor-pointer">{property.escritura}</p>
                      ) : (
                        <p className="text-sm mt-0.5 text-muted-foreground italic">Sin escritura adjunta</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                    <FolderOpen className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Planos</p>
                      {property.planos.length > 0 ? (
                        <div className="space-y-0.5 mt-0.5">
                          {property.planos.map(p => (
                            <p key={p} className="text-sm text-primary hover:underline cursor-pointer">{p}</p>
                          ))}
                        </div>
                      ) : (
                        <p className="text-sm mt-0.5 text-muted-foreground italic">Sin planos adjuntos</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Observaciones */}
              {property.observaciones && (
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Observaciones</p>
                  <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                    <MessageSquare className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                    <p className="text-sm">{property.observaciones}</p>
                  </div>
                </div>
              )}

              {/* Multimedia */}
              <div>
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Multimedia</p>
                <div className="flex items-start gap-3 p-3 border border-border rounded bg-card">
                  <ImageIcon className="h-4 w-4 mt-0.5 text-muted-foreground shrink-0" />
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Fotos del Inmueble</p>
                    <p className="text-sm mt-0.5">{property.photos.length} foto(s) registrada(s)</p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Contratos */}
          {activeTab === 'Contratos' && (
            <div className="space-y-3">
              {propContracts.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay contratos asociados.</p>
              ) : propContracts.map(c => {
                const sem = getContractSemaphore(c.endDate);
                const days = getDaysRemaining(c.endDate);
                return (
                  <div key={c.id} className="border border-border rounded p-4 bg-card">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-mono-numeric text-sm font-medium">{c.id}</span>
                      </div>
                      <SemaphoreBadge status={sem} dueDate={c.endDate} />
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                      <div><p className="text-muted-foreground">Inicio</p><p className="font-medium">{formatDate(c.startDate)}</p></div>
                      <div><p className="text-muted-foreground">Término</p><p className="font-medium">{formatDate(c.endDate)}</p></div>
                      <div><p className="text-muted-foreground">Monto Mensual</p><p className="font-medium font-mono-numeric">{formatCLP(c.monthlyAmount)}</p></div>
                      <div><p className="text-muted-foreground">Contraparte</p><p className="font-medium">{c.counterpart}</p></div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-border">
                      <p className={`text-xs font-semibold ${days < 0 ? 'text-red-600' : days <= 90 ? 'text-amber-600' : 'text-emerald-600'}`}>
                        {days < 0 ? `⚠ Vencido hace ${Math.abs(days)} días` : days === 0 ? '⚠ Vence hoy' : `${days} días restantes`}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* Gastos Generales */}
          {activeTab === 'Gastos Generales' && (
            <div>
              <div className="flex flex-wrap gap-2 mb-4">
                {([['all', 'Todos', propExpenses.length], ['vencido', '🔴 Vencido', expOverdue], ['por_vencer', '🟡 Por vencer', expWarning], ['al_dia', '🟢 Al día', propExpenses.filter(e => e.status === 'al_dia').length]] as const).map(([val, lbl, cnt]) => (
                  <button key={val} onClick={() => setExpenseStatusFilter(val)}
                    className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${expenseStatusFilter === val ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                    {lbl} ({cnt})
                  </button>
                ))}
              </div>

              {filteredExpenses.length === 0 ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay gastos registrados.</p>
              ) : (
                <div className="border border-border rounded-md overflow-hidden bg-card">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr>
                          <th className="table-header-cell text-left">Tipo</th>
                          <th className="table-header-cell text-left">ID Cuenta</th>
                          <th className="table-header-cell text-center">Estado</th>
                          <th className="table-header-cell text-left">Vencimiento</th>
                          <th className="table-header-cell text-right">Monto</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredExpenses.map(e => (
                          <tr key={e.id} className="table-row-hover border-t border-border">
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <Zap className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="font-medium">{expenseTypeLabels[e.type]}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono-numeric text-xs">{e.accountId}</td>
                            <td className="px-4 py-3 text-center">
                              <SemaphoreBadge status={e.status} dueDate={e.dueDate} size="sm" />
                            </td>
                            <td className="px-4 py-3 font-mono-numeric text-xs">{formatDate(e.dueDate)}</td>
                            <td className="px-4 py-3 font-mono-numeric text-right">{formatCLP(e.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mantenimiento */}
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

          {/* Documentos */}
          {activeTab === 'Documentos' && (
            <div className="border border-border rounded p-6 bg-card text-center">
              <FolderOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Repositorio de documentos</p>
              <p className="text-xs text-muted-foreground mt-1">{propContracts.flatMap(c => c.documents).length} documento(s) asociado(s)</p>
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

          {/* Planificación */}
          {activeTab === 'Planificación' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{localTasks.length} ítem(s) de planificación</p>
                <button onClick={() => setShowAddTask(true)}
                  className="h-8 px-3 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors inline-flex items-center gap-1.5">
                  <Plus className="h-3.5 w-3.5" /> Agregar
                </button>
              </div>

              {/* Add form */}
              {showAddTask && (
                <div className="border border-primary/30 rounded-lg p-4 bg-primary/5 space-y-3">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Nueva Planificación</p>
                    <button onClick={() => setShowAddTask(false)} className="p-1 hover:bg-muted rounded"><X className="h-4 w-4" /></button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Tipo</label>
                      <select value={newTag} onChange={e => setNewTag(e.target.value as FutureTaskTag)}
                        className="w-full h-9 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring">
                        {(Object.keys(futureTaskTagLabels) as FutureTaskTag[]).map(tag => (
                          <option key={tag} value={tag}>{futureTaskTagLabels[tag]}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground block mb-1">Descripción</label>
                      <input value={newDesc} onChange={e => setNewDesc(e.target.value)} placeholder="Detalle..."
                        className="w-full h-9 text-sm border border-input rounded bg-card px-3 focus:outline-none focus:ring-1 focus:ring-ring" />
                    </div>
                  </div>
                  <button onClick={addTask} disabled={!newDesc.trim()}
                    className="h-8 px-4 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 disabled:opacity-50 transition-colors">
                    Guardar
                  </button>
                </div>
              )}

              {/* Planning list */}
              {localTasks.length === 0 && !showAddTask ? (
                <p className="text-sm text-muted-foreground py-8 text-center">No hay planificación registrada.</p>
              ) : (
                <div className="space-y-2">
                  {localTasks.map(task => (
                    <div key={task.id} className="border border-border rounded p-4 bg-card flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${futureTaskTagColors[task.tag]}`}>
                          {futureTaskTagLabels[task.tag]}
                        </span>
                        {editingTask === task.id ? (
                          <input
                            defaultValue={task.description}
                            onBlur={e => updateTask(task.id, e.target.value)}
                            onKeyDown={e => { if (e.key === 'Enter') updateTask(task.id, (e.target as HTMLInputElement).value); }}
                            autoFocus
                            className="w-full mt-2 h-8 text-sm border border-input rounded bg-card px-2 focus:outline-none focus:ring-1 focus:ring-ring"
                          />
                        ) : (
                          <p className="text-sm mt-2">{task.description}</p>
                        )}
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <button onClick={() => setEditingTask(task.id)} className="p-1.5 hover:bg-muted rounded transition-colors" title="Editar">
                          <Pencil className="h-3.5 w-3.5 text-muted-foreground" />
                        </button>
                        <button onClick={() => deleteTask(task.id)} className="p-1.5 hover:bg-red-50 rounded transition-colors" title="Eliminar">
                          <Trash2 className="h-3.5 w-3.5 text-red-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        <div className="space-y-4">
          {/* Vertical image carousel */}
          {property.photos.length > 0 && (
            <div className="kpi-card p-3">
              <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold mb-3">Fotos del Inmueble</p>
              <PhotoGallery photos={property.photos} />
            </div>
          )}

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
                  {activeContract ? (
                    <div className="mt-1">
                      <SemaphoreBadge status={getContractSemaphore(activeContract.endDate)} dueDate={activeContract.endDate} size="sm" />
                    </div>
                  ) : (
                    <p className="text-sm font-medium">Sin contrato</p>
                  )}
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
                <span className="text-muted-foreground">Gastos</span>
                <span className="font-mono-numeric">{propExpenses.length}</span>
              </div>
              {expOverdue > 0 && (
                <div className="flex justify-between text-red-600 font-semibold">
                  <span>Gastos vencidos</span>
                  <span className="font-mono-numeric">{expOverdue}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Documentos</span>
                <span className="font-mono-numeric">{propContracts.flatMap(c => c.documents).length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fotos</span>
                <span className="font-mono-numeric">{property.photos.length}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Planificación</span>
                <span className="font-mono-numeric">{localTasks.length}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
