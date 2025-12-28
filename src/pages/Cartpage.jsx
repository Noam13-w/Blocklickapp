import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { useCart } from '@/components/GlobalCart';
import { Order } from '@/api/entities';
import { Coupon } from '@/api/entities';
import { User } from '@/api/entities';
import { SendEmail, UploadFile } from '@/api/integrations';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ShoppingCart, Trash2, Home, CheckCircle, X, Loader2, Package, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import toast, { Toaster } from 'react-hot-toast';
import EmptyState from '@/components/EmptyState';
import ImageWithLoader from '@/components/ImageWithLoader';
import { AnimatePresence } from 'framer-motion';

export default function Cart() {
  // SEO for Cart page
  React.useEffect(() => {
    document.title = 'סל קניות - השלמת הזמנה | בלוקליק';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'השלימו את הזמנתכם לפיתוח תמונות, אינסטה בלוק וצילום מגנטים. תשלום נוח ואיסוף עצמי מקרני שומרון.');
  }, []);

  const { cartItems, removeFromCart, clearCart } = useCart();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [error, setError] = useState('');

  // פרטי הזמנה
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });

  // קופון
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  // תקנון
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [showTermsDialog, setShowTermsDialog] = useState(false);

  // קיבוץ פריטים לפי תמונה, סוג וגודל
  const groupedItems = React.useMemo(() => {
    const groups = {};
    cartItems.forEach(item => {
      // הסרת לוגיקת הסימניות
      const key = `${item.image_url}_${item.type}_${item.size}`;
      
      if (!groups[key]) {
        groups[key] = {
          ...item,
          totalQuantity: 0,
          items: []
        };
      }
      groups[key].totalQuantity += item.quantity;
      groups[key].items.push(item);
    });
    return Object.values(groups);
  }, [cartItems]);

  const generateOrderNumber = () => {
    const timestamp = Date.now().toString();
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `BL${timestamp.slice(-6)}${random}`;
  };

  // Override getTotalPrice to remove bookmark logic
  const getTotalPrice = useCallback(() => {
    return cartItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0;
      const itemQuantity = parseInt(item.quantity) || 1;
      
      return sum + (itemPrice * itemQuantity);
    }, 0);
  }, [cartItems]);

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) {
      setCouponError('יש להזין קוד קופון');
      return;
    }

    setIsCheckingCoupon(true);
    setCouponError('');

    try {
      const coupons = await Coupon.filter({ code: couponCode.toUpperCase(), is_active: true });

      if (coupons.length === 0) {
        setCouponError('קוד קופון לא תקין או לא פעיל');
        setAppliedCoupon(null);
        return;
      }

      const coupon = coupons[0];

      // בדיקת תאריכי תוקף
      const now = new Date();
      if (coupon.valid_from && new Date(coupon.valid_from) > now) {
        setCouponError('הקופון עדיין לא תקף');
        setAppliedCoupon(null);
        return;
      }

      if (coupon.valid_until && new Date(coupon.valid_until) < now) {
        setCouponError('הקופון פג תוקף');
        setAppliedCoupon(null);
        return;
      }

      // בדיקת מגבלת שימושים
      if (coupon.usage_limit && coupon.usage_count >= coupon.usage_limit) {
        setCouponError('הקופון הגיע למגבלת השימושים');
        setAppliedCoupon(null);
        return;
      }

      // בדיקת סכום מינימלי
      const currentTotal = getTotalPrice();
      if (coupon.min_order_amount && currentTotal < coupon.min_order_amount) {
        setCouponError(`סכום הזמנה מינימלי: ₪${coupon.min_order_amount}`);
        setAppliedCoupon(null);
        return;
      }

      // בדיקת מוצרים רלוונטיים
      if (coupon.applicable_products && coupon.applicable_products.length > 0) {
        const hasApplicableProducts = cartItems.some(item =>
          coupon.applicable_products.includes(item.type)
        );

        if (!hasApplicableProducts) {
          const productNames = {
            block: 'בלוקי עץ',
            magnet: 'מגנטים',
            photo: 'תמונות'
          };
          const applicableNames = coupon.applicable_products
            .map(p => productNames[p])
            .filter(name => name)
            .join(', ');
          setCouponError(`הקופון חל רק על: ${applicableNames}`);
          setAppliedCoupon(null);
          return;
        }
      }

      setAppliedCoupon(coupon);
      setCouponError('');

    } catch (error) {
      console.error('Error applying coupon:', error);
      setCouponError('שגיאה בבדיקת הקופון');
      setAppliedCoupon(null);
    } finally {
      setIsCheckingCoupon(false);
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  const calculateTotalWithDiscount = () => {
    const originalTotal = getTotalPrice();
    if (!appliedCoupon) return originalTotal;

    let applicableTotal = originalTotal;

    // אם הקופון חל על מוצרים מסוימים, חשב רק את המחיר שלהם
    if (appliedCoupon.applicable_products && appliedCoupon.applicable_products.length > 0) {
      applicableTotal = cartItems
        .filter(item => appliedCoupon.applicable_products.includes(item.type))
        .reduce((sum, item) => {
          const itemPrice = parseFloat(item.price) || 0;
          const itemQuantity = parseInt(item.quantity) || 1;
          
          return sum + (itemPrice * item.quantity);
        }, 0);
    }

    let discountAmount = 0;
    if (appliedCoupon.discount_type === 'percentage') {
      discountAmount = (applicableTotal * appliedCoupon.discount_value) / 100;
      
      // הגבלת הנחה מקסימלית (אם קיימת בקופון)
      if (appliedCoupon.max_discount_amount && discountAmount > appliedCoupon.max_discount_amount) {
        discountAmount = appliedCoupon.max_discount_amount;
      }
    } else { // Fixed amount discount
      discountAmount = Math.min(appliedCoupon.discount_value, applicableTotal);
    }

    // Ensure the discount amount doesn't exceed the original total
    discountAmount = Math.min(discountAmount, originalTotal);

    return Math.max(0, originalTotal - discountAmount);
  };

  const getDiscountAmount = () => {
    const originalTotal = getTotalPrice();
    const finalTotal = calculateTotalWithDiscount();
    return originalTotal - finalTotal;
  };

  const handleSubmitOrder = async (e) => {
    e.preventDefault();
    if (cartItems.length === 0) {
      setError('הסל ריק. אנא הוסף פריטים לפני שליחת ההזמנה.');
      return;
    }

    if (!termsAccepted) {
      setError('יש לאשר את התקנון לפני שליחת ההזמנה');
      return;
    }

    // בדיקת מינימום - הסרת בדיקת סימניות
    setIsSubmitting(true);
    setError('');

    try {
      const newOrderNumber = generateOrderNumber();
      const originalTotal = getTotalPrice();
      const finalTotal = calculateTotalWithDiscount();
      const discountAmount = originalTotal - finalTotal;

      localStorage.setItem('blockclick_order_total', finalTotal.toString());

      // וידוא שכל הפריטים הם עם URLs תקינים מהשרת
      const processedItems = cartItems.map(item => {
        if (!item.image_url || item.image_url.startsWith('blob:')) {
          throw new Error('פריט בסל עדיין לא הועלה לשרת');
        }

        return {
          type: item.type,
          size: item.size,
          price: parseFloat(item.price) || 0,
          orientation: item.orientation || 'portrait',
          quantity: parseInt(item.quantity) || 1,
          image_url: item.image_url,
          crop_data: item.crop_data || {}
        };
      });

      // יצירת פירוט פריטים
      const itemsSummary = {};
      processedItems.forEach(item => {
        const key = `${item.type}_${item.size}`;
        if (!itemsSummary[key]) {
          itemsSummary[key] = {
            type: item.type,
            size: item.size,
            count: 0
          };
        }
        itemsSummary[key].count += item.quantity;
      });

      const summaryText = Object.values(itemsSummary).map(item => {
        const typeName = item.type === 'block' ? 'בלוקים' : item.type === 'magnet' ? 'מגנטים' : 'תמונות';
        return `${item.count} ${typeName} ${item.size || ''}`.trim();
      }).join('\n');

      const totalItemsCount = processedItems.reduce((sum, item) => sum + item.quantity, 0);

      const orderData = {
        order_number: newOrderNumber,
        customer_name: formData.customer_name,
        customer_email: formData.customer_email,
        customer_phone: formData.customer_phone,
        items: processedItems,
        total_price: parseFloat(finalTotal.toFixed(2)),
        original_price: parseFloat(originalTotal.toFixed(2)),
        discount_amount: parseFloat(discountAmount.toFixed(2)),
        coupon_code: appliedCoupon?.code || null,
        notes: formData.notes,
        status: 'pending',
        is_paid: false,
        production_steps: { image_prepared: false, printed: false, cut: false, finished: false }
      };

      console.log('Creating order with processed items:', orderData);

      await Order.create(orderData);

      // שליחת מיילים
      try {
        const businessEmail = "blocklick1@gmail.com"; // מייל העסק

        // מייל מעוצב למנהל העסק - עם קיבוץ פריטים
        const groupedItemsForEmail = {};
        processedItems.forEach(item => {
          const key = `${item.image_url}_${item.type}_${item.size}`;
          
          if (!groupedItemsForEmail[key]) {
            groupedItemsForEmail[key] = {
              ...item,
              totalQuantity: 0,
              totalPrice: 0
            };
          }
          groupedItemsForEmail[key].totalQuantity += item.quantity;
          groupedItemsForEmail[key].totalPrice += (item.price * item.quantity);
        });

        const itemsList = Object.values(groupedItemsForEmail).map((item, index) => {
          let itemType, itemSizeDisplay, imageUrlDisplay;
          switch (item.type) {
            case 'block':
              itemType = 'בלוק עץ';
              itemSizeDisplay = `גודל: ${item.size}`;
              imageUrlDisplay = `<a href="${item.image_url}" target="_blank" style="background: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px;">צפה בתמונה</a>`;
              break;
            case 'magnet':
              itemType = 'מגנט';
              itemSizeDisplay = `גודל: ${item.size}`;
              imageUrlDisplay = `<a href="${item.image_url}" target="_blank" style="background: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px;">צפה בתמונה</a>`;
              break;
            case 'photo':
              itemType = 'תמונה';
              itemSizeDisplay = `גודל: ${item.size}`;
              imageUrlDisplay = `<a href="${item.image_url}" target="_blank" style="background: #3b82f6; color: white; padding: 8px 16px; text-decoration: none; border-radius: 6px; font-size: 12px;">צפה בתמונה</a>`;
              break;
            default:
              itemType = 'פריט לא ידוע';
              itemSizeDisplay = '';
              imageUrlDisplay = '';
          }
          
          return `
            <tr style="border-bottom: 1px solid #e5e7eb;">
              <td style="padding: 15px; text-align: right; font-weight: bold; color: #1f2937;">${index + 1}</td>
              <td style="padding: 15px; text-align: right;">
                <div style="font-weight: bold; color: #1f2937; margin-bottom: 5px;">${itemType}</div>
                <div style="color: #6b7280; font-size: 14px;">${itemSizeDisplay}</div>
              </td>
              <td style="padding: 15px; text-align: center; font-weight: bold; color: #1f2937;">${item.totalQuantity}</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; color: #059669;">&#8362;${item.price.toFixed(2)}</td>
              <td style="padding: 15px; text-align: right; font-weight: bold; color: #059669;">&#8362;${item.totalPrice.toFixed(2)}</td>
              <td style="padding: 15px; text-align: center;">
                ${imageUrlDisplay}
              </td>
            </tr>
          `;
        }).join('');

        // מייל מעוצב למנהל העסק
        const businessEmailBody = `
<!DOCTYPE html>
<html dir="rtl" lang="he">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>הזמנה חדשה - בלוקליק</title>
</head>
<body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; margin: 0; padding: 20px; background-color: #f3f4f6; direction: rtl;">
    <div style="max-width: 800px; margin: 0 auto; background: white; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); overflow: hidden;">
        <div style="background: linear-gradient(135deg, #3b82f6, #1d4ed8); color: white; padding: 30px; text-align: center;">
            <h1 style="margin: 0; font-size: 32px; font-weight: bold;">&#127881; הזמנה חדשה!</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; opacity: 0.9;">בלוקליק - הדפסות איכותיות</p>
        </div>
        <div style="padding: 30px;">
            <div style="background: #f8fafc; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-right: 4px solid #3b82f6;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">&#128203; פרטי ההזמנה</h2>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div>
                        <strong style="color: #374151;">&#127381; מספר הזמנה:</strong><br>
                        <span style="font-size: 18px; font-weight: bold; color: #3b82f6;">#${newOrderNumber}</span>
                    </div>
                    <div>
                        <strong style="color: #374151;">&#128197; תאריך:</strong><br>
                        <span>${new Date().toLocaleDateString('he-IL')} בשעה ${new Date().toLocaleTimeString('he-IL')}</span>
                    </div>
                </div>
            </div>
            <div style="background: #f0f9ff; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-right: 4px solid #0ea5e9;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">&#128100; פרטי לקוח</h2>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px;">
                    <div><strong style="color: #374151;">&#128100; שם:</strong><br><span>${formData.customer_name}</span></div>
                    <div><strong style="color: #374151;">&#128231; אימייל:</strong><br><span>${formData.customer_email}</span></div>
                    <div><strong style="color: #374151;">&#128222; טלפון:</b><br><span>${formData.customer_phone}</span></div>
                </div>
                ${formData.notes ? `<div style="margin-top: 15px;"><strong style="color: #374151;">&#128221; הערות:</strong><br><span style="background: white; padding: 10px; border-radius: 6px; display: block; margin-top: 5px;">${formData.notes}</span></div>` : ''}
            </div>
            <div style="background: #fef7f0; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-right: 4px solid #ea580c;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">&#128717; פריטים בהזמנה</h2>
                <table style="width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    <thead><tr style="background: #f3f4f6; color: #374151;">
                        <th style="padding: 15px; text-align: right; font-weight: bold;">#</th>
                        <th style="padding: 15px; text-align: right; font-weight: bold;">פריט</th>
                        <th style="padding: 15px; text-align: center; font-weight: bold;">כמות</th>
                        <th style="padding: 15px; text-align: right; font-weight: bold;">מחיר יחידה</th>
                        <th style="padding: 15px; text-align: right; font-weight: bold;">סה"כ</th>
                        <th style="padding: 15px; text-align: center; font-weight: bold;">תמונה</th>
                    </tr></thead>
                    <tbody>${itemsList}</tbody>
                </table>
            </div>
            <div style="background: #f0fdf4; border-radius: 8px; padding: 20px; margin-bottom: 25px; border-right: 4px solid #22c55e;">
                <h2 style="margin: 0 0 15px 0; color: #1f2937; font-size: 20px;">&#128176; סיכום תשלום</h2>
                <div style="background: white; border-radius: 6px; padding: 15px;">
                    ${originalTotal !== finalTotal ? `<div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #6b7280;"><span>מחיר מקורי:</span><span>&#8362;${originalTotal.toFixed(2)}</span></div><div style="display: flex; justify-content: space-between; margin-bottom: 10px; color: #dc2626;"><span>הנחה ${appliedCoupon ? `(${appliedCoupon.code})` : ''}:</span><span>-&#8362;${discountAmount.toFixed(2)}</span></div><hr style="border: none; border-top: 1px solid #e5e7eb; margin: 10px 0;">` : ''}
                    <div style="display: flex; justify-content: space-between; font-size: 20px; font-weight: bold; color: #059669;"><span>סה"כ לתשלום:</span><span>&#8362;${finalTotal.toFixed(2)}</span></div>
                </div>
            </div>
            <div style="background: #fef3c7; border-radius: 8px; padding: 20px; border-right: 4px solid #f59e0b;">
                <h2 style="margin: 0 0 10px 0; color: #92400e; font-size: 18px;">&#128222; פרטי קשר ללקוח</h2>
                <p style="margin: 0; color: #92400e;">
                    שם: ${formData.customer_name}<br>
                    טלפון: <a href="tel:${formData.customer_phone}" style="color: #059669;">${formData.customer_phone}</a><br>
                    אימייל: <a href="mailto:${formData.customer_email}" style="color: #059669;">${formData.customer_email}</a><br>
                    Watsapp: <a href="https://wa.me/972${formData.customer_phone.replace(/\D/g, '').startsWith('0') ? formData.customer_phone.replace(/\D/g, '').slice(1) : formData.customer_phone.replace(/\D/g, '')}" target="_blank" style="color: #25d366;">שלח הודעה</a>
                </p>
            </div>
            <div style="background: #dcfce7; border-radius: 8px; padding: 20px; border-right: 44px solid #16a34a;">
                <h2 style="margin: 0 0 10px 0; color: #166534; font-size: 18px;">&#128172; שלח אישור ללקוח</h2>
                <p style="margin: 0 0 15px 0; color: #166534;">לחץ כאן לשליחת הודעת אישור ללקוח בוואטסאפ:</p>
                <a href="https://wa.me/972${formData.customer_phone.replace(/\D/g, '').startsWith('0') ? formData.customer_phone.replace(/\D/g, '').slice(1) : formData.customer_phone.replace(/\D/g, '')}?text=${encodeURIComponent(`שלום ${formData.customer_name}!

קיבלנו את הזמנתך ואנחנו מתחילים להכין אותה!

פירוט ההזמנה:
${(() => {
  // יצירת סיכום מוצרים לפי סוג וגודל
  const summary = {};
  processedItems.forEach(item => {
    const itemType = item.type === 'block' ? 'בלוקי עץ' : item.type === 'magnet' ? 'מגנטים' : 'תמונות';
    const key = `${itemType} ${item.size || ''}`.trim();
    if (!summary[key]) {
      summary[key] = { count: 0, totalPrice: 0 };
    }
    summary[key].count += item.quantity;
    summary[key].totalPrice += (item.price * item.quantity);
  });
  
  return Object.entries(summary).map(([key, data]) => 
    `• ${data.count} ${key} - ₪${data.totalPrice.toFixed(2)}`
  ).join('\n');
})()}

סה"כ לתשלום: ₪${finalTotal.toFixed(2)}

אפשרויות תשלום:
• ביט: https://www.bitpay.co.il/app/me/0B12350D-8CAE-423A-A293-B024D6F237E6958F
• פייבוקס: 0585802298
• מזומן באיסוף - נא לתאם מראש

זמן הכנה: עד 3 ימי עסקים מרגע קבלת התשלום
מיקום איסוף: הקוממיות 4, קרני שומרון

ניצור איתך קשר כשההזמנה תהיה מוכנה!
תודה שבחרת בבלוקליק`)}" target="_blank" style="background: #25d366; color: white; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                    שלח אישור ללקוח בוואטסאפ
                </a>
            </div>
        </div>
    </div>
</body>
</html>`;

        // שליחה למייל העסק
        await SendEmail({
          to: businessEmail,
          subject: `🎨 הזמנה חדשה #${newOrderNumber} - ${formData.customer_name}`,
          body: businessEmailBody
        });

        console.log('Business email sent successfully');

      } catch (emailError) {
        console.error('Email sending failed, but order was created successfully:', emailError);
      }

      setOrderNumber(newOrderNumber);
      setOrderComplete(true);
      clearCart();

      setTimeout(() => {
        localStorage.removeItem('blockclick_order_total');
      }, 24 * 60 * 60 * 1000);

    } catch (error) {
      console.error('Order creation failed:', error);
      setError('שגיאה ביצירת ההזמנה. אנא נסה שנית.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (orderComplete) {
    const savedOrderTotal = localStorage.getItem('blockclick_order_total');
    const finalTotal = savedOrderTotal ? parseFloat(savedOrderTotal) : 0;

    const cashWhatsappMessage = `היי!

אפשרויות תשלום:
• ביט: https://www.bitpay.co.il/app/me/0B12350D-8CAE-423A-A293-B024D6F237E6958F
• פייבוקס: 0585802298
• מזומן באיסוף - נא לתאם מראש

סה"כ לתשלום: ₪${finalTotal > 0 ? finalTotal.toFixed(2) : '0.00'}

תודה!`;
    const whatsappUrl = `https://wa.me/9720504928189?text=${encodeURIComponent(cashWhatsappMessage)}`;

    return (
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 flex items-center justify-center p-6">
        <Toaster />
        <div className="bg-white rounded-3xl shadow-2xl p-12 text-center max-w-2xl">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="h-10 w-10 text-green-600" />
          </div>
          <h1 className="text-3xl font-bold text-slate-800 mb-4">ההזמנה נשלחה בהצלחה!</h1>
          <div className="bg-slate-50 rounded-2xl p-6 mb-6 text-right">
            <div className="space-y-2 mb-4">
              <p className="text-lg font-semibold text-slate-800">מספר הזמנה: {orderNumber}</p>
              <p className="text-xl font-bold text-green-600">סה״כ לתשלום: ₪{finalTotal > 0 ? finalTotal.toFixed(2) : '0.00'}</p>
            </div>
            <div className="text-sm text-slate-600 leading-relaxed">
              <p className="font-semibold mb-2">אפשרויות תשלום:</p>
              <p className="mb-2">• ביט: <a href="https://www.bitpay.co.il/app/me/0B12350D-8CAE-423A-A293-B024D6F237E6958F" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline font-bold">לחץ לתשלום</a></p>
              <p>• פייבוקס למספר: <span className="font-bold">0585802298</span></p>
              <p>• מזומן באיסוף - צור קשר מראש</p>
              <p className="mt-3 text-xs text-slate-500">לאחר התשלום נתחיל להכין את ההזמנה ונעדכן אותך על מועד האיסוף</p>
            </div>
          </div>
          <p className="text-slate-600 mb-8 leading-relaxed">קיבלנו את הזמנתך ובקרוב תקבל הודעת אישור עם פרטי התשלום והאיסוף. נצור איתך קשר תוך מספר שעות. אין צורך בפעולה נוספת.</p>
          <Link to={createPageUrl("Home")}>
            <Button className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8 py-3 rounded-full font-semibold shadow-lg hover:shadow-xl transition-all duration-200">
              חזרה לעמוד הבית
            </Button>
          </Link>
        </div>
      </motion.div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-amber-50 py-12">
      {/* Toast Notifications - הסרת position bottom-center */}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#fff',
            direction: 'rtl',
          },
        }}
      />
      <div className="container mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-800 mb-2">סל הקניות שלי</h1>
          <p className="text-slate-600">סקור את הפריטים שלך והשלם את ההזמנה</p>
        </div>

        {cartItems.length === 0 ? (
          <EmptyState
            icon={ShoppingCart}
            title="הסל שלך ריק"
            description="הוסף מוצרים כדי להתחיל לקנות ולעצב את הזיכרונות שלך"
            actionText="חזרה לעמוד הבית"
            actionLink="Home"
          />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* פריטים בסל */}
            <div className="lg:col-span-2 space-y-4">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-semibold text-slate-800">פריטים ({cartItems.length})</h2>
                
                {/* כפתור ריקון הסל */}
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    toast((t) => (
                      <div className="flex flex-col gap-3 p-2 text-right" dir="rtl">
                        <div className="flex items-center gap-2">
                          <AlertTriangle className="h-5 w-5 text-orange-500" />
                          <span className="font-semibold text-slate-800">ריקון סל הקניות</span>
                        </div>
                        <p className="text-slate-600 text-sm">
                          האם אתה בטוח שברצונך לרוקן את כל הפריטים מהסל?
                        </p>
                        <div className="flex gap-2 justify-end">
                          <button
                            onClick={() => {
                              toast.dismiss(t.id);
                            }}
                            className="px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded-md transition-colors"
                          >
                            ביטול
                          </button>
                          <button
                            onClick={() => {
                              clearCart();
                              toast.dismiss(t.id);
                              // רק מוחקים את הסל בלי הודעת אישור נוספת
                            }}
                            className="px-3 py-1 text-sm bg-red-500 hover:bg-red-600 text-white rounded-md transition-colors flex items-center gap-1"
                          >
                            <Trash2 className="h-3 w-3" />
                            רוקן סל
                          </button>
                        </div>
                      </div>
                    ), {
                      duration: 10000,
                      style: {
                        background: '#fff',
                        color: '#333',
                        border: '1px solid #e5e7eb',
                        borderRadius: '12px',
                        padding: '16px',
                        boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
                        minWidth: '300px',
                      },
                    });
                  }}
                  className="text-red-500 hover:text-red-700 hover:bg-red-50 border-red-200 flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  רוקן סל
                </Button>
                </motion.div>
              </div>

              {/* רשימת פריטים מקובצים */}
              <div className="space-y-4">
                <AnimatePresence mode="popLayout">
                {groupedItems.map((group, index) => (
                  <motion.div
                    key={`${group.image_url}_${group.type}_${group.size}`}
                    layout
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9, transition: { duration: 0.2 } }}
                    className="bg-white rounded-xl shadow-lg p-6 border border-slate-200"
                  >
                    <div className="flex items-start gap-4">
                      {/* Display image preview */}
                      <div className="w-20 h-20 rounded-lg border border-slate-200 flex items-center justify-center overflow-hidden bg-slate-50">
                        {group.image_url ? (
                          <ImageWithLoader 
                            src={group.image_url} 
                            alt={`תמונה של ${group.type === 'block' ? 'בלוק עץ' : group.type === 'magnet' ? 'מגנט' : 'תמונה'} בגודל ${group.size}`} 
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <Package className="h-8 w-8 text-slate-400" />
                        )}
                      </div>

                      <div className="flex-1">
                        <h3 className="font-semibold text-slate-800">
                          {group.type === 'block' && `בלוק עץ ${group.size}`}
                          {group.type === 'magnet' && `מגנט ${group.size}`}
                          {group.type === 'photo' && `תמונה ${group.size}`}
                        </h3>
                        <p className="text-sm text-slate-600">
                          כמות: {group.totalQuantity}
                        </p>
                        <p className="font-bold text-slate-800">&#8362;{(group.price * group.totalQuantity).toFixed(2)}</p>
                      </div>

                      <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}>
                        <Button
                          onClick={() => {
                            // מחיקת כל הפריטים בקבוצה
                            group.items.forEach(item => removeFromCart(item.id));
                          }}
                          variant="outline"
                          size="sm"
                          className="text-red-500 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            </div>

            {/* טופס הזמנה */}
            <div className="bg-white rounded-xl shadow-lg p-6 h-fit">
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">פרטי ההזמנה</h2>

              <form onSubmit={handleSubmitOrder} className="space-y-4">
                <div>
                  <Label htmlFor="name">שם מלא *</Label>
                  <Input
                    id="name"
                    value={formData.customer_name}
                    onChange={(e) => setFormData({...formData, customer_name: e.target.value})}
                    required
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="email">אימייל *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.customer_email}
                    onChange={(e) => setFormData({...formData, customer_email: e.target.value})}
                    required
                    className="text-right"
                  />
                </div>

                <div>
                  <Label htmlFor="phone">טלפון *</Label>
                  <Input
                    id="phone"
                    value={formData.customer_phone}
                    onChange={(e) => setFormData({...formData, customer_phone: e.target.value})}
                    required
                    className="text-right"
                  />
                </div>

                {/* קופון */}
                <div>
                  <Label>קוד קופון (אופציונלי)</Label>
                  {!appliedCoupon ? (
                    <div className="flex gap-2 mt-2">
                      <Input
                        value={couponCode}
                        onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="הכנס קוד"
                        className="text-right"
                      />
                      <Button
                        type="button"
                        onClick={handleApplyCoupon}
                        disabled={isCheckingCoupon}
                        variant="outline"
                      >
                        {isCheckingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'החל'}
                      </Button>
                    </div>
                  ) : (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mt-2 flex justify-between items-center">
                      <div>
                        <p className="text-green-800 font-medium">קופון: {appliedCoupon.code}</p>
                        <p className="text-green-600 text-sm">
                          הנחה: {appliedCoupon.discount_type === 'percentage'
                            ? `${appliedCoupon.discount_value}%`
                            : `&#8362;${appliedCoupon.discount_value}`
                          }
                        </p>
                      </div>
                      <Button
                        type="button"
                        onClick={handleRemoveCoupon}
                        variant="ghost"
                        size="sm"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                  {couponError && <p className="text-red-600 text-sm mt-1">{couponError}</p>}
                </div>

                <div>
                  <Label htmlFor="notes">הערות</Label>
                  <Textarea
                    id="notes"
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="text-right"
                  />
                </div>

                {/* תקנון */}
                <div className="space-y-2">
                  <div className="flex items-start gap-2">
                    <input
                      type="checkbox"
                      id="terms"
                      checked={termsAccepted}
                      onChange={(e) => setTermsAccepted(e.target.checked)}
                      className="mt-1 h-4 w-4 rounded border-gray-300 text-amber-600 focus:ring-amber-500"
                      required
                    />
                    <label htmlFor="terms" className="text-sm leading-5 text-slate-700">
                      בלחיצה על אישור הזמנה אני מסכים ל
                      <button
                        type="button"
                        onClick={() => setShowTermsDialog(true)}
                        className="text-amber-600 hover:text-amber-700 underline mx-1"
                      >
                        תקנון
                      </button>
                    </label>
                  </div>
                </div>

                {/* סיכום מחירים */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span>סה"כ:</span>
                    <span>&#8362;{getTotalPrice().toFixed(2)}</span>
                  </div>
                  {appliedCoupon && getDiscountAmount() > 0 && (
                    <div className="flex justify-between text-green-600">
                      <span>הנחה ({appliedCoupon.discount_type === 'percentage' ? `${appliedCoupon.discount_value}%` : `&#8362;${appliedCoupon.discount_value}`}):</span>
                      <span>-&#8362;{getDiscountAmount().toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-bold text-lg border-t pt-2">
                    <span>לתשלום:</span>
                    <span className="text-green-600">&#8362;{calculateTotalWithDiscount().toFixed(2)}</span>
                  </div>
                </div>

                {error && <p className="text-red-600 text-center mt-4">{error}</p>}

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 h-12 text-lg font-medium shadow-lg hover:shadow-xl transition-all"
                  >
                    {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mr-2" /> : null}
                    {isSubmitting ? 'שולח הזמנה...' : 'שלח הזמנה'}
                  </Button>
                </motion.div>
              </form>
            </div>
          </div>
        )}
      </div>

      {/* דיאלוג תקנון */}
      <Dialog open={showTermsDialog} onOpenChange={setShowTermsDialog}>
        <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold text-slate-800">תקנון האתר</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-3 text-slate-700 leading-relaxed">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium">1</span>
                <p>אני מסכים שהפרטים שלי יישמרו ויאוחסנו בנתוני האתר על מנת לספק את ההזמנה.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium">2</span>
                <p>אני מסכים שבעלי האתר ייצרו איתי קשר לגבי ההזמנה, מבצעים ומוצרים נוספים.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium">3</span>
                <p>התשלום על ההזמנה יתבצע כמו שרשום ולא יבוצעו החזרים אלא אם המוצר הוכח כפגום.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium">4</span>
                <p>מוצר שהתקבל כפגום, יש לשלוח עד 2 ימי עסקים מיום האיסוף תמונה לטלפון של העסק על מנת לקבל פיצוי - הפיצוי ייקבע ע"י בעלי האתר ומבוסס על שיקול דעתם בלבד.</p>
              </div>
              
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 bg-amber-100 text-amber-700 rounded-full flex items-center justify-center text-sm font-medium">5</span>
                <p>בעלי האתר מאפשרים לעצמם לשנות מחירים, מבצעים, מוצרים ולבטל הזמנות.</p>
              </div>
            </div>
          </div>
          <div className="flex justify-center pt-4">
            <Button
              onClick={() => setShowTermsDialog(false)}
              className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8"
            >
              הבנתי
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}