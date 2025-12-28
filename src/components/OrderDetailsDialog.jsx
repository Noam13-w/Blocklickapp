import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Download,
  CheckCircle,
  Clock,
  User,
  Mail,
  Phone,
  Package,
  Calendar,
  CreditCard,
  Loader2
} from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { base44 } from '@/api/base44Client';

export default function OrderDetailsDialog({ order, open, onOpenChange, onUpdateOrder }) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState('');

  // פונקציה להמרת תאריך לזמן ישראל
  const formatIsraeliDate = (dateString) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        throw new Error("Invalid date string");
      }
      return format(date, 'd MMMM yyyy, HH:mm', { locale: he });
    } catch (error) {
      console.error("Error formatting Israeli date:", error);
      const fallbackDate = new Date(dateString);
      if (!isNaN(fallbackDate.getTime())) {
        return format(fallbackDate, 'd MMMM yyyy, HH:mm', { locale: he });
      }
      return dateString;
    }
  };

  const orientationNames = {
    portrait: 'לאורך',
    landscape: 'לרוחב'
  };

  const getItemDescription = (type, size, orientation = null) => {
    const typeNames = {
      block: 'בלוק עץ',
      magnet: 'מגנט',
      photo: 'תמונה',
      bookmark: 'סימניה'
    };

    const typeName = typeNames[type] || 'פריט';

    if (orientation) {
      const orientationText = orientationNames[orientation] || 'לאורך';
      return `${typeName} ${size} ס"מ - ${orientationText}`;
    }

    return `${typeName} ${size} ס"מ`;
  };

  // קיבוץ פריטים לפי תמונה וסוג
  const groupedItems = React.useMemo(() => {
    if (!order || !order.items) return [];

    const groups = {};
    order.items.forEach(item => {
      const key = `${item.image_url}_${item.size}_${item.type}_${item.orientation || ''}`;
      if (!groups[key]) {
        groups[key] = {
          ...item,
          totalQuantity: 0,
          totalPrice: 0
        };
      }
      groups[key].totalQuantity += item.quantity;
      groups[key].totalPrice += (item.price * item.quantity);
    });

    return Object.values(groups);
  }, [order]);

  // פונקציה ליצירת סיכום ההזמנה מעוצב ב-RTL
  const getOrderSummary = React.useMemo(() => {
    if (!order || !order.items || !Array.isArray(order.items)) return [];

    const summary = {};
    order.items.forEach(item => {
      let itemType = '';
      switch (item.type) {
        case 'block':
          itemType = 'בלוקי עץ';
          break;
        case 'magnet':
          itemType = 'מגנטים';
          break;
        case 'photo':
          itemType = 'תמונות';
          break;
        case 'bookmark':
          itemType = 'סימניות';
          break;
        default:
          itemType = item.type;
      }
      const key = `${itemType} ${item.size || ''}`.trim();
      if (!summary[key]) {
        summary[key] = 0;
      }
      summary[key] += item.quantity;
    });
    
    return Object.entries(summary).map(([key, count]) => ({
      text: key,
      count: count
    }));
  }, [order]);

  const handleStatusToggle = async () => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
      const newStatus = order.status === 'pending' ? 'processing' :
                       order.status === 'processing' ? 'completed' : 'pending';

      const updateData = {
        ...order,
        status: newStatus,
        order_number: order.order_number || order.id,
        total_price: order.total_price || order.price || 0
      };

      const { id, created_date, updated_date, created_by_id, created_by, is_sample, ...cleanUpdateData } = updateData;

      await base44.entities.Order.update(order.id, cleanUpdateData);
      onUpdateOrder();
    } catch (err) {
      console.error('Error updating order status:', err);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleToggleStep = async (stepKey) => {
    if (!order) return;
    
    setIsUpdating(true);
    try {
        const updatedProductionSteps = {
            ...order.production_steps,
            [stepKey]: !order.production_steps[stepKey]
        };

        const updateData = {
            ...order,
            production_steps: updatedProductionSteps,
            order_number: order.order_number || order.id,
            total_price: order.total_price || order.price || 0
        };

        const { id, created_date, updated_date, created_by_id, created_by, is_sample, ...cleanUpdateData } = updateData;

        await base44.entities.Order.update(order.id, cleanUpdateData);
        onUpdateOrder();
    } catch (err) {
        console.error(`Error toggling production step ${stepKey}:`, err);
    } finally {
        setIsUpdating(false);
    }
  };

  const getFilePrefix = (type) => {
    const prefixes = {
      block: 'B',
      photo: 'P',
      magnet: 'M',
      bookmark: 'BM'
    };
    return prefixes[type] || 'X';
  };

  const handleDownloadImage = async (imageUrl, index) => {
    if (!imageUrl) {
        console.error('No image URL provided for download.');
        return;
    }
    try {
        setIsDownloading(true);
        setDownloadProgress(`מוריד תמונה ${index + 1}...`);
        
        const response = await fetch(imageUrl);
        const blob = await response.blob();
        
        const blobUrl = window.URL.createObjectURL(blob);
        
        // קבלת פרטי הפריט
        const item = groupedItems[index];
        const prefix = getFilePrefix(item.type);
        const sizeCode = item.size ? item.size.replace('x', '').replace(/\s/g, '') : '';
        
        const link = document.createElement('a');
        link.href = blobUrl;
        link.download = `${prefix}${sizeCode}_${order.order_number || order.id}_${index + 1}.jpg`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        window.URL.revokeObjectURL(blobUrl);
        
        setDownloadProgress('');
        setIsDownloading(false);
    } catch (error) {
        console.error('Error downloading image:', error);
        setDownloadProgress('שגיאה בהורדת התמונה');
        setTimeout(() => {
            setDownloadProgress('');
            setIsDownloading(false);
        }, 2000);
    }
  };

  const handleDownloadAllImages = async () => {
    if (!order || !order.items || order.items.length === 0) {
      alert('אין תמונות להורדה');
      return;
    }
    
    try {
        setIsDownloading(true);
        
        if (groupedItems.length === 0) {
            alert('אין תמונות להורדה');
            setIsDownloading(false);
            return;
        }

        for (let i = 0; i < groupedItems.length; i++) {
            const item = groupedItems[i];
            if (!item.image_url) continue;
            
            setDownloadProgress(`מוריד תמונה ${i + 1} מתוך ${groupedItems.length}...`);
            
            const response = await fetch(item.image_url);
            const blob = await response.blob();
            
            const prefix = getFilePrefix(item.type);
            const sizeCode = item.size ? item.size.replace('x', '').replace(/\s/g, '') : '';
            
            const blobUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = blobUrl;
            link.download = `${prefix}${sizeCode}_${order.order_number || order.id}_${i + 1}.jpg`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            window.URL.revokeObjectURL(blobUrl);
            
            if (i < groupedItems.length - 1) {
                await new Promise(resolve => setTimeout(resolve, 300));
            }
        }
        
        setDownloadProgress('');
        setIsDownloading(false);
    } catch (error) {
        console.error('Error downloading images:', error);
        setDownloadProgress('שגיאה בהורדת התמונות');
        setTimeout(() => {
            setDownloadProgress('');
            setIsDownloading(false);
        }, 2000);
    }
  };

  if (!order) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-3">
            <Package className="h-6 w-6 text-blue-600" />
            <span>פרטי הזמנה #{order.order_number || order.id}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* סיכום ההזמנה */}
          {getOrderSummary && getOrderSummary.length > 0 && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 border-2 border-blue-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                <Package className="h-5 w-5 text-blue-600" />
                <span>סיכום ההזמנה</span>
              </h3>
              <div className="space-y-2">
                {getOrderSummary.map((item, idx) => (
                  <div key={idx} className="text-xl font-bold text-blue-700 flex items-center gap-2">
                    <span className="text-2xl">{item.count}</span>
                    <span>{item.text}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* פרטי לקוח */}
          <div className="bg-gradient-to-r from-blue-50 to-cyan-50 rounded-xl p-6 border border-blue-100">
            <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
              <User className="h-5 w-5 text-blue-600" />
              <span>פרטי לקוח</span>
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-3">
                <User className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">שם מלא</p>
                  <p className="font-medium text-slate-800">{order.customer_name}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">טלפון</p>
                  <p className="font-medium text-slate-800" dir="ltr" style={{textAlign: 'right'}}>{order.customer_phone}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 md:col-span-2">
                <Mail className="h-4 w-4 text-slate-500" />
                <div>
                  <p className="text-xs text-slate-500">אימייל</p>
                  <p className="font-medium text-slate-800">{order.customer_email}</p>
                </div>
              </div>
            </div>
            {order.notes && (
              <div className="mt-4 bg-white/50 rounded-lg p-3">
                <p className="text-xs text-slate-500 mb-1">הערות</p>
                <p className="text-sm text-slate-700">{order.notes}</p>
              </div>
            )}
          </div>

          {/* סטטוס תשלום והזמנה */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <CreditCard className="h-5 w-5 text-green-600" />
                  <span>סטטוס תשלום</span>
                </h3>
                <Badge className={order.is_paid ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                  {order.is_paid ? 'שולם' : 'לא שולם'}
                </Badge>
              </div>
            </div>

            <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-xl p-6 border border-amber-100">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                  <Package className="h-5 w-5 text-amber-600" />
                  <span>סטטוס הזמנה</span>
                </h3>
                <Badge className={
                    order.status === 'completed' ? 'bg-green-500 text-white' :
                    order.status === 'processing' ? 'bg-blue-500 text-white' :
                    'bg-yellow-500 text-white'
                }>
                  {order.status === 'pending' ? 'ממתין' : order.status === 'processing' ? 'בטיפול' : 'הושלם'}
                </Badge>
              </div>
            </div>
          </div>

          {/* פריטים בהזמנה */}
          <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-100">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                    <Package className="h-5 w-5 text-purple-600" />
                    <span>פריטים בהזמנה</span>
                </h3>
                <Button
                    onClick={handleDownloadAllImages}
                    disabled={isDownloading}
                    variant="outline"
                    size="sm"
                    className="flex items-center gap-2 hover:bg-purple-100"
                >
                    {isDownloading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Download className="h-4 w-4" />
                    )}
                    <span>הורד את כל התמונות</span>
                </Button>
            </div>
            
            {isDownloading && downloadProgress && (
                <div className="mb-4 bg-white/50 rounded-lg p-3 flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-purple-600" />
                    <span className="text-sm text-slate-700">{downloadProgress}</span>
                </div>
            )}

            <div className="space-y-3">
                {groupedItems.length > 0 ? (
                    groupedItems.map((group, index) => (
                        <div key={index} className="bg-white rounded-lg p-4 border border-slate-200">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2 flex-wrap">
                                        <span className="font-semibold text-slate-800">
                                            {getItemDescription(group.type, group.size, group.orientation)}
                                        </span>
                                        <Badge variant="outline" className="bg-slate-50">
                                            <span>כמות: </span>
                                            <span className="font-bold">{group.totalQuantity}</span>
                                        </Badge>
                                    </div>
                                    <p className="text-sm text-slate-600">
                                        <span>מחיר יחידה: </span>
                                        <span className="font-semibold">₪{group.price.toFixed(2)}</span>
                                    </p>
                                    <p className="text-sm font-semibold text-slate-800">
                                        <span>סה"כ: </span>
                                        <span className="text-lg">₪{(group.price * group.totalQuantity).toFixed(2)}</span>
                                    </p>
                                </div>
                                <div className="flex flex-col gap-2">
                                    {group.image_url && (
                                        <>
                                            <img 
                                                src={group.image_url} 
                                                alt={`פריט ${index + 1}`} 
                                                className="w-20 h-20 object-cover rounded-lg border border-slate-200"
                                            />
                                            <Button
                                                onClick={() => handleDownloadImage(group.image_url, index)}
                                                disabled={isDownloading}
                                                variant="outline"
                                                size="sm"
                                                className="text-xs flex items-center gap-1 hover:bg-slate-100"
                                            >
                                                <Download className="h-3 w-3" />
                                                <span>הורד</span>
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <p className="text-slate-500">אין פריטים בהזמנה זו.</p>
                )}
            </div>
          </div>

          {/* סיכום תשלום */}
          <div className="bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4">סיכום תשלום</h3>
              <div className="space-y-2">
                  {order.original_price && order.original_price !== order.total_price && (
                      <>
                          <div className="flex justify-between text-slate-600">
                              <span>מחיר מקורי:</span>
                              <span className="font-semibold">₪{order.original_price.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-red-600">
                              <span>הנחה {order.coupon_code ? `(${order.coupon_code})` : ''}:</span>
                              <span className="font-semibold">-₪{(order.discount_amount || (order.original_price - order.total_price)).toFixed(2)}</span>
                          </div>
                          <div className="border-t border-slate-300 pt-2"></div>
                      </>
                  )}
                  <div className="flex justify-between text-xl font-bold text-slate-800">
                      <span>סה"כ לתשלום:</span>
                      <span className="text-green-600">₪{order.total_price.toFixed(2)}</span>
                  </div>
              </div>
          </div>

          {/* שלבי ייצור */}
          {order.production_steps && (
              <div className="bg-gradient-to-r from-indigo-50 to-blue-50 rounded-xl p-6 border border-indigo-100">
                  <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                      <CheckCircle className="h-5 w-5 text-indigo-600" />
                      <span>שלבי ייצור</span>
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {[
                          { key: 'image_prepared', label: 'תמונה מוכנה', icon: CheckCircle },
                          { key: 'printed', label: 'הודפס', icon: CheckCircle },
                          { key: 'cut', label: 'נחתך', icon: CheckCircle },
                          { key: 'finished', label: 'הושלם', icon: CheckCircle }
                      ].map((step) => {
                          const StepIcon = step.icon;
                          const isCompleted = order.production_steps[step.key];
                          return (
                              <button
                                  key={step.key}
                                  onClick={() => handleToggleStep(step.key)}
                                  disabled={isUpdating}
                                  className={`p-3 rounded-lg border-2 transition-all duration-200 ${
                                      isCompleted
                                          ? 'bg-green-100 border-green-300 text-green-700'
                                          : 'bg-white border-slate-200 text-slate-500 hover:border-slate-300'
                                  }`}
                              >
                                  <div className="flex flex-col items-center gap-2">
                                      <StepIcon className={`h-6 w-6 ${isCompleted ? 'text-green-600' : 'text-slate-400'}`} />
                                      <span className="text-sm font-medium">{step.label}</span>
                                  </div>
                              </button>
                          );
                      })}
                  </div>
              </div>
          )}

          {/* תאריך יצירה */}
          <div className="flex items-center gap-2 text-slate-600 text-sm">
              <Calendar className="h-4 w-4" />
              <span>נוצר בתאריך: {formatIsraeliDate(order.created_date)}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}