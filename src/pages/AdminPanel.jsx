import React, { useState } from 'react';

const AdminPanel = () => {
  const [activeTab, setActiveTab] = useState('orders');

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">פנל ניהול</h1>
      
      {/* סרגל ניווט פנימי */}
      <div className="flex space-x-4 space-x-reverse mb-6 border-b">
        <button 
          onClick={() => setActiveTab('orders')}
          className={`pb-2 px-4 ${activeTab === 'orders' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
        >
          הזמנות אחרונות
        </button>
        <button 
          onClick={() => setActiveTab('coupons')}
          className={`pb-2 px-4 ${activeTab === 'coupons' ? 'border-b-2 border-blue-600 text-blue-600 font-bold' : 'text-gray-500'}`}
        >
          ניהול קופונים
        </button>
      </div>

      {/* תוכן הדף */}
      <div className="bg-white rounded-lg shadow p-8 min-h-[400px]">
        {activeTab === 'orders' && (
          <div className="text-center text-gray-500 mt-10">
            <h3 className="text-xl">אין הזמנות חדשות כרגע</h3>
            <p>ההזמנות יופיעו כאן ברגע שלקוחות יבצעו רכישה.</p>
          </div>
        )}

        {activeTab === 'coupons' && (
          <div className="text-center text-gray-500 mt-10">
            <h3 className="text-xl">מערכת קופונים</h3>
            <p>כאן תוכל להוסיף ולנהל קופונים בעתיד.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminPanel;