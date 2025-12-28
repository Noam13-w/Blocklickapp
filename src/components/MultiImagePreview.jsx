import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { X, Edit, Check, RotateCcw } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import ImagePreview from './ImagePreview';

export default function MultiImagePreview({ 
  images, 
  size, 
  orientation, 
  ratio, 
  price, 
  onRemoveImage, 
  onImageUpdate 
}) {
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingImage, setEditingImage] = useState(null);

  const handleEditImage = (index) => {
    setEditingIndex(index);
    setEditingImage(images[index]);
  };

  const handleSaveEdit = async (croppedBlob, croppedPreview) => {
    if (editingIndex !== null && croppedBlob) {
      const updatedImage = {
        ...editingImage,
        croppedBlob,
        croppedPreview
      };
      
      onImageUpdate(editingIndex, updatedImage);
      setEditingIndex(null);
      setEditingImage(null);
    }
  };

  const getSizeDisplay = () => {
    if (size === '10x15') return orientation === 'portrait' ? '10×15 ס"מ (לאורך)' : '15×10 ס"מ (לרוחב)';
    if (size === '15x20') return orientation === 'portrait' ? '15×20 ס"מ (לאורך)' : '20×15 ס"מ (לרוחב)';
    return size;
  };

  const totalPrice = images.length * price;

  return (
    <div className="space-y-8">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">תצוגה מקדימה</h3>
        <p className="text-slate-600">
          {images.length} תמונות בגודל {getSizeDisplay()}
        </p>
        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 max-w-md mx-auto">
          <p className="text-amber-800 font-bold text-lg">
            סה"כ: ₪{totalPrice.toFixed(2)} ({images.length} × ₪{price})
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <AnimatePresence>
          {images.map((image, index) => (
            <motion.div
              key={image.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200 group"
            >
              {/* Image Display */}
              <div className="relative aspect-[3/4] bg-slate-100">
                <img
                  src={image.croppedPreview || image.preview}
                  alt={`תמונה ${index + 1}`}
                  className="w-full h-full object-cover"
                />
                
                {/* Action Buttons Overlay */}
                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-2">
                  <Button
                    onClick={() => handleEditImage(index)}
                    size="sm"
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-full"
                  >
                    <Edit className="h-4 w-4 mr-1" />
                    חתוך
                  </Button>
                  <Button
                    onClick={() => onRemoveImage(index)}
                    size="sm"
                    variant="destructive"
                    className="bg-red-600 hover:bg-red-700 rounded-full"
                  >
                    <X className="h-4 w-4 mr-1" />
                    הסר
                  </Button>
                </div>
              </div>

              {/* Image Info */}
              <div className="p-4">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600">תמונה {index + 1}</span>
                  <span className="font-bold text-slate-800">₪{price}</span>
                </div>
                {image.croppedPreview && (
                  <div className="flex items-center gap-1 mt-2">
                    <Check className="h-4 w-4 text-green-600" />
                    <span className="text-xs text-green-600">נחתכה</span>
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Edit Dialog */}
      <Dialog open={editingIndex !== null} onOpenChange={() => setEditingIndex(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle>חיתוך תמונה {editingIndex !== null ? editingIndex + 1 : ''}</DialogTitle>
          </DialogHeader>
          
          {editingImage && (
            <div className="space-y-6">
              <ImageCropEditor
                image={editingImage}
                size={size}
                orientation={orientation}
                ratio={ratio}
                onSave={handleSaveEdit}
                onCancel={() => setEditingIndex(null)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Internal component for image cropping
function ImageCropEditor({ image, size, orientation, ratio, onSave, onCancel }) {
  const [cropMode, setCropMode] = useState(false);
  const [processedImage, setProcessedImage] = useState(null);
  const [originalImage, setOriginalImage] = useState(null);
  const imagePreviewRef = React.useRef(null);

  React.useEffect(() => {
    if (image?.preview) {
      const img = new Image();
      img.onload = () => {
        setOriginalImage(img);
        setProcessedImage(img);
      };
      img.src = image.preview;
    }
  }, [image?.preview]);

  const handleSaveCrop = async () => {
    if (!imagePreviewRef.current) return;
    
    try {
      const croppedBlob = await imagePreviewRef.current.getCroppedBlob();
      if (croppedBlob) {
        const croppedPreview = URL.createObjectURL(croppedBlob);
        onSave(croppedBlob, croppedPreview);
      }
    } catch (error) {
      console.error('Error saving crop:', error);
    }
  };

  return (
    <div className="space-y-6">
      <ImagePreview
        ref={imagePreviewRef}
        image={image}
        size={size}
        orientation={orientation}
        ratio={ratio}
        quantity={1}
        onQuantityChange={() => {}}
        cropMode={cropMode}
        onCropModeChange={setCropMode}
      />
      
      <div className="flex justify-center gap-4">
        {!cropMode ? (
          <>
            <Button
              onClick={() => setCropMode(true)}
              className="bg-blue-600 hover:bg-blue-700"
            >
              התחל חיתוך
            </Button>
            <Button onClick={onCancel} variant="outline">
              ביטול
            </Button>
          </>
        ) : (
          <>
            <Button
              onClick={handleSaveCrop}
              className="bg-green-600 hover:bg-green-700"
            >
              <Check className="h-4 w-4 mr-2" />
              שמור חיתוך
            </Button>
            <Button
              onClick={() => setCropMode(false)}
              variant="outline"
            >
              ביטול חיתוך
            </Button>
          </>
        )}
      </div>
    </div>
  );
}