import React from 'react';
import { useCollageStore } from '@/components/collage/store';
import { Trash2, BringToFront, SendToBack, Type } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

export default function RightSidebar() {
  const { 
    objects, 
    selectedId, 
    updateObject, 
    deleteObject,
    bringToFront,
    sendToBack
  } = useCollageStore();

  const selectedObject = objects.find(o => o.id === selectedId);

  if (!selectedObject) {
    return (
        <div className="w-64 bg-[#252525] border-l border-[#333] p-4 text-gray-500 text-center text-sm pt-20">
            Select an element to edit properties
        </div>
    );
  }

  return (
    <div className="w-64 bg-[#252525] border-l border-[#333] flex flex-col h-full">
      <div className="p-4 border-b border-[#333]">
        <h3 className="text-white font-medium">Properties</h3>
        <p className="text-xs text-gray-500">{selectedObject.type} Layer</p>
      </div>

      <div className="p-4 space-y-6 overflow-y-auto flex-1">
        
        {/* Actions */}
        <div className="grid grid-cols-2 gap-2">
            <button 
                onClick={() => bringToFront(selectedId)}
                className="bg-[#333] hover:bg-[#444] text-white p-2 rounded flex items-center justify-center gap-2 text-xs"
                title="Bring to Front"
            >
                <BringToFront className="w-4 h-4" /> Front
            </button>
            <button 
                onClick={() => sendToBack(selectedId)}
                className="bg-[#333] hover:bg-[#444] text-white p-2 rounded flex items-center justify-center gap-2 text-xs"
                title="Send to Back"
            >
                <SendToBack className="w-4 h-4" /> Back
            </button>
        </div>

        {/* Text Properties */}
        {selectedObject.type === 'text' && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-400 text-xs">Content</Label>
                    <Input 
                        value={selectedObject.text} 
                        onChange={(e) => updateObject(selectedId, { text: e.target.value })}
                        className="bg-[#333] border-[#444] text-white"
                    />
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-400 text-xs">Font Size</Label>
                    <div className="flex items-center gap-2">
                        <Slider 
                            value={[selectedObject.fontSize]} 
                            min={10} 
                            max={200} 
                            step={1}
                            onValueChange={([val]) => updateObject(selectedId, { fontSize: val })}
                            className="flex-1"
                        />
                        <span className="text-white text-xs w-8">{selectedObject.fontSize}</span>
                    </div>
                </div>
                <div className="space-y-2">
                    <Label className="text-gray-400 text-xs">Color</Label>
                    <input 
                        type="color" 
                        value={selectedObject.fill}
                        onChange={(e) => updateObject(selectedId, { fill: e.target.value })}
                        className="w-full h-8 rounded bg-[#333] border border-[#444]"
                    />
                </div>
            </div>
        )}

        {/* Image Properties */}
        {selectedObject.type === 'image' && (
            <div className="space-y-4">
                 <div className="space-y-2">
                    <Label className="text-gray-400 text-xs">Opacity</Label>
                    <div className="flex items-center gap-2">
                        <Slider 
                            value={[(selectedObject.opacity ?? 1) * 100]} 
                            min={0} 
                            max={100} 
                            step={1}
                            onValueChange={([val]) => updateObject(selectedId, { opacity: val / 100 })}
                            className="flex-1"
                        />
                        <span className="text-white text-xs w-8">{Math.round((selectedObject.opacity ?? 1) * 100)}%</span>
                    </div>
                </div>
            </div>
        )}

        {/* Shape Properties */}
        {selectedObject.type === 'shape' && (
            <div className="space-y-4">
                <div className="space-y-2">
                    <Label className="text-gray-400 text-xs">Fill Color</Label>
                    <input 
                        type="color" 
                        value={selectedObject.fill}
                        onChange={(e) => updateObject(selectedId, { fill: e.target.value })}
                        className="w-full h-8 rounded bg-[#333] border border-[#444]"
                    />
                </div>
            </div>
        )}

        {/* Common Properties */}
        <div className="pt-4 border-t border-[#333]">
             <div className="grid grid-cols-2 gap-4 text-xs text-gray-400">
                <div>
                    <label>X</label>
                    <Input 
                        type="number"
                        value={Math.round(selectedObject.x)}
                        onChange={(e) => updateObject(selectedId, { x: Number(e.target.value) })}
                        className="bg-[#333] border-[#444] text-white h-7 mt-1"
                    />
                </div>
                <div>
                    <label>Y</label>
                    <Input 
                        type="number"
                        value={Math.round(selectedObject.y)}
                        onChange={(e) => updateObject(selectedId, { y: Number(e.target.value) })}
                        className="bg-[#333] border-[#444] text-white h-7 mt-1"
                    />
                </div>
             </div>
        </div>

      </div>

      <div className="p-4 border-t border-[#333]">
        <button 
            onClick={() => deleteObject(selectedId)}
            className="w-full bg-red-900/50 hover:bg-red-900/80 text-red-200 p-2 rounded flex items-center justify-center gap-2 text-sm transition-colors"
        >
            <Trash2 className="w-4 h-4" /> Delete Layer
        </button>
      </div>
    </div>
  );
}