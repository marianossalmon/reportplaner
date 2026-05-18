import { useState } from 'react';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { ElementType } from '../types';
import {
  Monitor, Users, Briefcase, Sofa, Coffee, Bell, Archive,
  Server, Laptop, Armchair, Airplay, LayoutGrid, ChevronDown, ChevronRight,
} from 'lucide-react';
import { t } from '../lib/i18n';

export function Toolbar() {
  const { setPlacementMode, placementMode, language } = useWorkspaceStore();
  const dict = t[language];
  const [desksOpen, setDesksOpen] = useState(false);
  const [otherOpen, setOtherOpen] = useState(false);

  const handleAdd = (type: ElementType) => {
    setPlacementMode(placementMode === type ? null : type);
  };

  const deskButtons = [
    { type: 'desk_bench' as ElementType,      icon: Airplay },
    { type: 'desk_operative' as ElementType,  icon: Monitor },
    { type: 'desk_individual' as ElementType, icon: Laptop },
    { type: 'desk_executive' as ElementType,  icon: Briefcase },
  ];

  const collabButtons = [
    { type: 'meeting_room' as ElementType, icon: Users },
    { type: 'huddle_room' as ElementType,  icon: LayoutGrid },
    { type: 'private_office' as ElementType, icon: Briefcase },
    { type: 'lounge' as ElementType,       icon: Armchair },
    { type: 'dining' as ElementType,       icon: Coffee },
    { type: 'reception' as ElementType,    icon: Bell },
    { type: 'archive' as ElementType,        icon: Archive },
    { type: 'site' as ElementType,           icon: Server },
  ];

  const renderButton = ({ type, icon: Icon }: { type: ElementType; icon: any }) => {
    const isActive = placementMode === type;
    return (
      <button
        key={type}
        onClick={() => handleAdd(type)}
        className={`w-full group flex items-center p-3 border rounded-lg transition-all ${
          isActive
            ? 'border-[#5A5A40] bg-[#F8F7F4] shadow-inner'
            : 'border-[#E5E2DD] hover:border-[#5A5A40] hover:bg-[#F8F7F4]'
        }`}
      >
        <div
          className={`w-10 h-10 rounded flex items-center justify-center mr-3 transition-colors shrink-0 ${
            isActive
              ? 'bg-[#5A5A40] text-white'
              : 'bg-[#E5E2DD] text-[#5A5A40] group-hover:bg-[#5A5A40] group-hover:text-white'
          }`}
        >
          <Icon size={20} />
        </div>
        <div className="text-left overflow-hidden">
          <div className="text-sm font-semibold text-[#2D2A26] truncate">{dict.elements[type].title}</div>
          <div className="text-[10px] text-[#A89F91] truncate">{dict.elements[type].sub}</div>
        </div>
      </button>
    );
  };

  return (
    <>
      <h3 className="text-xs font-bold uppercase tracking-widest text-[#A89F91] mb-4">
        {dict.furnitureLibrary}
      </h3>

      <div className="space-y-3">
        {/* Desks Accordion */}
        <div className="border border-[#E5E2DD] rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#F8F7F4] transition-colors"
            onClick={() => setDesksOpen(!desksOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#E5E2DD] text-[#5A5A40] flex items-center justify-center">
                <Monitor size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#2D2A26]">
                  {language === 'en' ? 'Desks & Workstations' : 'Escritorios'}
                </div>
                <div className="text-[10px] text-[#A89F91]">
                  {deskButtons.length} {language === 'en' ? 'options' : 'opciones'}
                </div>
              </div>
            </div>
            {desksOpen ? <ChevronDown size={20} className="text-[#A89F91]" /> : <ChevronRight size={20} className="text-[#A89F91]" />}
          </button>
          {desksOpen && (
            <div className="p-3 bg-[#F8F7F4] border-t border-[#E5E2DD] space-y-3">
              {deskButtons.map(renderButton)}
            </div>
          )}
        </div>

        {/* Spaces Accordion */}
        <div className="border border-[#E5E2DD] rounded-lg overflow-hidden">
          <button
            className="w-full flex items-center justify-between p-3 bg-white hover:bg-[#F8F7F4] transition-colors"
            onClick={() => setOtherOpen(!otherOpen)}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded bg-[#E5E2DD] text-[#5A5A40] flex items-center justify-center">
                <Sofa size={20} />
              </div>
              <div className="text-left">
                <div className="text-sm font-semibold text-[#2D2A26]">
                  {language === 'en' ? 'Spaces' : 'Espacios'}
                </div>
                <div className="text-[10px] text-[#A89F91]">
                  {collabButtons.length} {language === 'en' ? 'options' : 'opciones'}
                </div>
              </div>
            </div>
            {otherOpen ? <ChevronDown size={20} className="text-[#A89F91]" /> : <ChevronRight size={20} className="text-[#A89F91]" />}
          </button>
          {otherOpen && (
            <div className="p-3 bg-[#F8F7F4] border-t border-[#E5E2DD] space-y-3">
              {collabButtons.map(renderButton)}
            </div>
          )}
        </div>

      </div>
    </>
  );
}