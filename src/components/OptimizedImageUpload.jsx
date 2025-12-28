import React, { useState, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Upload, X, Plus, Minus, AlertCircle, Image as ImageIcon, Loader2, CheckCircle, CloudUpload } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

const OptimizedImageUpload = ({ 
  onImagesChange, 
  selectedImages = [], 
  maxFiles = 999,
  acceptedTypes = "image/jpeg,image/jpg,image/png,image/heic,image/heif,.heic,.heif",
  productType = 'block',
  selectedSize = '',
  aspectRatio = 1
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [editingQuantity, setEditingQuantity] = useState(null);

  const processFiles = useCallback(async (files) => {
    setUploadError('');
    
    const fileArray = Array.from(files);
    
    // בדיקת מגבלת קבצים
    if (selectedImages.length + fileArray.length > maxFiles) {
      setUploadError(`ניתן להעלות עד ${maxFiles} תמונות ${productType === 'bookmark' ? 'לסימניה' : ''}`);
      return;
    }
    
    const validFiles = [];
    const errors = [];

    for (const file of fileArray) {
      // בדיקת סוג קובץ בלבד - ללא עיבוד נוסף
      const isValidType = file.type.startsWith('image/') || 
                         file.name.toLowerCase().endsWith('.heic') || 
                         file.name.toLowerCase().endsWith('.heif') ||
                         file.name.toLowerCase().endsWith('.webp');

      if (!isValidType) {
        errors.push(`${file.name}: סוג קובץ לא נתמך`);
        continue;
      }

      validFiles.push(file);
    }

    if (errors.length > 0) {
      setUploadError(errors.join(', '));
    }

    if (validFiles.length > 0) {
      // יצירת תצוגה מקדימה מהירה יותר
      const newImages = validFiles.map((file) => {
        const isHEIC = file.name.toLowerCase().includes('.heic') || file.name.toLowerCase().includes('.heif');
        let previewUrl = null;

        // תצוגה מקדימה רק לקבצים לא-HEIC ועד גודל מסוים
        if (!isHEIC && file.size < 50 * 1024 * 1024) { // עד 50MB לתצוגה מקדימה
          previewUrl = URL.createObjectURL(file);
        }

        return {
          id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          file: file,
          url: previewUrl,
          name: file.name,
          quantity: 1,
          size: file.size,
          isHEIC: isHEIC,
          uploadProgress: 0,
          isUploading: false,
          isUploaded: false,
          uploadError: null
        };
      });

      onImagesChange([...selectedImages, ...newImages]);
    }
  }, [selectedImages, onImagesChange, maxFiles, productType]);

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
    if (imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
      URL.revokeObjectURL(imageToRemove.url);
    }
    const updatedImages = selectedImages.filter(img => img.id !== imageToRemove.id);
    onImagesChange(updatedImages);
  }, [selectedImages, onImagesChange]);

  const updateQuantity = useCallback((imageId, change) => {
    const updatedImages = selectedImages.map(img => 
      img.id === imageId 
        ? { ...img, quantity: Math.max(1, Math.min(999, img.quantity + change)) }
        : img
    );
    onImagesChange(updatedImages);
  }, [selectedImages, onImagesChange]);

  const setQuantityDirectly = useCallback((imageId, newQuantity) => {
    const quantity = parseInt(newQuantity) || 1;
    const validQuantity = Math.max(1, Math.min(999, quantity));
    
    const updatedImages = selectedImages.map(img => 
      img.id === imageId 
        ? { ...img, quantity: validQuantity }
        : img
    );
    onImagesChange(updatedImages);
    setEditingQuantity(null);
  }, [selectedImages, onImagesChange]);

  const handleQuantityInputKeyPress = useCallback((e, imageId, currentValue) => {
    if (e.key === 'Enter') {
      setQuantityDirectly(imageId, currentValue);
    } else if (e.key === 'Escape') {
      setEditingQuantity(null);
    }
  }, [setQuantityDirectly]);

  // Function to reset image state for retry
  const retryUpload = useCallback((imageToRetry) => {
    const updatedImages = selectedImages.map(img => 
      img.id === imageToRetry.id 
        ? { 
            ...img, 
            uploadError: null, 
            isUploading: false, // Set to false so parent sees it as "pending"
            uploadProgress: 0, 
            isUploaded: false 
          }
        : img
    );
    onImagesChange(updatedImages);
  }, [selectedImages, onImagesChange]);

  const totalImages = useMemo(() => {
    if (productType === 'bookmark') {
      // עבור סימניות - כל 2 תמונות = 1 סימניה
      return Math.floor(selectedImages.length / 2);
    }
    return selectedImages.reduce((sum, img) => sum + img.quantity, 0);
  }, [selectedImages, productType]);

  return (
    <div className="space-y-6">
      {/* Upload Area - Enhanced Design */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className={`relative border-2 border-dashed rounded-2xl p-8 md:p-10 text-center transition-all duration-300 cursor-pointer group ${
          isDragging 
            ? 'border-blue-400 bg-gradient-to-br from-blue-50 to-indigo-50 shadow-lg scale-105' 
            : 'border-slate-300 hover:border-blue-400 hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50 hover:shadow-md'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        whileHover={{ scale: 1.01 }}
        whileTap={{ scale: 0.99 }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-gradient-to-br from-transparent via-white/30 to-transparent rounded-2xl opacity-50 pointer-events-none"></div>
        
        <motion.div
          className={`relative z-10 ${isDragging ? 'scale-105' : ''} transition-transform duration-300`}
        >
          <motion.div
            className={`w-16 h-16 md:w-20 md:h-20 mx-auto mb-4 md:mb-6 rounded-full flex items-center justify-center transition-all duration-300 ${
              isDragging 
                ? 'bg-gradient-to-br from-blue-500 to-indigo-600 shadow-xl' 
                : 'bg-gradient-to-br from-slate-400 to-slate-500 group-hover:from-blue-500 group-hover:to-indigo-600 shadow-lg'
            }`}
            animate={isDragging ? { rotate: [0, 5, -5, 0] } : {}}
            transition={{ duration: 0.5, repeat: isDragging ? Infinity : 0 }}
          >
            <CloudUpload className="h-8 w-8 md:h-10 md:w-10 text-white" />
          </motion.div>
          
          <h4 className="text-xl md:text-2xl font-semibold text-slate-800 mb-2 md:mb-3">
            {isDragging ? 'שחרר את התמונות כאן!' : 'גרור תמונות או לחץ לבחירה'}
          </h4>
          
          <p className="text-base md:text-lg text-slate-600 mb-4 md:mb-6 font-light">
            JPG, PNG, HEIC • איכות מקורית
          </p>
          
          <input
            type="file"
            multiple
            accept={acceptedTypes}
            onChange={handleFileInput}
            className="hidden"
            id="image-upload-optimized"
          />
          
          <label htmlFor="image-upload-optimized">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-medium rounded-full shadow-lg hover:shadow-xl transition-all duration-300">
              <span className="cursor-pointer flex items-center gap-2 md:gap-3">
                <Upload className="h-4 w-4 md:h-5 md:w-5" />
                בחר תמונות ({selectedImages.length})
              </span>
            </Button>
          </label>
        </motion.div>
      </motion.div>

      {/* Error Display */}
      {uploadError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -10 }}
        >
          <Alert variant="destructive" className="rounded-xl border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">{uploadError}</AlertDescription>
          </Alert>
        </motion.div>
      )}

      {/* Images Grid - Enhanced Design */}
      <AnimatePresence>
        {selectedImages.length > 0 && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-4"
          >
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center"
            >
              <h4 className="text-xl md:text-2xl font-semibold text-slate-800">
                תמונות שנבחרו ({totalImages} יחידות)
                {productType === 'bookmark' && ` - נדרשות 2 תמונות לסימניה`}
              </h4>
            </motion.div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {selectedImages.map((image, index) => (
                <motion.div
                  key={image.id}
                  initial={{ opacity: 0, scale: 0.8, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.8, y: -20 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  whileHover={{ y: -4, scale: 1.02 }}
                  className="relative group bg-white rounded-xl shadow-md overflow-hidden border border-slate-100 hover:border-slate-300 hover:shadow-lg transition-all duration-300"
                >
                  {/* Image Preview */}
                  <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center relative overflow-hidden">
                    {image.url && !image.isHEIC ? (
                      <img
                        src={image.url}
                        alt={image.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          console.warn('Image display failed for:', image.name);
                          e.target.style.display = 'none';
                          const placeholder = e.target.parentNode.querySelector('.image-placeholder');
                          if (placeholder) {
                            placeholder.style.display = 'flex';
                          }
                        }}
                      />
                    ) : null}
                    
                    {/* Placeholder for HEIC or failed images */}
                    <div className={`image-placeholder ${image.url && !image.isHEIC ? 'hidden' : 'flex'} w-full h-full items-center justify-center text-slate-500 flex-col p-3`}>
                      <ImageIcon className="h-12 w-12 md:h-14 md:w-14 mb-2" />
                      <span className="text-xs md:text-sm text-center font-medium">
                        {image.isHEIC ? 'קובץ HEIC' : 'תמונה'}
                      </span>
                      <span className="text-xs text-center text-slate-400 mt-1 truncate w-full px-1">
                        {image.name}
                      </span>
                      {image.isHEIC && (
                        <div className="text-xs text-center text-orange-600 mt-1 leading-tight">
                          יודפס כרגיל
                        </div>
                      )}
                    </div>

                    {/* Upload Progress Overlay */}
                    {image.isUploading && (
                      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center p-4">
                        <div className="w-full max-w-[80%] space-y-2">
                          <div className="flex justify-between text-xs text-white font-medium">
                            <span>מעלה...</span>
                            <span className="animate-pulse">אנא המתן</span>
                          </div>
                          <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                            <motion.div
                              className="h-full bg-blue-500"
                              initial={false}
                              animate={{ width: `${Math.max(5, image.uploadProgress || 5)}%` }}
                              transition={{ duration: 0.2, ease: "linear" }}
                            />
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Success Indicator */}
                    {image.isUploaded && !image.uploadError && (
                      <div className="absolute top-2 left-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg">
                        <CheckCircle className="h-3 w-3 md:h-4 md:w-4" />
                      </div>
                    )}

                    {/* Error Indicator with Retry Button */}
                    {image.uploadError && (
                      <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                        <div className="text-white text-center p-2">
                          <X className="h-4 w-4 md:h-5 md:w-5 mx-auto mb-2 text-red-400" />
                          <span className="text-xs font-medium mb-2 block">שגיאה בהעלאה</span>
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              retryUpload(image);
                            }}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1 rounded-md"
                          >
                            נסה שנית
                          </Button>
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Remove Button */}
                  <motion.button
                    onClick={() => removeImage(image)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    className="absolute top-2 right-2 h-8 w-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 shadow-lg z-20"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                  
                  {/* Content */}
                  <div className="p-3 bg-white">
                    <p className="text-xs md:text-sm text-slate-600 truncate mb-2 font-medium">
                      {image.name}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs md:text-sm text-slate-500 font-medium">
                        {productType === 'bookmark' ? 'צד:' : 'כמות:'}
                      </span>
                      {productType === 'bookmark' ? (
                        <span className="text-sm md:text-base font-semibold text-slate-700">
                          {selectedImages.indexOf(image) + 1}
                        </span>
                      ) : (
                        <div className="flex items-center gap-1 md:gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 md:h-8 md:w-8 p-0 rounded-full hover:bg-red-50 hover:border-red-200"
                            onClick={() => updateQuantity(image.id, -1)}
                            disabled={image.quantity <= 1}
                          >
                            <Minus className="h-2 w-2 md:h-3 md:w-3" />
                          </Button>
                          
                          {editingQuantity === image.id ? (
                            <Input
                              type="number"
                              min="1"
                              max="999"
                              defaultValue={image.quantity}
                              className="w-12 h-6 md:w-16 md:h-8 text-center text-xs md:text-sm font-semibold border-blue-300 focus:border-blue-500"
                              autoFocus
                              onBlur={(e) => setQuantityDirectly(image.id, e.target.value)}
                              onKeyDown={(e) => handleQuantityInputKeyPress(e, image.id, e.target.value)}
                            />
                          ) : (
                            <button
                              onClick={() => setEditingQuantity(image.id)}
                              className="text-sm md:text-base font-semibold text-slate-700 min-w-[1.5rem] text-center hover:bg-blue-50 hover:text-blue-600 rounded px-2 py-1 transition-colors duration-200"
                            >
                              {image.quantity}
                            </button>
                          )}
                          
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 w-6 md:h-8 md:w-8 p-0 rounded-full hover:bg-green-50 hover:border-green-200"
                            onClick={() => updateQuantity(image.id, 1)}
                            disabled={image.quantity >= 999}
                          >
                            <Plus className="h-2 w-2 md:h-3 md:w-3" />
                          </Button>
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default React.memo(OptimizedImageUpload);