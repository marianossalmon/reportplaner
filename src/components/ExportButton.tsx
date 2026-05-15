import { useState } from 'react';
import { exportToPDF, VersionCanvas } from '../lib/export';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { calculateMetrics } from '../lib/metrics';
import { t } from '../lib/i18n';
import { PreviewModal } from './PreviewModal';
import { WorkspaceElement } from '../types';

const EL_STYLES: Record<string, { fill: string; stroke: string; label: string }> = {
  desk_bench:      { fill: 'rgba(92,102,112,0.85)',  stroke: '#3A444C', label: '' },
  desk_individual: { fill: 'rgba(107,142,35,0.85)',  stroke: '#4B621B', label: '' },
  desk_operative:  { fill: 'rgba(70,130,180,0.85)',  stroke: '#2A5C84', label: '' },
  desk_executive:  { fill: 'rgba(128,0,0,0.85)',     stroke: '#500000', label: '' },
  meeting_room:    { fill: 'rgba(168,159,145,0.6)',  stroke: '#A89F91', label: 'SALA' },
  huddle_room:     { fill: 'rgba(56,189,248,0.55)',  stroke: '#0284c7', label: 'HUDDLE' },
  private_office:  { fill: 'rgba(210,180,140,0.7)',  stroke: '#8B6508', label: 'OFICINA' },
  lounge:          { fill: 'rgba(210,105,30,0.7)',   stroke: '#A0522D', label: 'LOUNGE' },
  dining:          { fill: 'rgba(143,188,143,0.7)',  stroke: '#2E8B57', label: 'COMEDOR' },
  reception:       { fill: 'rgba(100,149,237,0.7)',  stroke: '#4169E1', label: 'REC' },
  archive:         { fill: 'rgba(112,128,144,0.8)',  stroke: '#2F4F4F', label: 'ARCH' },
  site:            { fill: 'rgba(47,79,79,0.85)',    stroke: '#000',    label: 'SITE' },
};

async function renderVersionOffscreen(
  elements: WorkspaceElement[],
  backgroundImage: string | null,
  backgroundPos: { x: number; y: number },
  backgroundScale: { x: number; y: number },
  w: number,
  h: number
): Promise<string> {
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#FFFFFF';
  ctx.fillRect(0, 0, w, h);

  if (backgroundImage) {
    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.drawImage(img, backgroundPos.x, backgroundPos.y,
          img.naturalWidth * backgroundScale.x,
          img.naturalHeight * backgroundScale.y);
        ctx.restore();
        resolve();
      };
      img.onerror = () => resolve();
      img.src = backgroundImage;
    });
  }

  for (const el of elements) {
    const s = EL_STYLES[el.type] ?? { fill: 'rgba(200,200,200,0.8)', stroke: '#999', label: '' };
    const rx = 4;
    ctx.beginPath();
    ctx.moveTo(el.x + rx, el.y);
    ctx.lineTo(el.x + el.width - rx, el.y);
    ctx.quadraticCurveTo(el.x + el.width, el.y, el.x + el.width, el.y + rx);
    ctx.lineTo(el.x + el.width, el.y + el.height - rx);
    ctx.quadraticCurveTo(el.x + el.width, el.y + el.height, el.x + el.width - rx, el.y + el.height);
    ctx.lineTo(el.x + rx, el.y + el.height);
    ctx.quadraticCurveTo(el.x, el.y + el.height, el.x, el.y + el.height - rx);
    ctx.lineTo(el.x, el.y + rx);
    ctx.quadraticCurveTo(el.x, el.y, el.x + rx, el.y);
    ctx.closePath();
    ctx.fillStyle = s.fill;
    ctx.fill();
    ctx.strokeStyle = s.stroke;
    ctx.lineWidth = 1.5;
    ctx.stroke();

    if (s.label) {
      const fontSize = Math.max(7, Math.min(10, el.height / 3.5, el.width / 5));
      ctx.font = `bold ${fontSize}px sans-serif`;
      ctx.fillStyle = '#FFFFFF';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(s.label, el.x + el.width / 2, el.y + el.height / 2);
      if (el.capacity) {
        ctx.font = `${Math.max(6, fontSize - 2)}px sans-serif`;
        ctx.fillText(`(${el.capacity})`, el.x + el.width / 2, el.y + el.height / 2 + fontSize);
      }
    }
  }

  return canvas.toDataURL('image/png');
}

export function ExportButton() {
  const [isExporting, setIsExporting]     = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [previewUrl, setPreviewUrl]       = useState<string | null>(null);
  const { versions, language, projectDetails } = useWorkspaceStore();
  const dict = t[language];

  // ← async keyword aquí — éste era el bug
  const buildVersionCanvases = async (): Promise<VersionCanvas[]> => {
    const store = useWorkspaceStore.getState();

    if (store.viewMode !== 'canvas') {
      store.setViewMode('canvas');
      await new Promise((r) => setTimeout(r, 450));
    }

    const container = document.getElementById('workspace-canvas');
    const liveCanvas = container?.getElementsByTagName('canvas')[0];
    const w = liveCanvas?.width  || 900;
    const h = liveCanvas?.height || 650;

    return Promise.all(
      store.versions.map(async (v) => ({
        id: v.id,
        name: v.name,
        imgData: await renderVersionOffscreen(
          v.elements,
          v.backgroundImage      ?? null,
          v.backgroundPos        ?? { x: 0, y: 0 },
          v.backgroundScale      ?? { x: 1, y: 1 },
          w, h
        ),
        metrics: calculateMetrics(
          v.elements,
          store.language,
          store.projectDetails?.totalArea ?? 0
        ),
      }))
    );
  };

  const handlePreview = async () => {
    if (!projectDetails) return;
    try {
      setIsExporting(true);
      const vcs = await buildVersionCanvases();
      const url = await exportToPDF(vcs, language, projectDetails, 'preview');
      if (url) setPreviewUrl(url);
    } catch (e) {
      console.error(e);
      alert('Error al generar la vista previa');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDownload = async () => {
    if (!projectDetails) return;
    try {
      setIsDownloading(true);
      const vcs = await buildVersionCanvases();
      await exportToPDF(vcs, language, projectDetails, 'download');
    } catch (e) {
      console.error(e);
      alert('Error al exportar el PDF');
    } finally {
      setIsDownloading(false);
    }
  };

  const handleClosePreview = () => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(null);
  };

  return (
    <>
      <div className="flex flex-col gap-2 w-full">
        <button
          onClick={handlePreview}
          disabled={isExporting || isDownloading}
          className="w-full px-6 py-2 bg-white border border-[#5A5A40] text-[#5A5A40] text-sm font-semibold rounded-md shadow-sm hover:bg-[#F8F7F4] transition-colors disabled:opacity-50"
        >
          {isExporting ? dict.exporting : dict.previewReport}
        </button>
        <button
          onClick={handleDownload}
          disabled={isExporting || isDownloading}
          className="w-full px-6 py-2 bg-[#5A5A40] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-[#4A4A35] transition-colors disabled:opacity-50"
        >
          {isDownloading ? dict.exporting : dict.exportReport}
        </button>
      </div>

      {previewUrl && (
        <PreviewModal
          pdfUrl={previewUrl}
          onClose={handleClosePreview}
          onDownload={handleDownload}
          isDownloading={isDownloading}
        />
      )}
    </>
  );
}