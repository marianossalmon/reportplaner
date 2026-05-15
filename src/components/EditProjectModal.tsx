import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { t } from '../lib/i18n';
import { X } from 'lucide-react';

interface Props {
  onClose: () => void;
}

export function EditProjectModal({ onClose }: Props) {
  const { projectDetails, setProjectDetails, language } = useWorkspaceStore();
  const dict = t[language];

  const [projectName, setProjectName] = useState(projectDetails?.projectName ?? '');
  const [advisorName, setAdvisorName]   = useState(projectDetails?.advisorName ?? '');
  const [totalArea, setTotalArea]       = useState(String(projectDetails?.totalArea ?? ''));
  const [clientLogoUrl, setClientLogoUrl] = useState(projectDetails?.clientLogoUrl ?? '');

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => setClientLogoUrl(ev.target?.result as string);
    reader.readAsDataURL(file);
  };

  const handleSave = () => {
    const area = parseFloat(totalArea);
    if (!projectName || !advisorName || isNaN(area) || area <= 0) return;
    setProjectDetails({ projectName, advisorName, totalArea: area, clientLogoUrl: clientLogoUrl || undefined });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">
        <div className="flex items-center justify-between p-6 border-b border-[#E5E2DD]">
          <h2 className="font-bold text-lg text-[#2D2A26]">
            {language === 'es' ? 'Editar Proyecto' : 'Edit Project'}
          </h2>
          <button onClick={onClose} className="text-[#A89F91] hover:text-[#2D2A26] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex flex-col gap-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.projectName}
            </label>
            <input
              type="text"
              value={projectName}
              onChange={(e) => setProjectName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.advisor}
            </label>
            <input
              type="text"
              value={advisorName}
              onChange={(e) => setAdvisorName(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.area}
            </label>
            <input
              type="number"
              value={totalArea}
              onChange={(e) => setTotalArea(e.target.value)}
              className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-2">
              {dict.setup.clientLogo}
            </label>
            {clientLogoUrl ? (
              <div className="flex items-center gap-3 p-3 bg-[#F8F7F4] rounded-xl border border-[#E5E2DD]">
                <img src={clientLogoUrl} className="h-10 object-contain max-w-[120px]" alt="client logo" />
                <button
                  onClick={() => setClientLogoUrl('')}
                  className="text-xs text-red-500 hover:text-red-700 font-medium ml-auto"
                >
                  {language === 'es' ? 'Quitar' : 'Remove'}
                </button>
              </div>
            ) : (
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="w-full px-4 py-3 bg-[#F8F7F4] border border-[#E5E2DD] rounded-xl focus:outline-none focus:ring-2 focus:ring-[#5A5A40] text-sm text-[#A89F91] file:mr-4 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-[#5A5A40] file:text-white"
              />
            )}
          </div>
        </div>

        <div className="p-6 border-t border-[#E5E2DD] flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-[#E5E2DD] text-[#5A5A40] rounded-xl font-semibold hover:bg-[#F8F7F4] transition-colors"
          >
            {language === 'es' ? 'Cancelar' : 'Cancel'}
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-3 bg-[#5A5A40] text-white rounded-xl font-semibold hover:bg-[#4A4A35] transition-colors"
          >
            {language === 'es' ? 'Guardar' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}