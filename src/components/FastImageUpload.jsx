import React, { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Upload, X, Plus, Minus, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const FastImageUpload = ({ 
  onImagesChange, 
  selectedImages = [], 
  maxFiles = 20,
  productType = 'block' 
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processFiles = useCallback(async (files) => {
    if (isProcessing) return;
    
    setIsProcessing(true);
    setUploadError('');
    
    try {
      const fileArray = Array.from(files).filter(file => 
        file.type.startsWith('image/') || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif')
      );

      if (fileArray.length === 0) {
        setUploadError('לא נבחרו קבצי תמונה תקינים');
        return;
      }

      if (selectedImages.length + fileArray.length > maxFiles) {
        setUploadError(`ניתן לבחור עד ${maxFiles} תמונות`);
        return;
      }

      const newImages = fileArray.map(file => ({
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        file: file, // שימוש בקובץ המקורי ללא עיבוד
        url: URL.createObjectURL(file),
        name: file.name,
        quantity: 1,
        size: file.size
      }));

      if (newImages.length > 0) {
        onImagesChange([...selectedImages, ...newImages]);
      }
      
    } catch (error) {
      console.error('Error processing files:', error);
      setUploadError('שגיאה בעיבוד הקבצים');
    } finally {
      setIsProcessing(false);
    }
  }, [selectedImages, maxFiles, onImagesChange, isProcessing]);

  const handleFileInput = useCallback((e) => {
    if (e.target.files?.length) {
      processFiles(e.target.files);
      e.target.value = '';
    }
  }, [processFiles]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
    
    if (e.dataTransfer.files?.length) {
      processFiles(e.dataTransfer.files);
    }
  }, [processFiles]);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    if (!isDragging) setIsDragging(true);
  }, [isDragging]);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    if (e.currentTarget.contains(e.relatedTarget)) return;
    setIsDragging(false);
  }, []);

  const removeImage = useCallback((imageToRemove) => {
    URL.revokeObjectURL(imageToRemove.url);
    const updatedImages = selectedImages.filter(img => img.id !== imageToRemove.id);
    onImagesChange(updatedImages);
  }, [selectedImages, onImagesChange]);

  const updateQuantity = useCallback((imageId, change) => {
    const updatedImages = selectedImages.map(img => 
      img.id === imageId 
        ? { ...img, quantity: Math.max(1, Math.min(99, img.quantity + change)) }
        : img
    );
    onImagesChange(updatedImages);
  }, [selectedImages, onImagesChange]);

  const totalImages = selectedImages.reduce((sum, img) => sum + img.quantity, 0);
  const canAddMore = selectedImages.length < maxFiles && !isProcessing;

  return (
    <div className="space-y-6">
      {/* Upload Area */}
      {canAddMore && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className={`border-2 border-dashed rounded-2xl p-8 text-center transition-all duration-300 cursor-pointer ${
            isDragging 
              ? 'border-blue-400 bg-blue-50' 
              : 'border-slate-300 hover:border-slate-400 hover:bg-slate-50'
          } ${isProcessing ? 'opacity-50 pointer-events-none' : ''}`}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
        >
          <Upload className={`h-12 w-12 mx-auto mb-4 transition-colors ${
            isDragging ? 'text-blue-500' : 'text-slate-400'
          }`} />
          
          <h4 className="text-lg font-bold text-slate-800 mb-2">
            {isProcessing ? 'מוסיף תמונות...' : isDragging ? 'שחרר כאן' : 'גרור תמונות או לחץ לבחירה'}
          </h4>
          
          <p className="text-slate-600 mb-4">
            JPG, PNG, HEIC (אייפון) • עד {maxFiles} תמונות • איכות מקורית
          </p>
          
          <input
            type="file"
            multiple
            accept="image/jpeg,image/jpg,image/png,image/heic,image/heif,.heic,.heif"
            onChange={handleFileInput}
            className="hidden"
            id="fast-image-upload"
            disabled={isProcessing}
          />
          
          <label htmlFor="fast-image-upload">
            <Button asChild className="cursor-pointer" disabled={isProcessing}>
              <span>בחר תמונות ({selectedImages.length}/{maxFiles})</span>
            </Button>
          </label>
        </motion.div>
      )}

      {/* Error Display */}
      {uploadError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{uploadError}</AlertDescription>
        </Alert>
      )}

      {/* Images Grid */}
      {selectedImages.length > 0 && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
          className="space-y-4"
        >
          <h4 className="text-lg font-semibold text-slate-800">
            תמונות שנבחרו ({totalImages} יחידות)
          </h4>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {selectedImages.map((image) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                className="relative group bg-white rounded-xl shadow-md overflow-hidden border-2 border-slate-100 hover:border-slate-300 transition-all duration-200"
              >
                {/* Image Preview */}
                <div className="aspect-square bg-slate-100 flex items-center justify-center overflow-hidden">
                  <img
                    src={image.url}
                    alt={image.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      console.error('Image failed to load:', image.name);
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="hidden w-full h-full items-center justify-center text-slate-500">
                    <AlertCircle className="h-8 w-8" />
                  </div>
                </div>
                
                {/* Remove Button */}
                <Button
                  onClick={() => removeImage(image)}
                  size="sm"
                  variant="destructive"
                  className="absolute top-2 right-2 h-6 w-6 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="h-3 w-3" />
                </Button>
                
                {/* Quantity Controls */}
                <div className="p-3 bg-white">
                  <p className="text-xs text-slate-600 truncate mb-2">{image.name}</p>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-500">כמות:</span>
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => updateQuantity(image.id, -1)}
                        disabled={image.quantity <= 1}
                      >
                        <Minus className="h-3 w-3" />
                      </Button>
                      <span className="text-sm font-medium min-w-[2rem] text-center">
                        {image.quantity}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 w-6 p-0 rounded-full"
                        onClick={() => updateQuantity(image.id, 1)}
                        disabled={image.quantity >= 99}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default React.memo(FastImageUpload);