import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';

// ייבוא הרכיבים (ודא שהשמות תואמים לקבצים שלך)
import Layout from './Layout';
import Home from './Home';
import Blocks from './Blocks';
import CollageEditor from '../components/collage/CollageEditor';
import AdminPanel from './AdminPanel';
import CartPage from './CartPage';
// אם יש עוד עמודים, ודא שהם מיובאים כאן

const AppRoutes = () => {
  return (
    <HashRouter>
      <Routes>
        {/* העוטף הראשי - Layout */}
        <Route path="/" element={<Layout />}>
          
          {/* 1. הפניה אוטומטית: מי שמגיע לריק, עף ל-home */}
          <Route index element={<Navigate to="/home" replace />} />

          {/* 2. הגדרת העמודים */}
          <Route path="home" element={<Home />} />
          <Route path="blocks" element={<Blocks />} />
          <Route path="editor" element={<CollageEditor />} />
          <Route path="admin" element={<AdminPanel />} />
          <Route path="cart" element={<CartPage />} />

          {/* דף 404 - לכל מה שלא נמצא */}
          <Route path="*" element={<div className="p-10 text-center">העמוד לא נמצא 404</div>} />
        
        </Route>
      </Routes>
    </HashRouter>
  );
};

export default AppRoutes;