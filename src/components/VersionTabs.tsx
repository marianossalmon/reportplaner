import { Plus, BarChart2 } from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { t } from '../lib/i18n';

export function VersionTabs() {
  const { versions, activeVersionId, addVersion, setActiveVersion, viewMode, setViewMode, language } = useWorkspaceStore();
  const dict = t[language];

  return (
    <div className="h-14 mt-4 px-6 flex items-end gap-2 shrink-0 border-b border-[#E5E2DD] z-10 relative">
      {versions.map(v => {
        const isActive = viewMode === 'canvas' && activeVersionId === v.id;
        return (
          <button
            key={v.id}
            onClick={() => setActiveVersion(v.id)}
            className={`px-5 py-2.5 text-sm font-semibold rounded-t-lg transition-colors border-t border-x border-transparent relative translate-y-[1px] ${
              isActive
                ? 'bg-[#F1EFEC] text-[#5A5A40] border-[#E5E2DD]'
                : 'text-[#A89F91] hover:text-[#5A5A40] hover:bg-white/50'
            }`}
          >
            {v.name}
          </button>
        );
      })}
      
      <button
        onClick={addVersion}
        className="p-2 mb-1.5 ml-2 text-[#A89F91] hover:text-[#5A5A40] hover:bg-white/50 rounded-md transition-colors"
        title="Add Alternative Variant"
      >
        <Plus size={18} />
      </button>
      
      <div className="ml-auto mb-2">
        <button
          onClick={() => setViewMode('summary')}
          className={`flex items-center gap-2 px-4 py-1.5 text-sm font-bold rounded-md transition-colors ${
            viewMode === 'summary'
              ? 'bg-[#5A5A40] text-white shadow-sm'
              : 'bg-white text-[#5A5A40] border border-[#E5E2DD] hover:border-[#5A5A40] shadow-sm'
          }`}
        >
          <BarChart2 size={16} />
          {dict.summary.tabStr}
        </button>
      </div>
    </div>
  );
}
