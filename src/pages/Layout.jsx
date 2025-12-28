import React, { useEffect, useState } from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { ShoppingCart, Menu, X } from 'lucide-react';
import { useCart } from '../context/CartContext'; // וודא שיש לך את הקובץ הזה, אם לא - מחק את השורה

const Layout = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const location = useLocation();
  
  // פונקציה לסגירת התפריט במובייל כשעוברים דף
  useEffect(() => {
    setIsMenuOpen(false);
  }, [location]);

  return (
    <div className="min-h-screen bg-gray-50 dir-rtl" style={{ direction: 'rtl' }}>
      
      {/* --- Header / תפריט עליון --- */}
      <nav className="bg-white shadow-sm sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            
            {/* צד ימין - לוגו */}
            <div className="flex items-center">
              <Link to="/home" className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">BlockClick</span>
              </Link>
            </div>

            {/* מרכז - קישורים (למסכים גדולים) */}
            <div className="hidden md:flex md:items-center md:space-x-8 md:space-x-reverse">
              <Link to="/home" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                דף הבית
              </Link>
              <Link to="/blocks" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                בלוקים ומגנטים
              </Link>
              <Link to="/editor" className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium">
                עורך הקולאז'ים
              </Link>
            </div>

            {/* צד שמאל - עגלה ותפריט מובייל */}
            <div className="flex items-center space-x-4 space-x-reverse">
              <Link to="/cart" className="p-2 text-gray-600 hover:text-blue-600 relative">
                <ShoppingCart size={24} />
                {/* כאן יכול להיות מונה פריטים אם תרצה */}
              </Link>

              {/* כפתור המבורגר למובייל */}
              <div className="md:hidden">
                <button
                  onClick={() => setIsMenuOpen(!isMenuOpen)}
                  className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none"
                >
                  {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- תפריט מובייל (נפתח/נסגר) --- */}
        {isMenuOpen && (
          <div className="md:hidden bg-white border-t">
            <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
              <Link to="/home" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                דף הבית
              </Link>
              <Link to="/blocks" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                בלוקים ומגנטים
              </Link>
              <Link to="/editor" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                עורך הקולאז'ים
              </Link>
              <Link to="/cart" className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50">
                עגלת קניות
              </Link>
            </div>
          </div>
        )}
      </nav>

      {/* --- כאן מוצג התוכן של הדפים השונים --- */}
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <Outlet />
      </main>

    </div>
  );
};

export default Layout;