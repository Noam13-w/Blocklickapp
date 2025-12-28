import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// ייבוא העמודים
import Layout from './Layout';
import Home from './Home';
import Blocks from './Blocks';
import CartPage from './CartPage';
import AdminPanel from './AdminPanel';

// 👇 התיקון: שינינו את השם מ-CollageEditor ל-CollageLayout
import CollageEditor from '../components/collage/CollageLayout';

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        {/* הגדרת המסגרת הראשית */}
        <Route path="/" element={<Layout />}>
          
          {/* הפניה אוטומטית לדף הבית */}
          <Route index element={<Navigate to="/home" replace />} />

          {/* רשימת העמודים */}
          <Route path="home" element={<Home />} />
          <Route path="blocks" element={<Blocks />} />
          <Route path="editor" element={<CollageEditor />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="admin" element={<AdminPanel />} />

          {/* דף שגיאה 404 */}
          <Route path="*" element={<div className="text-center p-10">404 - עמוד לא נמצא</div>} />
          
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;