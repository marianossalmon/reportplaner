import { useState } from 'react';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { MetricsPanel } from './components/MetricsPanel';
import { VersionTabs } from './components/VersionTabs';
import { SummaryDashboard } from './components/SummaryDashboard';
import { SetupScreen } from './components/SetupScreen';
import { EditProjectModal } from './components/EditProjectModal';
import { useWorkspaceStore } from './store/useWorkspaceStore';
import { Layers, Pencil } from 'lucide-react';
import { t } from './lib/i18n';

function App() {
  const { viewMode, language, setLanguage, projectDetails } = useWorkspaceStore();
  const dict = t[language];
  const [showEditModal, setShowEditModal] = useState(false);

  if (!projectDetails) return <SetupScreen />;

  return (
    <div className="flex flex-col h-screen w-full bg-[#F8F7F4] font-sans text-[#2D2A26] overflow-hidden">
      <nav className="h-16 bg-white border-b border-[#E5E2DD] px-8 flex items-center justify-between shrink-0 z-20">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-[#5A5A40] rounded flex items-center justify-center">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <span className="font-semibold text-lg tracking-tight">{dict.appTitle}</span>
          <span className="mx-4 text-[#A89F91]">/</span>
          <span className="text-[#A89F91]">{projectDetails.projectName}</span>
          <button
            onClick={() => setShowEditModal(true)}
            title={language === 'es' ? 'Editar proyecto' : 'Edit project'}
            className="ml-1 p-1.5 text-[#A89F91] hover:text-[#5A5A40] hover:bg-[#F1EFEC] rounded-md transition-colors"
          >
            <Pencil size={14} />
          </button>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-[#F1EFEC] p-1 rounded-md">
            <button
              onClick={() => setLanguage('en')}
              className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors ${language === 'en' ? 'bg-white text-[#5A5A40] shadow-sm' : 'text-[#A89F91] hover:text-[#5A5A40]'}`}
            >EN</button>
            <button
              onClick={() => setLanguage('es')}
              className={`px-3 py-1 text-xs font-bold rounded-sm transition-colors ${language === 'es' ? 'bg-white text-[#5A5A40] shadow-sm' : 'text-[#A89F91] hover:text-[#5A5A40]'}`}
            >ES</button>
          </div>
          <button className="px-4 py-2 text-sm font-medium text-[#5A5A40] hover:bg-[#F1EFEC] rounded-md transition-colors">
            {dict.saveDraft}
          </button>
        </div>
      </nav>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        {viewMode === 'canvas' && <MetricsPanel />}
        <main className="flex-1 flex flex-col h-full bg-[#F1EFEC] relative overflow-hidden">
          <VersionTabs />
          {viewMode === 'canvas' ? (
            <div className="flex-1 relative">
              <Canvas />
            </div>
          ) : (
            <div className="flex-1 bg-[#F1EFEC] flex flex-col relative overflow-hidden">
              <SummaryDashboard />
            </div>
          )}
        </main>
      </div>

      {showEditModal && <EditProjectModal onClose={() => setShowEditModal(false)} />}
    </div>
  );
}

export default App;