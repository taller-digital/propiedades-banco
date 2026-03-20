import { FolderOpen, FileText, Upload } from 'lucide-react';
import { contracts } from '@/data/mockData';

export default function DocumentsPage() {
  const allDocs = contracts.flatMap(c => c.documents.map(d => ({ name: d, contract: c.id, property: c.propertyName })));

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-xl font-semibold">Repositorio de Documentos</h1>
          <p className="text-sm text-muted-foreground mt-1">{allDocs.length} documentos registrados</p>
        </div>
        <button className="h-9 px-4 text-sm font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors active:scale-[0.98] flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Subir Documento
        </button>
      </div>

      <div className="border border-border rounded-md overflow-hidden bg-card">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr>
                <th className="table-header-cell text-left">Documento</th>
                <th className="table-header-cell text-left">Contrato</th>
                <th className="table-header-cell text-left">Inmueble</th>
                <th className="table-header-cell text-center">Versión</th>
              </tr>
            </thead>
            <tbody>
              {allDocs.map((doc, i) => (
                <tr key={i} className="table-row-hover border-t border-border">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{doc.name}</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 font-mono-numeric text-xs text-muted-foreground">{doc.contract}</td>
                  <td className="px-4 py-3 text-muted-foreground">{doc.property}</td>
                  <td className="px-4 py-3 text-center font-mono-numeric text-xs">v1.0</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}