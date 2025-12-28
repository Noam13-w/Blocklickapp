import React from 'react';
import { motion } from 'framer-motion';
import { Package, Magnet } from 'lucide-react';

export default function ProductSelector({ selectedProduct, onProductSelect }) {
  const products = [
    {
      id: 'block',
      name: 'בלוק עץ',
      icon: Package,
      description: 'הדפסה איכותית על בלוק עץ מעוצב'
    },
    {
      id: 'magnet',
      name: 'מגנט',
      icon: Magnet,
      description: 'מגנט איכותי למקרר או משטחי מתכת'
    }
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      <div className="text-center space-y-2">
        <h3 className="text-2xl font-bold text-slate-800">בחר סוג מוצר</h3>
        <p className="text-slate-500">על מה תרצה להדפיס את התמונה?</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto">
        {products.map((product, index) => {
          const Icon = product.icon;
          const isSelected = selectedProduct === product.id;
          
          return (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <button
                onClick={() => onProductSelect(product.id)}
                className={`w-full p-8 rounded-2xl border-2 transition-all duration-300 text-center ${
                  isSelected
                    ? 'border-amber-400 bg-amber-50 shadow-lg ring-2 ring-amber-200'
                    : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-md'
                }`}
              >
                <div className="space-y-4">
                  <div className={`w-16 h-16 mx-auto rounded-xl flex items-center justify-center ${
                    isSelected ? 'bg-amber-100' : 'bg-slate-100'
                  }`}>
                    <Icon className={`h-8 w-8 ${
                      isSelected ? 'text-amber-600' : 'text-slate-600'
                    }`} />
                  </div>
                  
                  <div className="space-y-2">
                    <h4 className={`text-xl font-semibold ${
                      isSelected ? 'text-amber-800' : 'text-slate-800'
                    }`}>
                      {product.name}
                    </h4>
                    <p className={`text-sm leading-relaxed ${
                      isSelected ? 'text-amber-700' : 'text-slate-500'
                    }`}>
                      {product.description}
                    </p>
                  </div>
                </div>
              </button>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}