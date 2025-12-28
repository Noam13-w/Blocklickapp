
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { RectangleHorizontal, Check, Magnet as MagnetIcon } from 'lucide-react';

const sizes = [
  {
    id: '7.5x10',
    name: '7.5×10 ס"מ',
    price: 2.5,
    icon: RectangleHorizontal,
    description: 'מגנט קטן',
    ratio: 7.5/10,
    shape: 'rectangle',
    popular: false
  },
  {
    id: '10x15',
    name: '10×15 ס"מ',
    price: 4,
    icon: RectangleHorizontal,
    description: 'מגנט בינוני',
    ratio: 10/15,
    shape: 'rectangle',
    popular: true
  },
  {
    id: '15x20',
    name: '15×20 ס"מ',
    price: 6,
    icon: RectangleHorizontal,
    description: 'מגנט גדול',
    ratio: 15/20,
    shape: 'rectangle',
    popular: false
  }
];

export default function MagnetSizeSelector({ selectedSize, onSizeSelect }) {
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
          בחר גודל
        </h2>
        <p className="text-base md:text-lg text-slate-600 font-light">
          מגנטים איכותיים מעוצבים
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
                  className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-blue-500 to-purple-500 text-white text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full shadow-xl"
                >
                  פופולרי
                </motion.div>
              )}

              <button
                onClick={() => onSizeSelect(size.id, size.price)}
                className={`w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-500 text-center group relative overflow-hidden ${
                  isSelected
                    ? 'border-blue-400 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-100 shadow-xl ring-2 ring-blue-200/50'
                    : 'border-slate-200 bg-white hover:border-blue-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-slate-50 hover:to-blue-50'
                }`}
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-blue-400/20 to-purple-400/20 opacity-0 transition-opacity duration-500 ${
                  isSelected || isHovered ? 'opacity-100' : ''
                }`} />

                {/* Selection Check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-3 left-3 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="h-3 w-3 md:h-5 md:w-5 text-white" />
                  </motion.div>
                )}
                
                <div className="relative z-10 space-y-4">
                  {/* Magnet Visual */}
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ rotateY: 8, rotateX: 4 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`relative bg-gradient-to-br from-blue-200 via-blue-300 to-blue-400 rounded-lg shadow-2xl border-2 border-white ${
                        size.id === '7.5x10' ? 'w-20 h-15 md:w-24 md:h-18' : // קטן - לרוחב
                        size.id === '10x15' ? 'w-30 h-20 md:w-36 md:h-24' : // בינוני - לרוחב
                        'w-32 h-24 md:w-38 md:h-28' // גדול - לרוחב
                      }`}
                      style={{
                        aspectRatio: 1/size.ratio, // הפיכת היחס לרוחב
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      {/* Magnet Effect */}
                      <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-red-600 rounded-full shadow-md"></div>
                      
                      {/* Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <MagnetIcon className={`text-blue-700 opacity-60 ${
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
                      isSelected ? 'text-blue-900' : 'text-slate-800 group-hover:text-blue-800'
                    }`}>
                      {size.name}
                    </h3>
                    
                    <motion.div
                      animate={{ scale: isSelected ? 1.05 : 1 }}
                      className={`text-2xl md:text-3xl font-bold transition-all duration-300 ${
                        isSelected ? 'text-blue-600' : 'text-slate-700 group-hover:text-blue-600'
                      }`}
                    >
                      ₪{size.price}
                    </motion.div>
                    
                    <p className={`text-sm md:text-base transition-all duration-300 ${
                      isSelected ? 'text-blue-700' : 'text-slate-500 group-hover:text-blue-600'
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
                    className="text-blue-600 font-medium text-sm"
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
