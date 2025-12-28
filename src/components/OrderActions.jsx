import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Home, ShoppingCart, Package, X, CheckCircle, Loader2, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function OrderActions({ onFinishOrder, currentItems, onRemoveItem }) {
  const totalPrice = currentItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
  const pendingUploads = currentItems.filter(item => item.uploadStatus === 'pending').length;
  const failedUploads = currentItems.filter(item => item.uploadStatus === 'failed').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-2xl mx-auto"
    >
      <div className="text-center space-y-4 mb-8">
        <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto">
          <Package className="h-8 w-8 text-amber-600" />
        </div>
        <h3 className="text-2xl font-bold text-slate-800">סל הקניות שלי</h3>
        
        <div className="bg-slate-50 rounded-xl p-4 space-y-2">
          <p className="text-sm text-slate-600">פריטים בהזמנה: {currentItems.length}</p>
          <p className="text-xl font-bold text-slate-800">סה״כ: ₪{totalPrice}</p>
          {pendingUploads > 0 && (
            <p className="text-xs text-blue-600">מעלה {pendingUploads} תמונות ברקע...</p>
          )}
          {failedUploads > 0 && (
            <p className="text-xs text-red-600">{failedUploads} תמונות נכשלו בהעלאה</p>
          )}
        </div>
      </div>

      {/* רשימת פריטים */}
      <div className="space-y-4 mb-8 max-h-96 overflow-y-auto">
        {currentItems.map((item, index) => (
          <div key={item.id || index} className="border border-slate-200 rounded-xl p-4">
            <div className="flex items-start gap-4">
              {/* תמונת תצוגה מקדימה */}
              <div className="relative">
                <img 
                  src={item.previewUrl} 
                  alt={`${item.type === 'block' ? 'בלוק' : item.type === 'magnet' ? 'מגנט' : 'תמונה'} ${index + 1}`}
                  className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                />
                {item.uploadStatus === 'pending' && (
                  <div className="absolute inset-0 bg-black/30 rounded-lg flex items-center justify-center">
                    <Loader2 className="h-5 w-5 animate-spin text-white" />
                  </div>
                )}
                {item.uploadStatus === 'completed' && (
                  <div className="absolute -top-2 -right-2 bg-green-500 rounded-full p-1">
                    <CheckCircle className="h-4 w-4 text-white" />
                  </div>
                )}
                {item.uploadStatus === 'failed' && (
                  <div className="absolute -top-2 -right-2 bg-red-500 rounded-full p-1">
                    <XCircle className="h-4 w-4 text-white" />
                  </div>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <div>
                    <h4 className="font-semibold text-slate-800">
                      {item.type === 'block' && `בלוק ${item.size}`}
                      {item.type === 'magnet' && `מגנט ${item.size}`}
                      {item.type === 'photo' && `תמונה ${item.size}`}
                    </h4>
                    <p className="text-sm text-slate-600">
                      {item.orientation === 'portrait' ? 'לאורך' : 'לרוחב'} • כמות: {item.quantity}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      {item.uploadStatus === 'pending' && (
                        <div className="flex items-center gap-1">
                          <Loader2 className="h-3 w-3 animate-spin text-blue-500" />
                          <span className="text-xs text-blue-600">מעלה תמונה...</span>
                        </div>
                      )}
                      {item.uploadStatus === 'completed' && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3 text-green-500" />
                          <span className="text-xs text-green-600">תמונה הועלתה</span>
                        </div>
                      )}
                      {item.uploadStatus === 'failed' && (
                        <div className="flex items-center gap-1">
                          <XCircle className="h-3 w-3 text-red-500" />
                          <span className="text-xs text-red-600">שגיאה בהעלאה</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-left space-y-2">
                    <p className="font-bold text-lg text-slate-800">₪{item.price * item.quantity}</p>
                    <Button
                      onClick={() => onRemoveItem(item.id)}
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200"
                    >
                      <X className="h-4 w-4 ml-1" />
                      הסר
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to={createPageUrl("Home")}>
            <Button
              variant="outline"
              className="w-full py-4 text-lg font-semibold rounded-xl border-2 border-slate-400 text-slate-700 hover:bg-slate-50 hover:border-slate-500 transition-all duration-200"
            >
              <Home className="ml-2 h-5 w-5" />
              חזרה למסך הבית
            </Button>
          </Link>

          <Button
            onClick={onFinishOrder}
            disabled={failedUploads > 0}
            className="w-full py-4 text-lg font-semibold rounded-xl bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <ShoppingCart className="ml-2 h-5 w-5" />
            {failedUploads > 0 ? 'יש תמונות שנכשלו בהעלאה' : 'המשך לתשלום'}
          </Button>
        </div>
      </div>
    </motion.div>
  );
}