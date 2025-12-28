import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// ייבוא כל העמודים בפרויקט
import Layout from './Layout';
import Home from './Home';
import Blocks from './Blocks';
import CartPage from './CartPage';
import AdminPanel from './AdminPanel';
// שים לב: העורך נמצא בתיקייה אחרת
import CollageEditor from '../components/collage/CollageEditor';

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        {/* הגדרת המסגרת הראשית (התפריט) */}
        <Route path="/" element={<Layout />}>
          
          {/* הפניה אוטומטית מהראשי ל-Home */}
          <Route index element={<Navigate to="/home" replace />} />

          {/* רשימת כל העמודים */}
          <Route path="home" element={<Home />} />
          <Route path="blocks" element={<Blocks />} />
          <Route path="editor" element={<CollageEditor />} />
          <Route path="cart" element={<CartPage />} />
          <Route path="admin" element={<AdminPanel />} />

          {/* דף שגיאה אם הכתובת לא קיימת */}
          <Route path="*" element={<div className="text-center p-10">404 - עמוד לא נמצא</div>} />
          
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;