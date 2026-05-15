import { useEffect, useState, useRef } from 'react';
import { Stage, Layer, Image as KonvaImage, Rect, Text, Group } from 'react-konva';
import useImage from 'use-image';
import { useWorkspaceStore } from '../store/useWorkspaceStore';
import { t } from '../lib/i18n';

import { Transformer } from 'react-konva';

function BackgroundImage({ src, isEditing, pos, scale, onTransformEnd }: any) {
  const [image] = useImage(src);
  const imageRef = useRef<any>(null);
  const trRef = useRef<any>(null);

  useEffect(() => {
    if (isEditing && trRef.current && imageRef.current) {
      trRef.current.nodes([imageRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isEditing, image]);

  if (!image) return null;
  return (
    <>
      <KonvaImage 
        ref={imageRef}
        name="background-image"
        image={image} 
        x={pos.x} 
        y={pos.y} 
        scaleX={scale.x}
        scaleY={scale.y}
        draggable={isEditing} 
        opacity={isEditing ? 1 : 0.7} 
        onDragEnd={(e) => {
          onTransformEnd({
            x: e.target.x(),
            y: e.target.y(),
            scaleX: e.target.scaleX(),
            scaleY: e.target.scaleY()
          });
        }}
        onTransformEnd={(e) => {
          const node = imageRef.current;
          onTransformEnd({
            x: node.x(),
            y: node.y(),
            scaleX: node.scaleX(),
            scaleY: node.scaleY()
          });
        }}
        onClick={(e) => { if (isEditing) e.cancelBubble = true; }}
        onTap={(e) => { if (isEditing) e.cancelBubble = true; }}
      />
      {isEditing && (
        <Transformer 
          ref={trRef} 
          boundBoxFunc={(oldBox, newBox) => {
            if (newBox.width < 50 || newBox.height < 50) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </>
  );
}

const getElementColors = (type: string) => {
  switch (type) {
    case 'desk_bench': return { fill: 'rgba(92, 102, 112, 0.85)', stroke: '#3A444C', text: '#fff' };
    case 'desk_individual': return { fill: 'rgba(107, 142, 35, 0.85)', stroke: '#4B621B', text: '#fff' };
    case 'desk_operative': return { fill: 'rgba(70, 130, 180, 0.85)', stroke: '#2A5C84', text: '#fff' };
    case 'desk_executive': return { fill: 'rgba(128, 0, 0, 0.85)', stroke: '#500000', text: '#fff' };
    case 'meeting_room': return { fill: 'rgba(168, 159, 145, 0.6)', stroke: '#A89F91', text: 'white' };
    case 'private_office': return { fill: 'rgba(210, 180, 140, 0.7)', stroke: '#8B6508', text: '#fff' };
    case 'lounge': return { fill: 'rgba(210, 105, 30, 0.7)', stroke: '#A0522D', text: 'white' };
    case 'dining': return { fill: 'rgba(143, 188, 143, 0.7)', stroke: '#2E8B57', text: '#fff' };
    case 'reception': return { fill: 'rgba(100, 149, 237, 0.7)', stroke: '#4169E1', text: '#fff' };
    case 'archive': return { fill: 'rgba(112, 128, 144, 0.8)', stroke: '#2F4F4F', text: 'white' };
    case 'site': return { fill: 'rgba(47, 79, 79, 0.85)', stroke: '#000', text: 'white' };
    default: return { fill: 'rgba(222, 217, 210, 0.8)', stroke: '#C7C2B9', text: '#5A5A40' };
  }
};

export function Canvas() {
  const { backgroundImage, backgroundPos, backgroundScale, isEditingBackground, setBackgroundPos, setBackgroundScale, versions, activeVersionId, updateElementPosition, updateElementSize, removeElement, language, placementMode, addElement, setPlacementMode, setIsEditingBackground } = useWorkspaceStore();
  const dict = t[language];
  const activeVersion = versions.find(v => v.id === activeVersionId);
  const elements = activeVersion?.elements || [];

  const containerRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState({ width: 800, height: 600 });
  const [capacityPrompt, setCapacityPrompt] = useState<{id: string, type: string} | null>(null);
  
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const elementRefs = useRef<{ [key: string]: any }>({});
  const transformerRef = useRef<any>(null);

  useEffect(() => {
    if (selectedId && transformerRef.current && elementRefs.current[selectedId]) {
      transformerRef.current.nodes([elementRefs.current[selectedId]]);
      transformerRef.current.getLayer().batchDraw();
    }
  }, [selectedId, elements]);

  useEffect(() => {
    if (placementMode) {
      setSelectedId(null);
    }
  }, [placementMode]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && placementMode) {
        setPlacementMode(null);
      } else if ((e.key === 'Delete' || e.key === 'Backspace') && selectedId) {
        // Prevent deleting if user is typing in an input field (like capacity)
        if (document.activeElement?.tagName === 'INPUT') return;
        removeElement(selectedId);
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedId, removeElement, placementMode, setPlacementMode]);

  useEffect(() => {
    const updateSize = () => {
      if (containerRef.current) {
        setSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    updateSize();
    requestAnimationFrame(updateSize);
    
    window.addEventListener('resize', updateSize);
    return () => window.removeEventListener('resize', updateSize);
  }, [backgroundImage, activeVersionId]);

  const handleStageClick = (e: any) => {
    if (placementMode) {
      // Get relative position
      const stage = e.target.getStage();
      const pointerPosition = stage.getPointerPosition();
      
      if (pointerPosition) {
        // Adjust to center the element roughly based on expected size
        const id = addElement(placementMode, pointerPosition.x - 30, pointerPosition.y - 30);
        
        if (placementMode === 'meeting_room' || placementMode === 'archive' || placementMode === 'desk_bench' || placementMode === 'desk_individual') {
          setCapacityPrompt({ id, type: placementMode });
          setPlacementMode(null);
        }
      }
    } else {
      const clickedOnEmpty = e.target === e.target.getStage();
      const clickedOnBackground = e.target.name() === 'background-rect' || e.target.name() === 'background-image';
      if (clickedOnEmpty || clickedOnBackground) {
        setSelectedId(null);
      }
    }
  };

  return (
    <div 
      className="flex-1 w-full bg-[#F1EFEC] relative overflow-hidden flex flex-col items-center justify-center p-6" 
      ref={containerRef}
      id="workspace-canvas"
    >
      <div 
        className="absolute inset-0 pointer-events-none"
        style={{ backgroundImage: 'radial-gradient(#E5E2DD 1px, transparent 1px)', backgroundSize: '20px 20px' }}
      />
      
      <div className="absolute top-6 left-1/2 -translate-x-1/2 bg-white/90 backdrop-blur-sm border border-[#E5E2DD] rounded-full px-4 py-2 flex items-center gap-6 shadow-sm z-10 pointer-events-none">
        <span className="flex items-center gap-2 text-xs font-bold text-[#A89F91]">
          {dict.canvas.holdShift}
        </span>
      </div>

      {placementMode && (
        <div className="absolute top-6 right-6 bg-[#2D2A26] text-white rounded-lg px-4 py-3 flex items-center gap-3 shadow-xl z-20 cursor-pointer pointer-events-auto hover:bg-[#1a1816] transition-colors" onClick={() => setPlacementMode(null)}>
          <span className="text-xs font-semibold">{dict.clickToPlace}</span>
          <span className="text-[10px] opacity-75 hover:opacity-100 uppercase tracking-widest border-l border-white/20 pl-3">{dict.cancelPlacement}</span>
        </div>
      )}

      {capacityPrompt && (
        <div className="absolute inset-0 bg-black/20 flex items-center justify-center z-50 pointer-events-auto backdrop-blur-[2px]">
          <div className="bg-white p-6 rounded-xl shadow-2xl w-80 animate-in fade-in zoom-in-95 duration-200">
            <h4 className="font-bold text-lg mb-2 text-gray-900">
              {capacityPrompt.type === 'meeting_room' ? 'Capacidad de la Sala' : 
               (capacityPrompt.type === 'desk_bench' || capacityPrompt.type === 'desk_individual') ? 'Capacidad de la Estación' : 'Cantidad de Mobiliario'}
            </h4>
            <p className="text-sm text-gray-500 mb-4">
              {capacityPrompt.type === 'meeting_room' ? 'Ingresa los asientos en la sala' : 
               (capacityPrompt.type === 'desk_bench' || capacityPrompt.type === 'desk_individual') ? 'Ingresa el número de usuarios' : 'Ingresa la cantidad de unidades para archivo'}
            </p>
            <input 
              type="number" 
              autoFocus
              min="1"
              className="w-full border border-[#E5E2DD] rounded-lg p-2 mb-4 focus:ring-2 focus:ring-[#5A5A40] focus:border-transparent outline-none"
              id="capacityInput"
              defaultValue={capacityPrompt.type === 'meeting_room' ? 8 : (capacityPrompt.type === 'desk_bench' ? 2 : 1)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  const val = parseInt((e.target as HTMLInputElement).value, 10);
                  if (!isNaN(val) && val > 0) {
                    useWorkspaceStore.getState().updateElementCapacity(capacityPrompt.id, val);
                    setCapacityPrompt(null);
                  }
                }
              }}
            />
            <div className="flex justify-end gap-2">
              <button 
                className="px-4 py-2 text-sm text-gray-600 hover:bg-[#F8F7F4] rounded-lg transition-colors font-medium"
                onClick={() => {
                  useWorkspaceStore.getState().removeElement(capacityPrompt.id);
                  setCapacityPrompt(null);
                }}
              >
                Cancelar
              </button>
              <button 
                className="px-4 py-2 bg-[#5A5A40] hover:bg-[#43432e] text-white text-sm rounded-lg transition-colors font-medium shadow-sm"
                onClick={() => {
                  const val = parseInt((document.getElementById('capacityInput') as HTMLInputElement).value, 10);
                  if (!isNaN(val) && val > 0) {
                    useWorkspaceStore.getState().updateElementCapacity(capacityPrompt.id, val);
                    setCapacityPrompt(null);
                  }
                }}
              >
                Guardar
              </button>
            </div>
          </div>
        </div>
      )}

      <div className={`relative border border-[#E5E2DD] bg-white shadow-2xl rounded max-w-full max-h-full overflow-hidden ${placementMode ? 'cursor-crosshair' : 'cursor-default'}`} style={{ width: size.width, height: size.height }}>
        <Stage width={size.width} height={size.height} onClick={handleStageClick}>
          <Layer>
            {/* Background Rect to catch clicks if no image */}
            <Rect width={size.width} height={size.height} fill="transparent" />
            
            {backgroundImage && (
              <BackgroundImage 
                src={backgroundImage} 
                isEditing={isEditingBackground}
                pos={backgroundPos}
                scale={backgroundScale}
                onTransformEnd={(transform: any) => {
                  setBackgroundPos({ x: transform.x, y: transform.y });
                  setBackgroundScale({ x: transform.scaleX, y: transform.scaleY });
                }}
              />
            )}
            
            {elements.map((el) => {
              const label = dict.elements[el.type]?.label || '';
              const colors = getElementColors(el.type);
              
              const strokeWidth = el.type === 'meeting_room' ? 2 : 1;

              return (
                <Group
                  key={el.id}
                  name={`element-${el.id}`}
                  ref={(node) => { elementRefs.current[el.id] = node; }}
                  x={el.x}
                  y={el.y}
                  width={el.width}
                  height={el.height}
                  draggable={!placementMode && !isEditingBackground}
                  onDragStart={(e) => {
                    if (!isEditingBackground && !placementMode) {
                      setSelectedId(el.id);
                    }
                  }}
                  onDragEnd={(e) => {
                    if (!isEditingBackground && !placementMode) {
                      updateElementPosition(el.id, e.target.x(), e.target.y());
                    }
                  }}
                  onTransformEnd={(e) => {
                    const node = elementRefs.current[el.id];
                    const scaleX = node.scaleX();
                    const scaleY = node.scaleY();

                    node.scaleX(1);
                    node.scaleY(1);

                    const newWidth = Math.max(10, node.width() * scaleX);
                    const newHeight = Math.max(10, node.height() * scaleY);
                    
                    updateElementSize(el.id, newWidth, newHeight);
                    updateElementPosition(el.id, node.x(), node.y());
                  }}
                  onClick={(e) => {
                    if (!placementMode && !isEditingBackground) {
                      e.cancelBubble = true;
                      setSelectedId(el.id);
                    }
                  }}
                  onTap={(e) => {
                    if (!placementMode && !isEditingBackground) {
                      e.cancelBubble = true;
                      setSelectedId(el.id);
                    }
                  }}
                >
                  <Rect
                    width={el.width}
                    height={el.height}
                    fill={colors.fill}
                    stroke={colors.stroke}
                    strokeWidth={strokeWidth}
                    cornerRadius={4}
                  />
                  {label && (
                    <Text
                      text={`${label}\n${el.capacity ? `(${el.capacity})` : ''}`}
                      width={el.width}
                      height={el.height}
                      align="center"
                      verticalAlign="middle"
                      fill={colors.text}
                      fontSize={8}
                      fontFamily="Inter, sans-serif"
                      fontStyle="bold"
                    />
                  )}
                </Group>
              );
            })}
            
            {selectedId && !placementMode && !isEditingBackground && (
              <Transformer 
                ref={transformerRef}
                ignoreStroke={true}
                boundBoxFunc={(oldBox, newBox) => {
                  if (newBox.width < 10 || newBox.height < 10) {
                    return oldBox;
                  }
                  return newBox;
                }}
              />
            )}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
