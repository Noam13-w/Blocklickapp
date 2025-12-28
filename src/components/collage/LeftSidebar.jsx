import React, { useState } from 'react';
import { Layout, Image as ImageIcon, Type, Sticker, Layers, Square, Circle, Star, GripVertical, Trash2 } from 'lucide-react';
import { useCollageStore } from '@/components/collage/store';
import { ScrollArea } from "@/components/ui/scroll-area";
import toast from 'react-hot-toast';

const TOOLS = [
  { id: 'templates', icon: Layout, label: 'Templates' },
  { id: 'uploads', icon: ImageIcon, label: 'Uploads' },
  { id: 'text', icon: Type, label: 'Text' },
  { id: 'elements', icon: Sticker, label: 'Elements' },
  { id: 'layers', icon: Layers, label: 'Layers' },
];

export default function LeftSidebar() {
  const [activeTab, setActiveTab] = useState('uploads');
  const { addObject, setObjects, objects, selectObject, deleteObject, selectedId } = useCollageStore();

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Basic validation
      if (!file.type.startsWith('image/')) {
        toast.error("Please upload an image file");
        return;
      }
      
      const reader = new FileReader();
      reader.onload = () => {
        addObject({
            id: Date.now().toString() + Math.random().toString().slice(2, 6),
            type: 'image',
            src: reader.result,
            x: 100,
            y: 100,
            width: 300,
            height: 300,
            rotation: 0,
            scaleX: 1,
            scaleY: 1,
        });
        toast.success("Image added");
      };
      reader.readAsDataURL(file);
      // Reset input value to allow uploading same file again
      e.target.value = '';
    }
  };

  const addText = () => {
    addObject({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        type: 'text',
        text: 'Double click to edit',
        fontSize: 40,
        fontFamily: 'Arial',
        fill: 'black',
        x: 100,
        y: 100,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
    });
    toast.success("Text added");
  };

  const addShape = (subtype) => {
    addObject({
        id: Date.now().toString() + Math.random().toString().slice(2, 6),
        type: 'shape',
        subtype: subtype,
        fill: '#3b82f6',
        width: 100,
        height: 100,
        radius: 50, // for circle
        x: 150,
        y: 150,
        rotation: 0,
        scaleX: 1,
        scaleY: 1,
    });
    toast.success("Shape added");
  };

  const loadTemplate = (templateId) => {
     // Predefined templates with safe images or simple shapes to avoid CORS issues initially
     const templates = {
         'grid-4': [
             { id: 't1', type: 'shape', subtype: 'rect', fill: '#e5e7eb', x: 0, y: 0, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
             { id: 't2', type: 'shape', subtype: 'rect', fill: '#d1d5db', x: 400, y: 0, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
             { id: 't3', type: 'shape', subtype: 'rect', fill: '#9ca3af', x: 0, y: 400, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
             { id: 't4', type: 'shape', subtype: 'rect', fill: '#6b7280', x: 400, y: 400, width: 400, height: 400, rotation: 0, scaleX: 1, scaleY: 1 },
         ],
         'banner-text': [
             { id: 'b1', type: 'shape', subtype: 'rect', fill: '#fcd34d', x: 0, y: 0, width: 800, height: 200, rotation: 0, scaleX: 1, scaleY: 1 },
             { id: 'b2', type: 'text', text: 'SUMMER SALE', fontSize: 60, fontFamily: 'Arial', fill: '#000', x: 50, y: 70, rotation: 0, scaleX: 1, scaleY: 1 },
         ]
     };

     if (templates[templateId]) {
         // Create unique IDs for template objects
         const newObjects = templates[templateId].map(obj => ({
             ...obj, 
             id: Date.now().toString() + Math.random().toString().slice(2, 8) 
         }));
         setObjects(newObjects);
         toast.success("Template loaded");
     }
  };

  return (
    <div className="flex h-full bg-[#252525] border-r border-[#333]">
      {/* Icons Rail */}
      <div className="w-16 flex flex-col items-center py-4 gap-4 border-r border-[#333] shrink-0">
        {TOOLS.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setActiveTab(tool.id)}
            className={`flex flex-col items-center justify-center w-full py-3 gap-1 transition-colors ${
              activeTab === tool.id ? 'text-indigo-400 bg-[#1a1a1a] border-l-2 border-indigo-400' : 'text-gray-400 hover:text-gray-200'
            }`}
          >
            <tool.icon className="w-6 h-6" />
            <span className="text-[10px]">{tool.label}</span>
          </button>
        ))}
      </div>

      {/* Drawer Content */}
      <div className="w-64 bg-[#2a2a2a] flex flex-col h-full">
          <ScrollArea className="flex-1 p-4">
            {activeTab === 'uploads' && (
            <div className="space-y-4">
                <h3 className="text-white font-medium mb-4">Upload Images</h3>
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-[#444] border-dashed rounded-lg cursor-pointer bg-[#333] hover:bg-[#3a3a3a] transition-colors relative">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <ImageIcon className="w-8 h-8 text-gray-400 mb-2" />
                        <p className="text-sm text-gray-400">Click to upload</p>
                    </div>
                    {/* Ensure input is clickable by z-index */}
                    <input 
                        type="file" 
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                        accept="image/*" 
                        onChange={handleImageUpload} 
                    />
                </label>
                <p className="text-xs text-gray-500 text-center">Supported: JPG, PNG, HEIC</p>
            </div>
            )}

            {activeTab === 'text' && (
                <div className="space-y-4">
                    <h3 className="text-white font-medium mb-4">Add Text</h3>
                    <button onClick={addText} className="w-full bg-[#333] text-white p-3 rounded hover:bg-[#444] text-left font-bold text-xl">Add Heading</button>
                    <button onClick={addText} className="w-full bg-[#333] text-white p-3 rounded hover:bg-[#444] text-left font-medium text-lg">Add Subheading</button>
                    <button onClick={addText} className="w-full bg-[#333] text-white p-3 rounded hover:bg-[#444] text-left text-sm">Add Body Text</button>
                </div>
            )}

            {activeTab === 'elements' && (
                <div className="space-y-4">
                    <h3 className="text-white font-medium mb-4">Shapes</h3>
                    <div className="grid grid-cols-3 gap-2">
                        <button onClick={() => addShape('rect')} className="aspect-square bg-[#333] rounded hover:bg-[#444] flex items-center justify-center text-white"><Square /></button>
                        <button onClick={() => addShape('circle')} className="aspect-square bg-[#333] rounded hover:bg-[#444] flex items-center justify-center text-white"><Circle /></button>
                        <button onClick={() => addShape('star')} className="aspect-square bg-[#333] rounded hover:bg-[#444] flex items-center justify-center text-white"><Star /></button>
                    </div>
                </div>
            )}

            {activeTab === 'templates' && (
                <div className="space-y-4">
                    <h3 className="text-white font-medium mb-4">Templates</h3>
                    <div className="space-y-2">
                        <button onClick={() => loadTemplate('grid-4')} className="w-full aspect-video bg-[#333] hover:bg-[#444] rounded flex items-center justify-center text-gray-400 text-xs border border-[#444]">
                            <div className="grid grid-cols-2 gap-1 w-1/2 aspect-square">
                                <div className="bg-gray-600"></div><div className="bg-gray-600"></div>
                                <div className="bg-gray-600"></div><div className="bg-gray-600"></div>
                            </div>
                        </button>
                        <button onClick={() => loadTemplate('banner-text')} className="w-full aspect-video bg-[#333] hover:bg-[#444] rounded flex items-center justify-center text-gray-400 text-xs border border-[#444]">
                            <div className="flex flex-col gap-1 w-3/4">
                                <div className="h-4 bg-yellow-600 w-full"></div>
                                <div className="h-2 bg-gray-600 w-1/2 mx-auto"></div>
                            </div>
                        </button>
                    </div>
                </div>
            )}

            {activeTab === 'layers' && (
                <div className="space-y-2">
                    <h3 className="text-white font-medium mb-4">Layers</h3>
                    {[...objects].reverse().map((obj, i) => (
                        <div 
                            key={obj.id}
                            onClick={() => selectObject(obj.id)}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer ${obj.id === selectedId ? 'bg-indigo-900/50 border border-indigo-500' : 'bg-[#333] hover:bg-[#444]'}`}
                        >
                            <GripVertical className="w-4 h-4 text-gray-500" />
                            <div className="flex-1 truncate text-xs text-white">
                                {obj.type === 'image' && 'Image Layer'}
                                {obj.type === 'text' && (obj.text || 'Text Layer')}
                                {obj.type === 'shape' && `${obj.subtype} Shape`}
                            </div>
                            <button 
                                onClick={(e) => { e.stopPropagation(); deleteObject(obj.id); }}
                                className="text-gray-500 hover:text-red-400"
                            >
                                <Trash2 className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                    {objects.length === 0 && <div className="text-gray-500 text-xs text-center py-4">No layers</div>}
                </div>
            )}
        </ScrollArea>
      </div>
    </div>
  );
}