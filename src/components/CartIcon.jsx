import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { useCart } from '@/components/GlobalCart';

export default function CartIcon() {
  const { getTotalItems } = useCart();
  const [totalItems, setTotalItems] = useState(0);
  const [prevTotalItems, setPrevTotalItems] = useState(0);

  useEffect(() => {
    const items = getTotalItems();
    setPrevTotalItems(totalItems);
    setTotalItems(items);
  }, [getTotalItems()]);

  const hasNewItems = totalItems > prevTotalItems;

  return (
    <div className="flex items-center gap-2">
      <Link to={createPageUrl("Cart")}>
        <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:bg-amber-100 hover:text-amber-700 relative group rounded-full px-4">
          <motion.div
            whileHover={{ scale: 1.1, rotate: [0, -10, 10, 0] }}
            whileTap={{ scale: 0.95 }}
            className="relative"
            animate={hasNewItems ? { 
              scale: [1, 1.3, 1],
              rotate: [0, -15, 15, 0]
            } : {}}
            transition={{ duration: 0.5 }}
          >
            <ShoppingBag className="h-5 w-5" />
            
            <AnimatePresence>
              {totalItems > 0 && (
                <motion.div
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0, opacity: 0 }}
                  className="absolute -top-2 -right-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold shadow-lg ring-2 ring-white"
                >
                  {totalItems}
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
          <span className="hidden sm:inline font-medium">סל קניות</span>
        </Button>
      </Link>
    </div>
  );
}