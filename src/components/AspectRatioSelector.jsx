import React from 'react';
import { motion } from 'framer-motion';
import { Square, RectangleHorizontal, Monitor, RotateCw } from 'lucide-react';
import { Button } from '@/components/ui/button';

const aspectRatios = [
  {
    id: 'square',
    name: 'ריבוע',
    ratio: '1:1',
    icon: Square,
    description: 'מושלם לפוסטים ברשתות חברתיות'
  },
  {
    id: '3:2',
    name: '3:2',
    ratio: '3:2',
    icon: RectangleHorizontal,
    description: 'יחס קלאסי לצילום'
  },
  {
    id: '4:3',
    name: '4:3', 
    ratio: '4:3',
    icon: Monitor,
    description: 'יחס מסורתי לдфוס'
  }
];

export default function AspectRatioSelector({ selectedRatio, selectedOrientation, onRatioSelect, onOrientationSelect }) {
  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">בחר יחס בלוק</h3>
        <p className="text-slate-500">איך התמונה שלך תיראה לאחר החיתוך</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {aspectRatios.map((ratio, index) => {
          const Icon = ratio.icon;
          const isSelected = selectedRatio === ratio.id;
          
          return (
            <motion.div
              key={ratio.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => onRatioSelect(ratio.id)}
                className={`w-full p-6 rounded-2xl border-2 transition-all duration-300 text-right ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 shadow-lg ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    <Icon className={`h-6 w-6 ${
                      isSelected ? 'text-amber-600' : 'text-slate-600'
                    }`} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`text-lg font-semibold ${
                      isSelected ? 'text-amber-800' : 'text-slate-800'
                    }`}>
                      {ratio.name}
                    </h4>
                    <p className={`text-sm font-mono ${
                      isSelected ? 'text-amber-600' : 'text-slate-500'
                    }`}>
                      {ratio.ratio}
                    </p>
                    <p className={`text-xs leading-relaxed ${
                      isSelected ? 'text-amber-700' : 'text-slate-400'
                    }`}>
                      {ratio.description}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>

      {selectedRatio && selectedRatio !== 'square' && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center space-y-4"
        >
          <h4 className="text-lg font-semibold text-slate-800">בחר כיוון</h4>
          <div className="flex justify-center gap-4">
            <Button
              onClick={() => onOrientationSelect('portrait')}
              variant={selectedOrientation === 'portrait' ? 'default' : 'outline'}
              className="flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <RectangleHorizontal className="h-5 w-5 rotate-90" />
              <span>לאורך</span>
            </Button>
            <Button
              onClick={() => onOrientationSelect('landscape')}
              variant={selectedOrientation === 'landscape' ? 'default' : 'outline'}
              className="flex items-center gap-2 px-6 py-3 rounded-xl"
            >
              <RectangleHorizontal className="h-5 w-5" />
              <span>לרוחב</span>
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
}