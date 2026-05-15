import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { calculateMetrics } from '../lib/metrics';
import { Building2 } from 'lucide-react';
import { t } from '../lib/i18n';

const MetricRow = ({ value, label, sub }: { value: string | number, label: string, sub?: string }) => (
  <div className="flex flex-col items-center justify-center text-center py-4 relative">
    <span className="text-3xl font-bold font-serif text-[#374151] leading-tight">{value}</span>
    <span className="text-[11px] font-bold text-[#9CA3AF] uppercase tracking-widest mt-1">{label}</span>
    {sub && <span className="text-[10px] text-[#9CA3AF] mt-0.5">{sub}</span>}
  </div>
);

const ProgressBar = ({ label, value, color }: { label: string, value: number, color?: string }) => (
  <div className="mb-5">
    <div className="flex justify-between items-center text-[10px] mb-1.5">
      <span className="text-[#9CA3AF] font-bold tracking-widest uppercase">{label}</span>
      <span className="font-extrabold text-[#374151]">{value}%</span>
    </div>
    <div className="h-2 w-full bg-[#E5E7EB] rounded-sm overflow-hidden">
      <div className={`h-full ${color || 'bg-[#38bdf8]'}`} style={{ width: `${value}%` }} />
    </div>
  </div>
);

export function MetricsPanel() {
  const { versions, activeVersionId, language, projectDetails } = useWorkspaceStore();
  const dict = t[language];
  const activeVersion = versions.find(v => v.id === activeVersionId);
  const metrics = calculateMetrics(activeVersion?.elements || [], language, projectDetails?.totalArea || 0);

  return (
    <aside className="w-[84px] md:w-[200px] bg-white border-r border-[#E5E2DD] p-2 md:p-5 flex flex-col shrink-0 overflow-y-auto">
      <div className="flex justify-center mb-6 mt-2 relative pb-6 border-b border-[#F3F4F6]">
        <div className="flex flex-col items-center">
          <Building2 className="w-5 h-5 text-[#6B7280] mb-2" />
          <span className="text-lg md:text-[28px] font-bold text-[#374151] tracking-tight">{metrics.area.toLocaleString()}</span>
          <span className="text-[9px] md:text-[10px] text-[#9CA3AF] font-bold tracking-widest uppercase text-center">{dict.metrics.areaLabel}</span>
        </div>
      </div>

      <MetricRow value={metrics.seats} label={dict.metrics.seats} />
      <MetricRow value={metrics.openSpace} label={dict.metrics.openSpace} />
      <MetricRow value={metrics.offices} label={dict.metrics.offices} />
      <MetricRow value={metrics.confRooms} label={dict.metrics.confRooms} />
      <MetricRow value={metrics.archiveCapacity} label={dict.metrics.archiveCapacity} />
      
      <div className="h-px w-8 md:w-12 bg-[#E5E7EB] mx-auto my-4" />
      
      <MetricRow value={metrics.density} label={dict.metrics.density} sub={dict.metrics.densitySub} />

      <div className="h-px w-8 md:w-12 bg-[#E5E7EB] mx-auto my-6" />

      <div className="px-1 mt-2 hidden md:block">
        <ProgressBar label={dict.metrics.daylight} value={metrics.daylight} color="bg-[#0ea5e9]" />
        <ProgressBar label={dict.metrics.privacy} value={metrics.privacy} color="bg-[#0ea5e9]" />
        <ProgressBar label={dict.metrics.efficiency} value={metrics.efficiency} color="bg-[#0ea5e9]" />
        <div className="text-center mt-3 pt-3 border-t border-[#F3F4F6]">
          <span className="text-[10px] text-[#9CA3AF] uppercase tracking-widest border-l-2 border-[#9CA3AF] pl-2">&nbsp;{dict.metrics.average}</span>
        </div>
      </div>
    </aside>
  );
}
