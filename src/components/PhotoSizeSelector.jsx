
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RectangleHorizontal, Check, Camera } from 'lucide-react';

const sizes = [
  {
    id: '7.5x10',
    name: '7.5×10 ס"מ',
    price: 0.7,
    icon: RectangleHorizontal,
    description: 'תמונה קטנה',
    ratio: 7.5/10,
    shape: 'rectangle',
    popular: false
  },
  {
    id: '10x15',
    name: '10×15 ס"מ',
    price: 1,
    icon: RectangleHorizontal,
    description: 'תמונה סטנדרטית',
    ratio: 10/15,
    shape: 'rectangle',
    popular: true
  },
  {
    id: '15x20',
    name: '15×20 ס"מ',
    price: 2,
    icon: RectangleHorizontal,
    description: 'תמונה גדולה',
    ratio: 15/20,
    shape: 'rectangle',
    popular: false
  }
];

export default function PhotoSizeSelector({ selectedSize, onSizeSelect }) {
  const [hoveredSize, setHoveredSize] = useState(null);

  return (
    <div className="max-w-4xl mx-auto px-4">
      {/* Header */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-8"
      >
        <h2 className="text-2xl md:text-3xl font-normal text-slate-900 mb-2">
          בחר גודל תמונה
        </h2>
        <p className="text-base md:text-lg text-slate-600 font-light">
          הדפסה תרמית איכותית על נייר פוטו פרימיום
        </p>
      </motion.div>
      
      {/* Size Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {sizes.map((size, index) => {
          const isSelected = selectedSize === size.id;
          const isHovered = hoveredSize === size.id;
          
          return (
            <motion.div
              key={size.id}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onHoverStart={() => setHoveredSize(size.id)}
              onHoverEnd={() => setHoveredSize(null)}
              className="relative"
            >
              {/* Popular Badge */}
              {size.popular && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.5, type: "spring" }}
                  className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full shadow-xl"
                >
                  פופולרי
                </motion.div>
              )}

              <button
                onClick={() => onSizeSelect(size.id, size.price, size.ratio)}
                className={`w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-500 text-center group relative overflow-hidden ${
                  isSelected
                    ? 'border-green-400 bg-gradient-to-br from-green-50 via-emerald-50 to-green-100 shadow-xl ring-2 ring-green-200/50'
                    : 'border-slate-200 bg-white hover:border-green-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-slate-50 hover:to-green-50'
                }`}
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-green-400/20 to-emerald-400/20 opacity-0 transition-opacity duration-500 ${
                  isSelected || isHovered ? 'opacity-100' : ''
                }`} />

                {/* Selection Check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-3 left-3 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="h-3 w-3 md:h-5 md:w-5 text-white" />
                  </motion.div>
                )}
                
                <div className="relative z-10 space-y-4">
                  {/* Photo Visual */}
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ rotateY: 8, rotateX: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`relative bg-gradient-to-br from-white via-gray-50 to-gray-100 rounded-lg shadow-2xl border-2 border-white ${
                        size.id === '7.5x10' ? 'w-20 h-15 md:w-24 md:h-18' : // קטן - לרוחב
                        size.id === '10x15' ? 'w-30 h-20 md:w-36 md:h-24' : // בינוני - לרוחב
                        'w-32 h-24 md:w-38 md:h-28' // גדול - לרוחב
                      }`}
                      style={{
                        aspectRatio: 1/size.ratio, // הפיכת היחס לרוחב
                        background: `linear-gradient(135deg, 
                          #ffffff 0%, 
                          #f8fafc 25%, 
                          #f1f5f9 50%, 
                          #e2e8f0 75%, 
                          #cbd5e1 100%)`,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.8)'
                      }}
                    >
                      {/* Photo Border Effect */}
                      <div className="absolute inset-1 rounded-md bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <Camera className={`text-gray-400 ${
                          size.id === '7.5x10' ? 'h-4 w-4 md:h-5 md:w-5' :
                          size.id === '10x15' ? 'h-6 w-6 md:h-7 md:w-7' :
                          'h-7 w-7 md:h-8 md:w-8'
                        }`} />
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Size Info */}
                  <div className="space-y-2">
                    <h3 className={`text-lg md:text-xl font-medium transition-all duration-300 ${
                      isSelected ? 'text-green-900' : 'text-slate-800 group-hover:text-green-800'
                    }`}>
                      {size.name}
                    </h3>
                    
                    <motion.div
                      animate={{ scale: isSelected ? 1.05 : 1 }}
                      className={`text-2xl md:text-3xl font-bold transition-all duration-300 ${
                        isSelected ? 'text-green-600' : 'text-slate-700 group-hover:text-green-600'
                      }`}
                    >
                      ₪{size.price}
                    </motion.div>
                    
                    <p className={`text-sm md:text-base transition-all duration-300 ${
                      isSelected ? 'text-green-700' : 'text-slate-500 group-hover:text-green-600'
                    }`}>
                      {size.description}
                    </p>
                  </div>

                  {/* Hover Effect Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ 
                      opacity: isHovered || isSelected ? 1 : 0,
                      y: isHovered || isSelected ? 0 : 10
                    }}
                    transition={{ duration: 0.3 }}
                    className="text-green-600 font-medium text-sm"
                  >
                    {isSelected ? '✓ נבחר' : 'לחץ לבחירה'}
                  </motion.div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
