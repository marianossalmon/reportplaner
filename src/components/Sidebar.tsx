import { Upload, Trash2, Image as ImageIcon, Move } from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { Toolbar } from './Toolbar';
import { ExportButton } from './ExportButton';
import { t } from '../lib/i18n';

export function Sidebar() {
  const { setBackgroundImage, clearWorkspace, backgroundImage, language, isEditingBackground, setIsEditingBackground } = useWorkspaceStore();
  const dict = t[language];

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setBackgroundImage(event.target.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <aside className="w-72 bg-white border-r border-[#E5E2DD] p-6 flex flex-col gap-8 shrink-0 z-20 overflow-y-auto">
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#A89F91]">{dict.blueprint}</h3>
        <label className="w-full h-32 border-2 border-dashed border-[#E5E2DD] rounded-lg flex flex-col items-center justify-center bg-[#F8F7F4] hover:border-[#5A5A40] transition-colors cursor-pointer relative overflow-hidden group">
          {backgroundImage ? (
             <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <ImageIcon className="w-6 h-6 text-[#A89F91] mb-2 group-hover:text-[#5A5A40] transition-colors" />
                <span className="text-xs text-[#A89F91] group-hover:text-[#5A5A40] transition-colors text-center px-2">{dict.replaceImage}</span>
             </div>
          ) : (
            <div className="flex flex-col items-center justify-center pt-5 pb-6">
              <Upload className="w-6 h-6 text-[#A89F91] mb-2 group-hover:text-[#5A5A40] transition-colors" />
              <p className="text-xs text-[#A89F91] group-hover:text-[#5A5A40] transition-colors text-center px-2">{dict.uploadImage}</p>
            </div>
          )}
          <input 
            type="file" 
            className="hidden" 
            accept="image/png, image/jpeg" 
            onChange={handleFileUpload} 
          />
        </label>
        
        {backgroundImage && (
          <button
            onClick={() => setIsEditingBackground(!isEditingBackground)}
            className={`w-full flex items-center justify-center gap-2 py-2 px-4 text-xs font-medium rounded-md transition-colors border ${isEditingBackground ? 'bg-[#5A5A40] text-white border-[#5A5A40]' : 'bg-white text-[#5A5A40] border-[#E5E2DD] hover:bg-[#F8F7F4]'}`}
          >
            <Move size={16} />
            {language === 'es' ? (isEditingBackground ? 'Terminar Ajuste' : 'Ajustar Plano') : (isEditingBackground ? 'Done Editing' : 'Adjust Floorplan')}
          </button>
        )}
      </section>

      <section className="flex-1">
        <Toolbar />
      </section>

      <div className="bg-[#F8F7F4] rounded-xl border border-[#E5E2DD] mt-auto flex flex-col gap-3">
        <div className="p-4 border-b border-[#E5E2DD]">
          <p className="text-xs leading-relaxed text-[#A89F91]">
             {dict.proTip}
          </p>
        </div>
        
        <div className="p-4 space-y-3">
          <ExportButton />
          
          {backgroundImage && (
            <button 
              onClick={clearWorkspace}
              className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs text-[#A89F91] hover:text-[#5A5A40] hover:bg-[#F1EFEC] font-medium rounded-md transition-colors"
            >
              <Trash2 size={16} />
              <span>{dict.clearWorkspace}</span>
            </button>
          )}
        </div>
      </div>
    </aside>
  );
}
