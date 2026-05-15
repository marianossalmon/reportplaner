import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { calculateMetrics } from '../lib/metrics';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { t } from '../lib/i18n';

const COLORS = ['#6366f1', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'];

export function SummaryDashboard() {
  const { versions, language, projectDetails } = useWorkspaceStore();
  const dict = t[language];
  
  const tableData = versions.map(v => ({
    name: v.name,
    metrics: calculateMetrics(v.elements, language, projectDetails?.totalArea || 0)
  }));

  const radarData = [
    { subject: dict.metrics.density, ...tableData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.metrics.density }), {}) },
    { subject: dict.metrics.daylight, ...tableData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.metrics.daylight / 100 }), {}) },
    { subject: dict.metrics.privacy, ...tableData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.metrics.privacy / 100 }), {}) },
    { subject: dict.metrics.efficiency, ...tableData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.metrics.efficiency / 100 }), {}) },
    { subject: dict.metrics.offices, ...tableData.reduce((acc, curr) => ({ ...acc, [curr.name]: curr.metrics.offices * 5 }), {}) },
  ];

  return (
    <div className="flex-1 bg-[#F1EFEC] p-6 overflow-y-auto w-full">
      <div className="max-w-5xl mx-auto space-y-6">
        
        {/* Table */}
        <div className="bg-white rounded-xl border border-[#E5E2DD] overflow-hidden">
           <div className="px-6 py-4 border-b border-[#E5E2DD] bg-[#F8F7F4]">
             <h2 className="text-sm font-bold uppercase tracking-widest text-[#5A5A40]">{dict.summary.analysis}</h2>
           </div>
           <div className="overflow-x-auto">
             <table className="w-full text-sm text-left whitespace-nowrap">
               <thead>
                 <tr className="border-b border-[#E5E2DD]">
                   <th className="py-3 px-6 font-semibold text-[#A89F91]">{dict.summary.metric}</th>
                   {tableData.map((d, i) => (
                     <th key={d.name} className="py-3 px-6 font-semibold text-center" style={{ color: COLORS[i % COLORS.length] }}>
                       <div className="flex items-center justify-center gap-2">
                         <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                         {d.name}
                       </div>
                     </th>
                   ))}
                 </tr>
               </thead>
               <tbody>
                 {[
                   dict.metrics.seats, 
                   dict.metrics.openSpace, 
                   dict.metrics.offices, 
                   dict.metrics.confRooms, 
                   `${dict.metrics.density} ${dict.metrics.densitySub}`, 
                   `${dict.metrics.daylight} %`, 
                   `${dict.metrics.privacy} %`, 
                   `${dict.metrics.efficiency} %`
                 ].map((metricName, rowIndex) => {
                   const metricKeys = ['seats', 'openSpace', 'offices', 'confRooms', 'density', 'daylight', 'privacy', 'efficiency'] as const;
                   const key = metricKeys[rowIndex];
                   return (
                     <tr key={key} className="border-b border-[#E5E2DD] last:border-0 hover:bg-[#F8F7F4] transition-colors">
                       <td className="py-3 px-6 font-medium text-[#2D2A26]">{metricName}</td>
                       {tableData.map(d => (
                         <td key={d.name} className="py-3 px-6 text-center text-[#5A5A40] font-mono">
                           {d.metrics[key]}
                         </td>
                       ))}
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pb-12 w-full">
           <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 h-[340px] flex flex-col relative shrink-0">
             <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] mb-2">{dict.summary.compare}</h3>
             
             <div className="absolute top-6 right-6 flex flex-wrap gap-3 text-[10px] font-bold text-[#A89F91]">
               {tableData.map((d, i) => (
                 <span key={d.name} className="flex items-center gap-1">
                   <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }}></span>
                   {d.name}
                 </span>
               ))}
             </div>

             <div className="flex-1 min-h-0 pt-4">
                <ResponsiveContainer width="100%" height="100%">
                  <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
                    <PolarGrid stroke="#E5E2DD" />
                    <PolarAngleAxis dataKey="subject" tick={{ fill: '#A89F91', fontSize: 10, fontWeight: 'bold' }} />
                    <PolarRadiusAxis angle={30} domain={[0, 'dataMax']} tick={false} axisLine={false} />
                    {tableData.map((d, i) => (
                      <Radar
                        key={d.name}
                        name={d.name}
                        dataKey={d.name}
                        stroke={COLORS[i % COLORS.length]}
                        fill={COLORS[i % COLORS.length]}
                        fillOpacity={0.2}
                        strokeWidth={2}
                      />
                    ))}
                  </RadarChart>
                </ResponsiveContainer>
             </div>
           </div>

           <div className="bg-white rounded-xl border border-[#E5E2DD] p-6 h-[340px] flex flex-col shrink-0">
             <h3 className="text-xs font-bold uppercase tracking-widest text-[#5A5A40] mb-6">{dict.summary.spaceDist}</h3>
             <div className="flex-1 min-h-0 flex flex-col justify-center gap-6 overflow-y-auto pr-2">
                {tableData.map((d, i) => {
                  const totalSeats = d.metrics.seats || 1;
                  // Trabajo is openSpace + offices (assuming 1 per office)
                  const workSeats = d.metrics.openSpace + d.metrics.offices;
                  // Compartido is confRooms (assuming these capacities were tracked)
                  const sharedSeats = d.metrics.confRooms * 5; // Fallback or whatever is needed
                  const amenitySeats = (d.metrics as any).lounge || 0; // We might not have this in the summary if it's not present
                  
                  const workPct = Math.round((workSeats / totalSeats) * 100);
                  const sharedPct = Math.round(((d.metrics.seats - workSeats - amenitySeats) / totalSeats) * 100);
                  const amenityPct = 100 - workPct - sharedPct;
                  
                  return (
                    <div key={d.name} className="w-full shrink-0">
                      <div className="flex items-center justify-between text-xs mb-2">
                         <span className="font-semibold text-[#2D2A26] flex items-center gap-2">
                           <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                           {d.name}
                         </span>
                      </div>
                      <div className="w-full h-8 flex rounded overflow-hidden bg-[#E5E2DD] border border-[#E5E2DD]">
                        <div style={{ width: `${workPct}%` }} className="bg-[#b3d4ff] transition-all duration-500" title={dict.summary.work} />
                        <div style={{ width: `${sharedPct}%` }} className="bg-[#b5e5cf] transition-all duration-500" title={dict.summary.shared} />
                        <div style={{ width: `${amenityPct}%` }} className="bg-[#ffe4a0] transition-all duration-500" title={dict.summary.amenities} />
                        <div className="flex-1 bg-[#ded9d2]" title={dict.summary.structure} />
                      </div>
                    </div>
                  )
                })}
             </div>
             <div className="flex flex-wrap gap-4 justify-center text-[10px] font-bold tracking-wider text-[#A89F91] mt-4 uppercase pt-4 border-t border-[#E5E2DD]">
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#b3d4ff]"></span> {dict.summary.work}</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#b5e5cf]"></span> {dict.summary.shared}</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ffe4a0]"></span> {dict.summary.amenities}</span>
                 <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-[#ded9d2]"></span> {dict.summary.structure}</span>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
}
