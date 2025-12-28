
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Square, RectangleHorizontal, Check } from 'lucide-react';

const sizes = [
  {
    id: '10x10',
    name: '10×10 ס"מ',
    price: 18,
    icon: Square,
    description: 'בלוק ריבועי קטן',
    ratio: 1,
    shape: 'square',
    popular: false
  },
  {
    id: '10x15',
    name: '10×15 ס"מ',
    price: 22,
    icon: RectangleHorizontal,
    description: 'בלוק מלבני בינוני',
    ratio: 1.5,
    shape: 'rectangle',
    popular: true
  },
  {
    id: '15x20',
    name: '15×20 ס"מ',
    price: 30,
    icon: RectangleHorizontal,
    description: 'בלוק מלבני גדול',
    ratio: 0.75,
    shape: 'rectangle',
    popular: false
  }
];

export default function SizeSelector({ selectedSize, onSizeSelect }) {
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
          כל הגדלים מיוצרים מעץ טבעי איכותי
        </p>
      </motion.div>
      
      {/* Size Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        {sizes.map((size, index) => {
          const isSelected = selectedSize === size.id;
          const isHovered = hoveredSize === size.id;
          const Icon = size.icon;
          
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
                  className="absolute -top-2 -right-2 z-10 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs md:text-sm font-medium px-2 md:px-3 py-1 rounded-full shadow-xl"
                >
                  פופולרי
                </motion.div>
              )}

              <button
                onClick={() => onSizeSelect(size.id, size.price, size.ratio)}
                className={`w-full p-4 md:p-6 rounded-2xl md:rounded-3xl border-2 transition-all duration-500 text-center group relative overflow-hidden ${
                  isSelected
                    ? 'border-amber-400 bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100 shadow-xl ring-2 ring-amber-200/50'
                    : 'border-slate-200 bg-white hover:border-amber-300 hover:shadow-lg hover:bg-gradient-to-br hover:from-slate-50 hover:to-amber-50'
                }`}
              >
                {/* Background Glow Effect */}
                <div className={`absolute inset-0 bg-gradient-to-br from-amber-400/20 to-orange-400/20 opacity-0 transition-opacity duration-500 ${
                  isSelected || isHovered ? 'opacity-100' : ''
                }`} />

                {/* Selection Check */}
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0, rotate: -180 }}
                    animate={{ scale: 1, rotate: 0 }}
                    className="absolute top-3 left-3 w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-amber-500 to-orange-500 rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Check className="h-3 w-3 md:h-5 md:w-5 text-white" />
                  </motion.div>
                )}
                
                <div className="relative z-10 space-y-4">
                  {/* Wood Block Visual */}
                  <div className="flex justify-center">
                    <motion.div
                      whileHover={{ rotateY: 10, rotateX: 5 }}
                      transition={{ type: "spring", stiffness: 300 }}
                      className={`relative bg-gradient-to-br from-amber-200 via-amber-300 to-amber-400 rounded-xl shadow-2xl border-2 border-white ${
                        size.id === '10x10' ? 'w-16 h-16 md:w-20 md:h-20' : // ריבוע קטן
                        size.id === '10x15' ? 'w-24 h-20 md:w-30 md:h-24' : // בינוני - לרוחב (10 רוחב, 15 אורך אבל מוצג הפוך)
                        'w-30 h-24 md:w-36 md:h-28' // גדול - לרוחב (15 רוחב, 20 אורך אבל מוצג הפוך)
                      }`}
                      style={{
                        aspectRatio: size.shape === 'square' ? 1 : 15/10, // ריבוע 1:1, מלבנים 15:10 (לרוחב)
                        background: `linear-gradient(135deg, 
                          #f3e5b4 0%, 
                          #e8d5a3 25%, 
                          #ddc592 50%, 
                          #d2b581 75%, 
                          #c7a570 100%)`,
                        boxShadow: '0 10px 25px rgba(0,0,0,0.15), inset 0 1px 0 rgba(255,255,255,0.2)'
                      }}
                    >
                      {/* Size Icon Overlay */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Icon className={`text-amber-700 opacity-30 ${
                          size.id === '10x10' ? 'h-5 w-5 md:h-6 md:w-6' :
                          size.id === '10x15' ? 'h-6 w-6 md:h-7 md:w-7' :
                          'h-7 w-7 md:h-8 md:w-8'
                        }`} />
                      </div>
                    </motion.div>
                  </div>
                  
                  {/* Size Info */}
                  <div className="space-y-2">
                    <h3 className={`text-lg md:text-xl font-medium transition-all duration-300 ${
                      isSelected ? 'text-amber-900' : 'text-slate-800 group-hover:text-amber-800'
                    }`}>
                      {size.name}
                    </h3>
                    
                    <motion.div
                      animate={{ scale: isSelected ? 1.05 : 1 }}
                      className={`text-2xl md:text-3xl font-bold transition-all duration-300 ${
                        isSelected ? 'text-amber-600' : 'text-slate-700 group-hover:text-amber-600'
                      }`}
                    >
                      ₪{size.price}
                    </motion.div>
                    
                    <p className={`text-sm md:text-base transition-all duration-300 ${
                      isSelected ? 'text-amber-700' : 'text-slate-500 group-hover:text-amber-600'
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
                    className="text-amber-600 font-medium text-sm"
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
