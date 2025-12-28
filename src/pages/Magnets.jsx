import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Ruler, Camera, ArrowRight, ArrowLeft, ShoppingBag, Home, ShoppingCart, Loader2, CheckCircle, Magnet } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

import MagnetSizeSelector from '../components/MagnetSizeSelector';
import OptimizedImageUpload from '../components/OptimizedImageUpload';
import { useCart } from '@/components/GlobalCart';

// אנימציות מקצועיות - זהות לבלוקים
const pageVariants = {
  initial: {
    opacity: 0,
    y: 20,
    scale: 0.98
  },
  in: {
    opacity: 1,
    y: 0,
    scale: 1
  },
  out: {
    opacity: 0,
    y: -20,
    scale: 1.02
  }
};

const pageTransition = {
  type: "tween",
  ease: "anticipate",
  duration: 0.6
};

const contentVariants = {
  initial: { opacity: 0, y: 40 },
  animate: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.7,
      ease: "easeOut",
      delay: 0.2
    }
  }
};

const steps = [
  { id: 1, title: 'בחירת גודל', icon: Ruler },
  { id: 2, title: 'העלאת תמונות', icon: Camera },
  { id: 3, title: 'הוספה לסל', icon: ShoppingBag }
];

export default function Magnets() {
  const [currentStep, setCurrentStep] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedPrice, setSelectedPrice] = useState(0);
  const [selectedImages, setSelectedImages] = useState([]);
  const [error, setError] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadingImages, setUploadingImages] = useState(new Set());
  const [productType, setProductType] = useState('magnet'); // Initial state for productType set to 'magnet'
  const [minQuantity, setMinQuantity] = useState(1); // Default to 1
  const [requiredImages, setRequiredImages] = useState(1); // Default to 1

  const { addToCart } = useCart();

  useEffect(() => {
    document.title = 'מגנטים מעוצבים - הדפסה איכותית קרני שומרון | בלוקליק';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'צילום מגנטים איכותי החל מ-2.5₪. הדפסה עמידה בקרני שומרון. מתנות סוף שנה מותאמות אישית. הזמינו עכשיו!');
  }, []);

  const handleSizeSelect = useCallback((size, price, type = 'magnet', minQty = 1, reqImages = 1) => {
    setSelectedSize(size);
    setSelectedPrice(price);
    setProductType('magnet'); // Only magnets
    setMinQuantity(1);
    setRequiredImages(1);
    setCurrentStep(2);
    setError('');
  }, []);

  const uploadImageAutomatically = useCallback(async (image) => {
    if (uploadingImages.has(image.id) || image.isUploaded) return;

    setUploadingImages(prev => new Set([...prev, image.id]));
    
    setSelectedImages(prev => prev.map(img => 
      img.id === image.id 
        ? { ...img, isUploading: true, uploadProgress: 0, uploadError: null }
        : img
    ));

    const progressInterval = setInterval(() => {
      setSelectedImages(prev => prev.map(img => {
        if (img.id === image.id && img.isUploading && (img.uploadProgress || 0) < 90) {
          const increment = Math.max(1, (90 - (img.uploadProgress || 0)) / 10);
          return { ...img, uploadProgress: (img.uploadProgress || 0) + increment };
        }
        return img;
      }));
    }, 200);
    
    try {
      const originalFile = image.file;
      const sizeCode = selectedSize.replace('x', '').replace('.', '');
      const prefix = 'M';
      const originalName = originalFile.name.replace(/\.[^/.]+$/, "");
      const extension = originalFile.name.split('.').pop();
      const newName = `${prefix}${sizeCode}_${originalName}.${extension}`;
      const renamedFile = new File([originalFile], newName, { type: originalFile.type });

      let uploadResult = null;
      let lastError = null;

      for (let attempt = 1; attempt <= 3; attempt++) {
        try {
          if (attempt > 1) console.log(`Retry attempt ${attempt} for ${image.name}`);
          uploadResult = await UploadFile({ file: renamedFile });
          if (uploadResult?.file_url) break;
        } catch (err) {
          console.warn(`Upload attempt ${attempt} failed:`, err);
          lastError = err;
          if (attempt < 3) await new Promise(resolve => setTimeout(resolve, 1000 * attempt));
        }
      }

      if (!uploadResult?.file_url) {
        throw lastError || new Error(`העלאת תמונה '${image.name}' נכשלה`);
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
      console.error('Upload failed:', error);
      
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
      newImagesList.forEach(image => {
        if (!image.isUploaded && !image.uploadError && !uploadingImages.has(image.id) && !image.isUploading) {
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
            type: 'magnet', // Always 'magnet'
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
      console.error('Error adding items to cart:', err);
      setError(`שגיאה בהוספת הפריטים: ${err.message || err}`);
    } finally {
      setIsUploading(false);
    }
  }, [selectedImages, selectedSize, selectedPrice, addToCart]); // Removed productType from dependencies

  const handlePrevStep = useCallback(() => {
    if (currentStep === 1) {
      window.location.href = createPageUrl("Home");
      return;
    }
    if (currentStep === 2) setCurrentStep(1);
    else if (currentStep === 3) setCurrentStep(2);
  }, [currentStep]);

  const totalItems = useMemo(() => {
    return selectedImages.reduce((sum, img) => sum + img.quantity, 0);
  }, [selectedImages]); // Removed productType from dependencies

  const totalPrice = useMemo(() => {
    return selectedImages.reduce((sum, img) => sum + (selectedPrice * img.quantity), 0);
  }, [selectedImages, selectedPrice]); // Removed productType from dependencies

  const isStillUploading = uploadingImages.size > 0;
  const canProceed = selectedImages.length > 0 && 
                     selectedImages.every(img => img.isUploaded && !img.uploadError) && 
                     !isStillUploading && 
                     !isUploading; // Removed productType-specific bookmark check

  const getAspectRatio = useCallback(() => {
    switch (selectedSize) {
      case '7.5x10': return 7.5 / 10;
      case '10x15': return 10 / 15;
      case '15x20': return 15 / 20;
      default: return 1;
    }
  }, [selectedSize]); // Removed productType from dependencies

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen bg-gradient-to-br from-slate-50 to-white font-sans"
    >
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-black/10"></div>
        <div className="container mx-auto px-6 py-16 relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <div className="flex items-center justify-center gap-4 mb-6">
              <div className="w-16 h-16 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm">
                <Magnet className="h-8 w-8 text-white" />
              </div>
              <h1 className="text-5xl md:text-6xl font-medium">מגנטים</h1>
            </div>
            <p className="text-xl text-white/90 max-w-2xl mx-auto">
              מגנטים איכותיים בהדפסה עמידה
            </p>
          </motion.div>
        </div>
      </div>

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
                    <div className="flex items-center gap-3">
                      <div className={`relative w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-300 ${
                        isActive ? `bg-gradient-to-r from-blue-400 to-purple-500 shadow-md` :
                        isCompleted ? 'bg-green-500 shadow-sm' : 'bg-slate-200'
                      }`}>
                        <Icon className={`h-5 w-5 ${isActive || isCompleted ? 'text-white' : 'text-slate-500'}`} />
                      </div>
                      <div className="hidden md:block">
                        <p className={`text-sm font-medium ${isActive ? 'text-slate-900' : 'text-slate-600'}`}>
                          {step.title}
                        </p>
                      </div>
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

      <motion.div
        className="container mx-auto px-6 py-12"
        variants={contentVariants}
        initial="initial"
        animate="animate"
      >
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            <Alert variant="destructive" className="mb-6 max-w-lg mx-auto">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          </motion.div>
        )}

        <AnimatePresence mode="wait">
          {currentStep === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="max-w-4xl mx-auto"
            >
              <MagnetSizeSelector onSizeSelect={handleSizeSelect} selectedSize={selectedSize} productType={'magnet'} />
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.5, ease: "easeInOut" }}
              className="max-w-4xl mx-auto"
            >
              <div className="space-y-6">
                <div className="text-center space-y-2">
                  <h3 className="text-2xl md:text-3xl font-semibold text-slate-800">העלה תמונות</h3>
                  <p className="text-slate-500 text-base md:text-lg font-light">העלה תמונות למגנטים בגודל {selectedSize}</p>
                </div>

                <div className="text-center bg-blue-50 border border-blue-200 rounded-xl p-4 md:p-6 mb-6">
                  <p className="text-blue-800 font-medium text-base md:text-lg">
                    💡 במידה ועיצבתם תמונה או הכנתם קולאז', נא לשים לב שהם ביחס הנכון למוצר שנבחר. המוצר הנוכחי הוא {selectedSize === '7.5x10' ? '3:4' : selectedSize === '10x15' ? '2:3' : selectedSize === '15x20' ? '3:4' : '3:4'}
                  </p>
                </div>

                <OptimizedImageUpload
                  onImagesChange={handleImagesChange}
                  selectedImages={selectedImages}
                  maxFiles={999} // Max files for magnets
                  removeImage={removeImage}
                  updateQuantity={updateQuantity}
                  productType="magnet" // Always "magnet"
                  selectedSize={selectedSize}
                  aspectRatio={getAspectRatio()}
                />

                {selectedImages.length > 0 && (
                  <div className="space-y-4">
                    {isStillUploading && (
                      <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-center">
                        <div className="flex items-center justify-center gap-2 text-blue-700">
                          <Loader2 className="h-4 w-4 animate-spin" />
                          <span>מעלה תמונות... ({uploadingImages.size} נותרו)</span>
                        </div>
                      </div>
                    )}

                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.1, duration: 0.3 }}
                      className="bg-gradient-to-r from-blue-500 to-purple-500 text-white rounded-2xl shadow-xl p-6"
                    >
                      <div className="flex justify-between items-center text-lg font-semibold mb-2">
                        <span>סה"כ מגנטים:</span>
                        <span>{totalItems}</span>
                      </div>
                      <div className="flex justify-between items-center text-xl font-bold">
                        <span>סה"כ מחיר:</span>
                        <span>₪{totalPrice.toFixed(2)}</span>
                      </div>
                    </motion.div>
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 1.1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="max-w-2xl mx-auto"
            >
              <motion.div
                className="bg-white rounded-2xl shadow-2xl p-8 text-center"
                initial={{ y: 20 }}
                animate={{ y: 0 }}
                transition={{ delay: 0.2, duration: 0.5 }}
              >
                <motion.div
                  className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6"
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.3, type: "spring", stiffness: 200 }}
                >
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </motion.div>
                <motion.h3
                  className="text-2xl font-bold text-slate-800 mb-4"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                >
                  המגנטים נוספו לסל!
                </motion.h3>
                <motion.p
                  className="text-slate-600 mb-8"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                >
                  המגנטים שלך נשמרו בסל הקניות
                </motion.p>

                <motion.div
                  className="grid grid-cols-1 md:grid-cols-2 gap-4"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.6 }}
                >
                  <Link to={createPageUrl("Home")}>
                    <Button variant="outline" className="w-full py-4 text-lg font-semibold rounded-xl">
                      <Home className="ml-2 h-5 w-5" />
                      חזרה למסך הבית
                    </Button>
                  </Link>

                  <Link to={createPageUrl("Cart")}>
                    <Button className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700">
                      <ShoppingCart className="ml-2 h-5 w-5" />
                      מעבר לסל הקניות
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div
          className="flex justify-between items-center max-w-4xl mx-auto mt-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={handlePrevStep}
              variant="outline"
              disabled={isUploading || isStillUploading}
              className="flex items-center space-x-2 rtl:space-x-reverse rounded-full px-6 py-2"
            >
              <ArrowRight className="h-4 w-4" />
              <span>{currentStep === 1 ? 'חזרה למסך הבית' : 'הקודם'}</span>
            </Button>
          </motion.div>

          {currentStep === 2 && (
            <motion.div
              whileHover={{ scale: canProceed ? 1.05 : 1 }}
              whileTap={{ scale: canProceed ? 0.95 : 1 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.9 }}
            >
              <Button
                onClick={handleAddToCart}
                disabled={!canProceed}
                className={`flex items-center space-x-2 rtl:space-x-reverse rounded-full px-6 py-2 ${
                  canProceed 
                    ? 'bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white'
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
            </motion.div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
}