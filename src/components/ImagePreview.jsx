import React, { useState, useRef, useEffect, forwardRef, useImperativeHandle } from 'react';
import { motion } from 'framer-motion';
import { Plus, Minus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const ImagePreview = forwardRef(({ image, size, orientation = 'portrait', ratio, quantity, onQuantityChange, productType = 'block' }, ref) => {
  if (!image) {
    return <div className="text-center p-8 text-slate-500">אין תמונה לתצוגה</div>;
  }

  // יצוא התמונה המקורית
  useImperativeHandle(ref, () => ({
    getCroppedBlob: () => {
      return new Promise((resolve) => {
        if (!image?.file) {
          resolve(null);
          return;
        }
        resolve(image.file);
      });
    },
    getCroppedDataURL: () => image?.url || null
  }));

  const getProductName = () => {
    if (productType === 'magnet') return 'מגנט';
    if (productType === 'photo') return 'תמונה';
    return 'בלוק עץ';
  };

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }} 
      animate={{ opacity: 1, scale: 1 }} 
      className="space-y-6"
    >
      {/* כותרת */}
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">תצוגה מקדימה</h3>
        <p className="text-slate-500">
          {getProductName()} - {size}
        </p>
      </div>

      {/* תצוגת התמונה */}
      <div className="flex justify-center">
        <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 shadow-2xl">
          <div className="bg-white rounded-2xl p-4 border-2 border-amber-400">
            <img
              src={image.url}
              alt={image.name}
              className="max-w-full max-h-80 rounded-lg object-contain"
            />
          </div>
        </div>
      </div>

      {/* הודעה על חיתוך */}
      <div className="text-center bg-blue-50 border border-blue-200 rounded-xl p-4">
        <p className="text-blue-800 font-medium">
          ℹ️ התמונה תחתך ותותאם בהתאם לגודל המוצר המוזמן
        </p>
      </div>

      {/* בקרת כמות */}
      {onQuantityChange && quantity !== undefined && (
        <div className="flex justify-center items-center gap-4 bg-white rounded-2xl p-4 shadow-lg max-w-sm mx-auto">
          <Label className="text-slate-700 font-medium">כמות:</Label>
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8" 
              onClick={() => onQuantityChange(Math.max(1, quantity - 1))}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <Input 
              type="number" 
              min="1" 
              value={quantity} 
              onChange={(e) => onQuantityChange(parseInt(e.target.value) || 1)} 
              className="w-16 text-center rounded-xl" 
            />
            <Button 
              variant="outline" 
              size="icon" 
              className="rounded-full h-8 w-8" 
              onClick={() => onQuantityChange(quantity + 1)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
});

export default ImagePreview;