
import React, { useRef } from 'react';
import { Upload, Image as ImageIcon, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Progress } from '@/components/ui/progress';

export default function ImageUpload({ onImageSelect, selectedImage, onRemoveImage }) {
  const fileInputRef = useRef(null);
  const [isDragActive, setIsDragActive] = React.useState(false);
  const [isConverting, setIsConverting] = React.useState(false);
  const [conversionProgress, setConversionProgress] = React.useState(0);

  // פונקציה להמרת HEIC
  const convertHeicToJpeg = async (file) => {
    setIsConverting(true);
    setConversionProgress(0);
    
    try {
      setConversionProgress(20);
      
      if (!window.heic2any) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js';
        await new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
          document.head.appendChild(script);
        });
      }

      setConversionProgress(50);

      const convertedBlob = await window.heic2any({
        blob: file,
        toType: 'image/jpeg',
        quality: 1.0,
        multiple: false
      });

      setConversionProgress(80);

      const imageUrl = URL.createObjectURL(convertedBlob);
      
      setConversionProgress(100);
      
      return {
        convertedFile: new File([convertedBlob], file.name.replace(/\.heic$/i, '.jpg'), {
          type: 'image/jpeg',
          lastModified: file.lastModified
        }),
        preview: imageUrl
      };

    } catch (error) {
      throw new Error('לא ניתן להמיר את קובץ ה-HEIC');
    } finally {
      setIsConverting(false);
      setConversionProgress(0);
    }
  };

  const handleFileSelect = async (files) => {
    // Ensuring files is treated as an array-like object
    const file = files && files.length > 0 ? files[0] : null;
    
    if (!file) return;
    
    const isHeic = file.name.toLowerCase().endsWith('.heic') || file.name.toLowerCase().endsWith('.heif');
    const isValidImage = file.type.startsWith('image/');
    const isGif = file.type === 'image/gif';
    
    if (isGif) {
      alert('קבצי GIF אינם נתמכים');
      return;
    }
    
    // Allow HEIC/HEIF files even if not explicitly in input's accept attribute,
    // as they will be converted.
    if (!isValidImage && !isHeic) {
      alert('אנא בחר קובץ תמונה תקין');
      return;
    }
    
    try {
      if (isHeic) {
        const converted = await convertHeicToJpeg(file);
        onImageSelect({
          file: converted.convertedFile,
          preview: converted.preview
        });
      } else {
        // יצירת URL לתצוגה ישירה
        const previewUrl = URL.createObjectURL(file);
        onImageSelect({
          file: file,
          preview: previewUrl
        });
      }
    } catch (error) {
      alert(error.message || 'שגיאה בטעינת התמונה');
    }
  };

  // handleFileInputChange function is removed as handleFileSelect is directly used on onChange

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);
    
    const files = e.dataTransfer.files;
    if (files && files.length > 0) {
      handleFileSelect(files);
    }
  };

  const handleClick = () => {
    if (!isConverting) {
      fileInputRef.current?.click();
    }
  };

  if (selectedImage) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="relative"
      >
        <div className="relative bg-white rounded-2xl shadow-lg overflow-hidden border border-slate-200">
          <img 
            src={selectedImage.preview} 
            alt="תמונה שנבחרה"
            className="w-full h-64 object-cover"
            onError={(e) => {
              console.error('Image failed to load:', selectedImage.preview);
              e.target.src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgdmlld0JveD0iMCAwIDIwMCAyMDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIyMDAiIGhlaWdodD0iMjAwIiBmaWxsPSIjRjNGNEY2Ii8+CjxwYXRoIGQ9Ik0xMDAgMTMwQzExNi41NjkgMTMwIDEzMCAxMTYuNTY5IDEzMCAxMDBDMTMwIDgzLjQzMTUgMTE2LjU2OSA3MCAxMDAgNzBDODMuNDMxNSA3MCA3MCA4My40MzE1IDcwIDEwMEM3MCAxMTYuNTY5IDgzLjQzMTUgMTMwIDEwMCAxMzBaIiBmaWxsPSIjOUI5QkEwIi8+CjxwYXRoIGQ9Ik04NSA5NUw5MCA4NUw5NSA5NUw5MCA5NUw4NSA5NVoiIGZpbGw9IiM2QjdCODAiLz4KPC9zdmc+';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/50 to-transparent" />
          <Button
            onClick={onRemoveImage}
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-white/90 hover:bg-white text-slate-700 rounded-full shadow-lg"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png" // Modified accept attribute
        onChange={(e) => handleFileSelect(e.target.files)} // Changed onChange handler
        className="hidden"
        id="image-upload" // Added id attribute
      />
      
      <div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative border-2 border-dashed rounded-2xl p-12 text-center cursor-pointer transition-all duration-300 bg-gradient-to-br ${
          isDragActive 
            ? 'border-amber-400 bg-amber-50 shadow-lg scale-105' 
            : 'border-slate-300 bg-slate-50/50 hover:border-slate-400 hover:bg-slate-50'
        } ${isConverting ? 'opacity-70 cursor-wait' : ''}`}
      >
        <div className="space-y-6">
          <div className={`mx-auto w-20 h-20 rounded-full flex items-center justify-center transition-colors ${
            isDragActive ? 'bg-amber-100' : 'bg-slate-100'
          }`}>
            {isDragActive ? (
              <Upload className="h-8 w-8 text-amber-600" />
            ) : (
              <ImageIcon className="h-8 w-8 text-slate-600" />
            )}
          </div>
          
          {/* New paragraph inserted as per outline */}
          <p className="text-slate-500 mb-6">תמונות בפורמט JPG ו-PNG</p>

          <div className="space-y-2">
            <h3 className="text-xl font-semibold text-slate-800">
              {isConverting ? 'ממיר תמונה...' : isDragActive ? 'שחרר כאן את התמונה' : 'העלה את התמונה שלך'}
            </h3>
            {/* Original paragraph content kept, if it was to be replaced the outline would be different */}
            <p className="text-slate-500 text-sm leading-relaxed">
              {isConverting ? 'אנא המתן, הקובץ מתומר...' : 'גרור ושחרר את התמונה כאן או לחץ לבחירת קובץ'}
            </p>
          </div>
          
          {isConverting && (
            <div className="space-y-2 max-w-xs mx-auto">
              <Progress value={conversionProgress} className="w-full" />
              <p className="text-xs text-slate-500">{conversionProgress}% הושלם</p>
            </div>
          )}
          
          <Button 
            type="button"
            disabled={isConverting}
            className="bg-slate-800 hover:bg-slate-700 text-white px-8 py-2 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50"
          >
            {isConverting ? 'ממיר...' : 'בחר תמונה'}
          </Button>
          
          <p className="text-xs text-slate-400">
            נתמכים: JPG, PNG, HEIC
          </p>
        </div>
      </div>
    </motion.div>
  );
}
