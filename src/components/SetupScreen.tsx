import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { Layers } from 'lucide-react';
import { t } from '../lib/i18n';

export function SetupScreen() {
  const { setProjectDetails, language, setLanguage } = useWorkspaceStore();
  const dict = t[language];

  const [projectName, setProjectName] = useState('');
  const [advisorName, setAdvisorName] = useState('');
  const [totalArea, setTotalArea] = useState<string>('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const area = parseFloat(totalArea);
    if (projectName && advisorName && !isNaN(area) && area > 0) {
      setProjectDetails({ projectName, advisorName, totalArea: area });
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F8F7F4] flex flex-col items-center justify-center p-6 text-[#2D2A26]">
      <div className="absolute top-6 right-6">
        <div className="flex bg-[#F1EFEC] p-1 rounded-md border border-[#E5E2DD]">
          <button 
            onClick={() => setLanguage('en')}
            className={`px-4 py-1.5 text-sm font-bold rounded-sm transition-colors ${language === 'en' ? 'bg-white text-[#5A5A40] shadow-sm' : 'text-[#A89F91] hover:text-[#5A5A40]'}`}
          >EN</button>
          <button 
            onClick={() => setLanguage('es')}
            className={`px-4 py-1.5 text-sm font-bold rounded-sm transition-colors ${language === 'es' ? 'bg-white text-[#5A5A40] shadow-sm' : 'text-[#A89F91] hover:text-[#5A5A40]'}`}
          >ES</button>
        </div>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl overflow-hidden border border-[#E5E2DD]">
        <div className="p-8 text-center border-b border-[#E5E2DD] bg-[#F8F7F4]">
          <div className="w-16 h-16 bg-[#5A5A40] rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-inner">
            <Layers className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-[#2D2A26]">{dict.setup.title}</h1>
          <p className="text-[#A89F91] mt-2">{dict.setup.setupProject}</p>
        </div>

        <form onSubmit={handleSubmit} className="p-8 flex flex-col gap-5">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.projectName}
            </label>
            <input 
              type="text" 
              required
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              placeholder="Ej. HQ Remodel"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.advisor}
            </label>
            <input 
              type="text" 
              required
              value={advisorName}
              onChange={(e) => setAdvisorName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              placeholder="Ej. Ana García"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.area}
            </label>
            <input 
              type="number" 
              required
              step="0.01"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent transition-all"
              placeholder="1000"
            />
          </div>

          <button 
            type="submit"
            className="w-full mt-4 bg-[#5A5A40] hover:bg-[#4A4A35] text-white py-4 rounded-xl font-bold shadow-md hover:shadow-lg transition-all"
          >
            {dict.setup.start}
          </button>
        </form>
      </div>
    </div>
  );
}
