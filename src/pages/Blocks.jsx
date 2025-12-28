import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Ruler, Camera, ArrowRight, ArrowLeft, ShoppingBag, Home, ShoppingCart, Loader2, CheckCircle, Package } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import SizeSelector from '../components/SizeSelector';
import OptimizedImageUpload from '../components/OptimizedImageUpload';
import { useCart } from '@/components/GlobalCart';

// עיצוב מחודש מקצועי
const pageVariants = {
  initial: { opacity: 0 },
  in: { opacity: 1 },
  out: { opacity: 0 }
};

const pageTransition = {
  type: "tween",
  ease: "easeInOut",
  duration: 0.4
};

const steps = [
  { id: 1, title: 'בחירת גודל', icon: Ruler, color: 'from-amber-400 to-orange-500' },
  { id: 2, title: 'העלאת תמונות', icon: Camera, color: 'from-blue-400 to-purple-500' },
  { id: 3, title: 'הוספה לסל', icon: ShoppingBag, color: 'from-green-400 to-emerald-500' }
];

export default function Blocks() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(new Set());

  const { addToCart } = useCart();

  useEffect(() => {
    document.title = 'אינסטה בלוק - הדפסה איכותית על עץ טבעי קרני שומרון | בלוקליק';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'אינסטה בלוק בזול החל מ-18₪. הדפסה איכותית על עץ טבעי בקרני שומרון. מתנות סוף שנה מותאמות אישית, איכות מעולה. הזמינו עכשיו!');
  }, []);

  const handleSizeSelect = useCallback((size, price) => {
    setSelectedSize(size);
    setSelectedPrice(price);
    setCurrentStep(2);
    setError('');
  }, []);

  const uploadImageAutomatically = useCallback(async (image) => {
    if (uploadingImages.has(image.id) || image.isUploaded) return;

    setUploadingImages(prev => new Set([...prev, image.id]));
    
    // התחלת העלאה - מאפסים שגיאות
    setSelectedImages(prev => prev.map(img => 
      img.id === image.id 
        ? { ...img, isUploading: true, uploadProgress: 0, uploadError: null }
        : img
    ));

    // סימולציית התקדמות
    const progressInterval = setInterval(() => {
      setSelectedImages(prev => prev.map(img => {
        if (img.id === image.id && img.isUploading && (img.uploadProgress || 0) < 90) {
          // עולה מהר בהתחלה ואז מאט
          const increment = Math.max(1, (90 - (img.uploadProgress || 0)) / 10);
          return { ...img, uploadProgress: (img.uploadProgress || 0) + increment };
        }
        return img;
      }));
    }, 200);
    
    try {
      const originalFile = image.file;
      const sizeCode = selectedSize.replace('x', '');
      const prefix = 'B';
      const originalName = originalFile.name.replace(/\.[^/.]+$/, "");
      const extension = originalFile.name.split('.').pop();
      const newName = `${prefix}${sizeCode}_${originalName}.${extension}`;
      const renamedFile = new File([originalFile], newName, { type: originalFile.type });

      let uploadResult = null;
      let lastError = null;

      // ניסיון העלאה עד 3 פעמים
      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          if (attempt > 1) console.log(`Retry attempt ${attempt} for ${image.name}`);
          uploadResult = await UploadFile({ file: renamedFile });
          if (uploadResult?.file_url) break;
        } catch (err) {
          console.warn(`Upload attempt ${attempt} failed:`, err);
          lastError = err;
          // המתנה קצרה לפני ניסיון חוזר
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      if (!uploadResult?.file_url) {
        throw lastError || new Error(`העלאת תמונה '${image.name}' נכשלה לאחר מספר ניסיונות`);
      }

      clearInterval(progressInterval);

      setSelectedImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              uploaded_url: uploadResult.file_url, 
              isUploaded: true, 
              isUploading: false,
              uploadProgress: 100,
              uploadError: null 
            }
          : img
      ));

    } catch (error) {
      clearInterval(progressInterval);
      console.error('Upload failed final:', error);
      setSelectedImages(prev => prev.map(img => 
        img.id === image.id 
          ? { 
              ...img, 
              isUploaded: false, 
              isUploading: false,
              uploadProgress: 0,
              uploadError: 'שגיאה בהעלאה' 
            }
          : img
      ));
      // לא מציג שגיאה ראשית כדי לא להפריע למשתמש, רק על התמונה עצמה
    } finally {
      clearInterval(progressInterval);
      setUploadingImages(prev => {
        const newSet = new Set(prev);
        newSet.delete(image.id);
        return newSet;
      });
    }
  }, [uploadingImages, selectedSize]);

  const handleImagesChange = useCallback((newImagesList) => {
    setSelectedImages(newImagesList);
    
    if (selectedSize) {
      // סריקת כל התמונות כדי למצוא כאלו שצריכות העלאה (כולל ניסיונות חוזרים)
      newImagesList.forEach(image => {
        // מעלה אם: לא הועלה, אין שגיאה (או שנוקה ע"י כפתור נסה שוב), ולא בתהליך העלאה כרגע
        if (!image.isUploaded && !image.uploadError && !uploadingImages.has(image.id) && !image.isUploading) {
          // דיליי קטן אקראי למניעת עומס
          setTimeout(() => uploadImageAutomatically(image), Math.random() * 200);
        }
      });
    }
  }, [selectedSize, uploadImageAutomatically, uploadingImages]);

  const removeImage = useCallback((imageToRemove) => {
    setSelectedImages((prevImages) => {
      const newImages = prevImages.filter((img) => img.id !== imageToRemove.id);
      if (imageToRemove.url && imageToRemove.url.startsWith('blob:')) {
        URL.revokeObjectURL(imageToRemove.url);
      }
      return newImages;
    });
    setUploadingImages(prev => {
      const newSet = new Set(prev);
      newSet.delete(imageToRemove.id);
      return newSet;
    });
  }, []);

  const updateQuantity = useCallback((imageId, delta) => {
    setSelectedImages((prevImages) =>
      prevImages.map((img) =>
        img.id === imageId ? { ...img, quantity: Math.max(1, img.quantity + delta) } : img
      )
    );
  }, []);

  const handleAddToCart = useCallback(async () => {
    if (selectedImages.length === 0) {
      setError('יש לבחור תמונות לפני ההוספה לסל');
      return;
    }

    const unuploadedImages = selectedImages.filter(img => !img.isUploaded);
    if (unuploadedImages.length > 0) {
      setError('ממתין לסיום העלאת התמונות...');
      return;
    }

    const imagesWithErrors = selectedImages.filter(img => img.uploadError);
    if (imagesWithErrors.length > 0) {
        setError('יש תמונות שנכשלו בהעלאה. אנא הסר אותן או נסה להעלות שוב.');
        return;
    }

    setIsUploading(true);
    setError('');

    try {
      for (const image of selectedImages) {
        if (!image.uploaded_url) {
          throw new Error(`תמונה ${image.name} לא הועלתה בהצלחה (חסר URL)`);
        }

        for (let i = 0; i < image.quantity; i++) {
          addToCart({
            type: 'block',
            image_url: image.uploaded_url,
            size: selectedSize,
            price: selectedPrice,
            quantity: 1
          });
        }
      }

      setCurrentStep(3);
      setSelectedImages([]);

    } catch (err) {
      console.error('Error adding blocks to cart:', err);
      setError(`שגיאה בהוספת הבלוקים: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  }, [selectedImages, selectedSize, selectedPrice, addToCart]);

  const handlePrevStep = useCallback(() => {
    if (currentStep === 1) {
      window.location.href = createPageUrl("Home");
      return;
    }
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  }, [currentStep]);

  const totalItems = useMemo(() =>
    selectedImages.reduce((sum, img) => sum + img.quantity, 0)
  , [selectedImages]);

  const totalPrice = useMemo(() =>
    selectedImages.reduce((sum, img) => sum + (selectedPrice * img.quantity), 0)
  , [selectedImages, selectedPrice]);

  const isStillUploading = uploadingImages.size > 0;
  const canProceed = selectedImages.length > 0 && selectedImages.every(img => img.isUploaded && !img.uploadError) && !isStillUploading && !isUploading;

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-white"
    >
      {/* Header עיצוב חדש */}
      <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Package className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-medium">אינסטה בלוק</h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              הדפסת תמונות איכותית על בלוקי עץ טבעי מעוצבים
            </p>
          </motion.div>
        </div>
      </div>

      {/* Progress Steps - עיצוב חדש */}
      <div className="bg-white border-b border-slate-100">
        <div className="container mx-auto px-6 py-6">
          <div className="flex justify-center">
            <div className="flex items-center space-x-4 rtl:space-x-reverse">
              {steps.map((step, index) => {
                const isActive = currentStep === step.id;
                const isCompleted = currentStep > step.id;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? `bg-gradient-to-r from-amber-400 to-orange-500 shadow-md` :
                        isCompleted ? 'bg-green-500 shadow-sm' : 'bg-slate-200'
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div className="hidden md:block">
                        <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                          {step.title}
                        </p>
                      </div>
                    {index < steps.length - 1 && (
                      <div className={`w-8 h-0.5 rounded-full transition-colors duration-300 ${
                        isCompleted ? 'bg-green-400' : 'bg-slate-300'
                      }`} />
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="container mx-auto px-6 py-12">
        {/* Back Button */}
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="mb-8"
        >
          <Link to={createPageUrl("Home")}>
            <Button variant="outline" className="flex items-center gap-2 rounded-xl hover:shadow-md transition-all duration-200">
              <ArrowRight className="h-4 w-4" />
              <span>חזרה למסך הבית</span>
            </Button>
          </Link>
        </motion.div>

        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <Alert variant="destructive" className="mb-6 max-w-2xl mx-auto rounded-xl">
              <AlertDescription className="text-center">{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {currentStep === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
              >
                <SizeSelector selectedSize={selectedSize} onSizeSelect={handleSizeSelect} />
              </motion.div>
            )}

            {currentStep === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-8"
              >
                <div className="text-center">
                  <h2 className="text-2xl md:text-3xl font-semibold text-slate-900 mb-3">העלה תמונות</h2>
                  <p className="text-slate-600 text-base md:text-lg font-light">העלה תמונות לבלוקים בגודל {selectedSize}</p>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6">
                  <p className="text-blue-800 font-medium text-base md:text-lg">
                    💡 במידה ועיצבתם תמונה או הכנתם קולאז', נא לשים לב שהם ביחס הנכון למוצר שנבחר. המוצר הנוכחי הוא {selectedSize === '10x10' ? '1:1' : selectedSize === '10x15' ? '2:3' : '3:4'}
                  </p>
                </div>

                <OptimizedImageUpload
                  onImagesChange={handleImagesChange}
                  selectedImages={selectedImages}
                  maxFiles={999}
                  removeImage={removeImage}
                  updateQuantity={updateQuantity}
                  productType="block"
                  selectedSize={selectedSize}
                  aspectRatio={selectedSize === '10x10' ? 1 : selectedSize === '10x15' ? 10/15 : selectedSize === '15x20' ? 15/20 : undefined}
                />

                {selectedImages.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-2xl p-8 shadow-xl"
                  >
                    <div className="flex justify-between items-center text-xl font-medium mb-2">
                      <span>סה"כ בלוקים:</span>
                      <span>{totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center text-2xl font-semibold">
                      <span>סה"כ מחיר:</span>
                      <span>₪{totalPrice.toFixed(2)}</span>
                    </div>
                  </motion.div>
                )}
              </motion.div>
            )}

            {currentStep === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="text-center"
              >
                <div className="bg-white rounded-3xl shadow-2xl p-12 max-w-2xl mx-auto">
                  <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8">
                    <CheckCircle className="h-10 w-10 text-green-600" />
                  </div>
                  <h2 className="text-3xl font-medium text-slate-900 mb-4">הבלוקים נוספו לסל!</h2>
                  <p className="text-slate-600 mb-12 text-lg">הבלוקים שלך נשמרו בסל הקניות</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Link to={createPageUrl("Home")}>
                      <Button variant="outline" className="w-full py-4 text-lg rounded-xl hover:shadow-md">
                        <Home className="ml-2 h-5 w-5" />
                        חזרה למסך הבית
                      </Button>
                    </Link>
                    <Link to={createPageUrl("Cart")}>
                      <Button className="w-full py-4 text-lg rounded-xl bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg">
                        <ShoppingCart className="ml-2 h-5 w-5" />
                        מעבר לסל הקניות
                      </Button>
                    </Link>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        {/* Navigation */}
        <div className="flex justify-between items-center max-w-5xl mx-auto mt-16">
          <Button
            onClick={handlePrevStep}
            disabled={isUploading || isStillUploading}
            variant="outline"
            className="flex items-center gap-2 rounded-xl px-6 py-3"
          >
            <ArrowRight className="h-4 w-4" />
            <span>{currentStep === 1 ? 'חזרה למסך הבית' : 'הקודם'}</span>
          </Button>

          {currentStep === 2 && (
            <Button
              onClick={handleAddToCart}
              disabled={!canProceed}
              className={`flex items-center gap-2 rounded-xl px-8 py-3 ${
                canProceed 
                  ? 'bg-gradient-to-r from-amber-500 to-orange-500 hover:shadow-lg text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isStillUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>מעלה תמונות...</span>
                </>
              ) : isUploading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>מוסיף לסל...</span>
                </>
              ) : (
                <>
                  <span>הוסף לסל</span>
                  <ArrowLeft className="h-4 w-4" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>
    </motion.div>
  );
}