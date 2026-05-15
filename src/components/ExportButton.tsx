import { useState } from 'react';
import { exportToPDF } from '../lib/export';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { calculateMetrics } from '../lib/metrics';
import { t } from '../lib/i18n';

export function ExportButton() {
  const [isExporting, setIsExporting] = useState(false);
  const { versions, activeVersionId, language, projectDetails } = useWorkspaceStore();
  const dict = t[language];
  
  const handleExport = async () => {
    if (!projectDetails) return;
    try {
      setIsExporting(true);
      const prevMode = useWorkspaceStore.getState().viewMode;
      if (prevMode !== 'canvas') {
        useWorkspaceStore.getState().setViewMode('canvas');
        // Wait a bit for React to render and Konva to mount
        await new Promise(r => setTimeout(r, 400));
      }
      const activeVersion = versions.find(v => v.id === activeVersionId);
      const metrics = calculateMetrics(activeVersion?.elements || [], language, projectDetails.totalArea);
      await exportToPDF('workspace-canvas', metrics, language, projectDetails);
      
      if (prevMode !== 'canvas') {
        useWorkspaceStore.getState().setViewMode(prevMode);
      }
    } catch (e) {
      console.error(e);
      alert('Error exporting PDF');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting}
      className="w-full px-6 py-2 bg-[#5A5A40] text-white text-sm font-semibold rounded-md shadow-sm hover:bg-[#4A4A35] transition-colors disabled:opacity-50"
    >
      {isExporting ? dict.exporting : dict.exportReport}
    </button>
  );
}
