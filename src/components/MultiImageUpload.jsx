import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Upload, X, Image as ImageIcon, RotateCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function MultiImageUpload({ onImagesSelect, selectedImages }) {
  const [isDragging, setIsDragging] = useState(false);

  const handleFiles = (files) => {
    const fileArray = Array.from(files).filter(file => file.type.startsWith('image/'));
    if (fileArray.length === 0) return;
    
    const newImages = fileArray.map(file => ({
      id: Date.now() + Math.random(),
      file,
      url: URL.createObjectURL(file),
      name: file.name
    }));
    
    const updatedImages = [...selectedImages, ...newImages];
    onImagesSelect(updatedImages);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    handleFiles(e.target.files);
    e.target.value = '';
  };

  const removeImage = (imageToRemove) => {
    URL.revokeObjectURL(imageToRemove.url);
    const updatedImages = selectedImages.filter(img => img.id !== imageToRemove.id);
    onImagesSelect(updatedImages);
  };

  return (
    <div className="space-y-6">
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">העלה תמונות</h3>
        <p className="text-slate-500">העלה מספר תמונות להדפסה</p>
      </div>

      {/* Upload Area */}
      <div
        className={`border-2 border-dashed rounded-2xl p-12 text-center transition-all duration-300 ${
          isDragging
            ? 'border-amber-400 bg-amber-50'
            : 'border-slate-300 hover:border-amber-300 hover:bg-slate-50'
        }`}
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
      >
        <Upload className="h-16 w-16 text-slate-400 mx-auto mb-4" />
        <h4 className="text-lg font-semibold text-slate-700 mb-2">
          גרור תמונות לכאן או לחץ לבחירה
        </h4>
        <p className="text-slate-500 mb-6">תמונות בפורמט JPG, PNG, WEBP</p>
        
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
          id="image-upload"
        />
        <label htmlFor="image-upload">
          <Button asChild className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 cursor-pointer">
            <span>בחר תמונות</span>
          </Button>
        </label>
      </div>

      {/* Selected Images */}
      {selectedImages.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-lg font-semibold text-slate-800">
            תמונות שנבחרו ({selectedImages.length})
          </h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-white rounded-xl shadow-lg overflow-hidden border border-slate-200"
              >
                <img
                  src={image.url}
                  alt={image.name}
                  className="w-full h-32 object-cover"
                />
                
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                  <Button
                    onClick={() => removeImage(image)}
                    size="sm"
                    variant="destructive"
                    className="h-8 w-8 p-0 rounded-full"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="p-3">
                  <p className="text-xs text-slate-600 truncate">{image.name}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}