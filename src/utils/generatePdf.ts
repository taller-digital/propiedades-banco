import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  type Property,
  type Contract,
  type Expense,
  type MaintenanceTicket,
  formatCLP,
  formatDate,
  expenseTypeLabels,
  assetTagLabels,
  futureTaskTagLabels,
  semaphoreLabels,
  propertyTypeLabels,
} from '@/data/mockData';

export function generatePropertyPdf(
  property: Property,
  contracts: Contract[],
  expenses: Expense[],
  tickets: MaintenanceTicket[],
) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 15;

  // ── Header ──
  doc.setFillColor(30, 64, 175); // primary blue
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('Reporte de Inmueble', 14, 15);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text(`${property.id} — ${property.name}`, 14, 24);
  doc.setFontSize(8);
  doc.text(`Generado: ${new Date().toLocaleDateString('es-CL')}`, pageWidth - 14, 24, { align: 'right' });

  y = 40;
  doc.setTextColor(30, 30, 30);

  // ── Section helper ──
  const sectionTitle = (title: string) => {
    if (y > 260) { doc.addPage(); y = 15; }
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text(title, 14, y);
    y += 2;
    doc.setDrawColor(30, 64, 175);
    doc.line(14, y, pageWidth - 14, y);
    y += 6;
    doc.setTextColor(30, 30, 30);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
  };

  const addField = (label: string, value: string) => {
    if (y > 275) { doc.addPage(); y = 15; }
    doc.setFont('helvetica', 'bold');
    doc.text(`${label}:`, 14, y);
    doc.setFont('helvetica', 'normal');
    doc.text(value || '—', 60, y);
    y += 5;
  };

  // ── Información General ──
  sectionTitle('Información General');
  const typeLabel = propertyTypeLabels[property.type];
  const statusLabel = property.status === 'activo' ? 'Activo' : property.status === 'en_mantenimiento' ? 'En Mantención' : 'Inactivo';
  addField('Tipo', typeLabel);
  addField('Estado', statusLabel);
  addField('Dirección', `${property.address}, ${property.comuna}, ${property.city}`);
  addField('Región', property.region);
  addField('País', property.pais);
  addField('Sociedad', property.sociedad);
  addField('Responsable', property.responsible);
  addField('Habilitada', property.habilitada ? 'Sí' : 'No');
  addField('Amoblada', property.amoblada ? 'Sí' : 'No');
  if (property.anexo) addField('Anexo', property.anexo);
  y += 3;

  // ── Información Física ──
  sectionTitle('Información Física');
  addField('m² Construidos', property.m2Construidos.toLocaleString('es-CL'));
  addField('m² Terreno', property.m2Terreno.toLocaleString('es-CL'));
  addField('Antigüedad', `${property.antiguedad}`);
  addField('Tipo de Activo', property.assetTags.map(t => assetTagLabels[t]).join(', '));
  y += 3;

  // ── Información Legal ──
  sectionTitle('Información Legal');
  addField('Rol', property.rol);
  addField('RUT', property.rut);
  addField('Avalúo Fiscal', formatCLP(property.avaluoFiscal));
  addField('Valor Contribuciones', formatCLP(property.valorContribucion));
  addField('Valor Libro', formatCLP(property.valorLibro));
  addField('Último Pago', property.ultimoPago ? formatDate(property.ultimoPago) : '—');
  addField('Seguros', property.seguros.join(', '));
  y += 3;

  // ── Documentos ──
  sectionTitle('Documentos');
  addField('Escritura', property.escritura || 'Sin escritura adjunta');
  addField('Planos', property.planos.length > 0 ? property.planos.join(', ') : 'Sin planos adjuntos');
  y += 3;

  // ── Planificación ──
  if (property.futureTasks.length > 0) {
    sectionTitle('Planificación');
    property.futureTasks.forEach(t => {
      addField(futureTaskTagLabels[t.tag], t.description);
    });
    y += 3;
  }

  // ── Observaciones ──
  if (property.observaciones) {
    sectionTitle('Observaciones');
    const lines = doc.splitTextToSize(property.observaciones, pageWidth - 28);
    doc.text(lines, 14, y);
    y += lines.length * 4 + 5;
  }

  // ── Contratos ──
  if (contracts.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }
    sectionTitle('Contratos');
    autoTable(doc, {
      startY: y,
      head: [['ID', 'Contraparte', 'Inicio', 'Término', 'Monto Mensual', 'Estado']],
      body: contracts.map(c => [
        c.id,
        c.counterpart,
        formatDate(c.startDate),
        formatDate(c.endDate),
        formatCLP(c.monthlyAmount),
        c.status === 'vigente' ? 'Vigente' : c.status === 'por_vencer' ? 'Por Vencer' : 'Vencido',
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Gastos ──
  if (expenses.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }
    sectionTitle('Gastos Operacionales');
    autoTable(doc, {
      startY: y,
      head: [['Tipo', 'Cuenta', 'Vencimiento', 'Monto', 'Estado']],
      body: expenses.map(e => [
        expenseTypeLabels[e.type],
        e.accountId,
        formatDate(e.dueDate),
        formatCLP(e.amount),
        semaphoreLabels[e.status],
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] },
    });
    y = (doc as any).lastAutoTable.finalY + 8;
  }

  // ── Mantenimiento ──
  if (tickets.length > 0) {
    if (y > 220) { doc.addPage(); y = 15; }
    sectionTitle('Mantenimiento');
    autoTable(doc, {
      startY: y,
      head: [['ID', 'Título', 'Prioridad', 'Estado', 'Costo', 'Fecha']],
      body: tickets.map(t => [
        t.id,
        t.title,
        t.priority.charAt(0).toUpperCase() + t.priority.slice(1),
        t.status === 'pendiente' ? 'Pendiente' : t.status === 'en_proceso' ? 'En Proceso' : 'Resuelto',
        formatCLP(t.cost),
        formatDate(t.createdAt),
      ]),
      styles: { fontSize: 8 },
      headStyles: { fillColor: [30, 64, 175] },
    });
  }

  // ── Footer on all pages ──
  const totalPages = doc.getNumberOfPages();
  for (let i = 1; i <= totalPages; i++) {
    doc.setPage(i);
    doc.setFontSize(7);
    doc.setTextColor(150);
    doc.text('Plataforma de Gestión de Activos Inmobiliarios — Confidencial', 14, doc.internal.pageSize.getHeight() - 8);
    doc.text(`Página ${i} de ${totalPages}`, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
  }

  doc.save(`Reporte_${property.id}.pdf`);
}
