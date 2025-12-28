import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { RectangleHorizontal, Square } from 'lucide-react';

export default function OrientationSelector({ selectedOrientation, onOrientationSelect, canRotate, selectedSize, productType = 'block' }) {
  // לא מציג בחירת כיוון למוצרים ריבועיים
  if (!canRotate || selectedSize === '10x10') return null;

  const getProductText = () => {
    switch (productType) {
      case 'magnet': return 'המגנט';
      case 'photo': return 'התמונה';
      default: return 'הבלוק';
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <div className="space-y-2">
        <h4 className="text-xl font-semibold text-slate-800">בחר כיוון {getProductText()}</h4>
        <p className="text-slate-500">איך תרצה ש{getProductText()} יהיה מכוון?</p>
        <p className="text-sm text-slate-400">גודל שנבחר: {selectedSize}</p>
      </div>
      
      <div className="flex justify-center gap-6">
        <Button
          onClick={() => onOrientationSelect('portrait')}
          variant={selectedOrientation === 'portrait' ? 'default' : 'outline'}
          className="flex flex-col items-center gap-3 px-8 py-6 h-auto rounded-xl"
        >
          <RectangleHorizontal className="h-8 w-8 rotate-90" />
          <div className="text-center">
            <div className="text-sm font-medium">לאורך</div>
            <div className="text-xs text-muted-foreground">
              {selectedSize === '10x15' ? '10×15' : selectedSize === '20x15' ? '15×20' : selectedSize === '13x18' ? '13×18' : '10×10'}
            </div>
          </div>
        </Button>
        <Button
          onClick={() => onOrientationSelect('landscape')}
          variant={selectedOrientation === 'landscape' ? 'default' : 'outline'}
          className="flex flex-col items-center gap-3 px-8 py-6 h-auto rounded-xl"
        >
          <RectangleHorizontal className="h-8 w-8" />
          <div className="text-center">
            <div className="text-sm font-medium">לרוחב</div>
            <div className="text-xs text-muted-foreground">
              {selectedSize === '10x15' ? '15×10' : selectedSize === '20x15' ? '20×15' : selectedSize === '13x18' ? '18×13' : '10×10'}
            </div>
          </div>
        </Button>
      </div>
    </motion.div>
  );
}