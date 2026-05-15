import { X, Download } from 'lucide-react';

interface Props {
  pdfUrl: string;
  onClose: () => void;
  onDownload: () => void;
  isDownloading: boolean;
}

export function PreviewModal({ pdfUrl, onClose, onDownload, isDownloading }: Props) {
  return (
    <div className="fixed inset-0 bg-black/70 flex flex-col items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl flex flex-col w-full max-w-5xl h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-[#E5E2DD] shrink-0">
          <span className="font-semibold text-[#2D2A26]">Vista Previa del Reporte</span>
          <div className="flex items-center gap-3">
            <button
              onClick={onDownload}
              disabled={isDownloading}
              className="flex items-center gap-2 px-4 py-2 bg-[#5A5A40] text-white text-sm font-semibold rounded-lg hover:bg-[#4A4A35] transition-colors disabled:opacity-50"
            >
              <Download size={16} />
              {isDownloading ? 'Descargando...' : 'Descargar PDF'}
            </button>
            <button onClick={onClose} className="text-[#A89F91] hover:text-[#2D2A26] transition-colors">
              <X size={22} />
            </button>
          </div>
        </div>
        <div className="flex-1 bg-[#F1EFEC] overflow-hidden">
          <iframe src={pdfUrl} className="w-full h-full border-0" title="PDF Preview" />
        </div>
      </div>
    </div>
  );
}