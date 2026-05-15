import { Upload, Trash2, Image as ImageIcon, Move, X } from 'lucide-react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { Toolbar } from './Toolbar';
import { ExportButton } from './ExportButton';
import { t } from '../lib/i18n';

export function Sidebar() {
  const {
    setBackgroundImage, clearWorkspace, clearVersionBackground,
    language, isEditingBackground, setIsEditingBackground,
    versions, activeVersionId,
  } = useWorkspaceStore();
  const dict = t[language];

  // ← Lee el background de la versión activa
  const backgroundImage = versions.find((v) => v.id === activeVersionId)?.backgroundImage ?? null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      if (ev.target?.result) setBackgroundImage(ev.target.result as string);
    };
    reader.readAsDataURL(file);
    // Reset input so same file can be re-selected
    e.target.value = '';
  };

  return (
    <aside className="w-72 bg-white border-r border-[#E5E2DD] p-6 flex flex-col gap-8 shrink-0 z-20 overflow-y-auto">
      <section className="space-y-3">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#A89F91]">{dict.blueprint}</h3>

        <label className="w-full h-28 border-2 border-dashed border-[#E5E2DD] rounded-lg flex flex-col items-center justify-center bg-[#F8F7F4] hover:border-[#5A5A40] transition-colors cursor-pointer relative overflow-hidden group">
          {backgroundImage ? (
            <div className="flex flex-col items-center justify-center py-4">
              <ImageIcon className="w-5 h-5 text-[#A89F91] mb-1 group-hover:text-[#5A5A40]" />
              <span className="text-xs text-[#A89F91] group-hover:text-[#5A5A40] text-center px-2">{dict.replaceImage}</span>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-4">
              <Upload className="w-5 h-5 text-[#A89F91] mb-1 group-hover:text-[#5A5A40]" />
              <p className="text-xs text-[#A89F91] group-hover:text-[#5A5A40] text-center px-2">{dict.uploadImage}</p>
            </div>
          )}
          <input type="file" className="hidden" accept="image/png, image/jpeg" onChange={handleFileUpload} />
        </label>

        {backgroundImage && (
          <div className="flex gap-2">
            <button
              onClick={() => setIsEditingBackground(!isEditingBackground)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-3 text-xs font-medium rounded-md transition-colors border ${isEditingBackground ? 'bg-[#5A5A40] text-white border-[#5A5A40]' : 'bg-white text-[#5A5A40] border-[#E5E2DD] hover:bg-[#F8F7F4]'}`}
            >
              <Move size={14} />
              {language === 'es' ? (isEditingBackground ? 'Terminar' : 'Ajustar') : (isEditingBackground ? 'Done' : 'Adjust')}
            </button>
            {/* Botón borrar imagen */}
            <button
              onClick={clearVersionBackground}
              title={language === 'es' ? 'Borrar imagen del plano' : 'Delete floor plan'}
              className="p-2 border border-[#E5E2DD] text-red-400 hover:text-red-600 hover:bg-red-50 hover:border-red-200 rounded-md transition-colors"
            >
              <X size={16} />
            </button>
          </div>
        )}
      </section>

      <section className="flex-1">
        <Toolbar />
      </section>

      <div className="bg-[#F8F7F4] rounded-xl border border-[#E5E2DD] mt-auto flex flex-col gap-3">
        <div className="p-4 border-b border-[#E5E2DD]">
          <p className="text-xs leading-relaxed text-[#A89F91]">{dict.proTip}</p>
        </div>
        <div className="p-4 space-y-3">
          <ExportButton />
          <button
            onClick={clearWorkspace}
            className="w-full flex items-center justify-center gap-2 py-2 px-4 text-xs text-[#A89F91] hover:text-[#5A5A40] hover:bg-[#F1EFEC] font-medium rounded-md transition-colors"
          >
            <Trash2 size={16} />
            <span>{dict.clearWorkspace}</span>
          </button>
        </div>
      </div>
    </aside>
  );
}