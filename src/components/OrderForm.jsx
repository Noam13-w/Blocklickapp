
import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Loader2, Send, User, Mail, Phone, MessageSquare, X } from 'lucide-react';
import { Coupon } from '@/api/entities';

export default function OrderForm({ onSubmit, isSubmitting }) {
  const [formData, setFormData] = useState({
    customer_name: '',
    customer_email: '',
    customer_phone: '',
    notes: ''
  });
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');
  const [isCheckingCoupon, setIsCheckingCoupon] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    const finalFormData = { ...formData, appliedCoupon };
    onSubmit(finalFormData);
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    
    setIsCheckingCoupon(true);
    setCouponError('');
    
    try {
      const coupons = await Coupon.filter({ code: couponCode.toUpperCase(), is_active: true });
      
      if (coupons.length === 0) {
        setCouponError('קוד קופון לא תקין או לא פעיל');
        setAppliedCoupon(null);
      } else {
        const coupon = coupons[0];
        setAppliedCoupon(coupon);
        setCouponError('');
      }
    } catch (error) {
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

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-white rounded-2xl shadow-2xl p-8 max-w-lg mx-auto"
    >
      <div className="text-center space-y-2 mb-8">
        <h3 className="text-2xl font-bold text-slate-800">פרטי ההזמנה</h3>
        <p className="text-slate-500">מלא את הפרטים ונצור איתך קשר בקרוב</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="name" className="text-right block text-slate-700 font-medium">
            שם מלא *
          </Label>
          <div className="relative">
            <User className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              id="name"
              type="text"
              value={formData.customer_name}
              onChange={(e) => handleChange('customer_name', e.target.value)}
              required
              className="pr-10 text-right rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
              placeholder="הכנס את שמך המלא"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email" className="text-right block text-slate-700 font-medium">
            כתובת אימייל *
          </Label>
          <div className="relative">
            <Mail className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              id="email"
              type="email"
              value={formData.customer_email}
              onChange={(e) => handleChange('customer_email', e.target.value)}
              required
              className="pr-10 text-right rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
              placeholder="example@gmail.com"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="phone" className="text-right block text-slate-700 font-medium">
            מספר טלפון *
          </Label>
          <div className="relative">
            <Phone className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <Input
              id="phone"
              type="tel"
              value={formData.customer_phone}
              onChange={(e) => handleChange('customer_phone', e.target.value)}
              required
              className="pr-10 text-right rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
              placeholder="050-1234567"
            />
          </div>
        </div>

        {/* קופון הנחה */}
        <div className="space-y-2">
          <Label className="text-right block text-slate-700 font-medium">
            קוד קופון (אופציונלי)
          </Label>
          {!appliedCoupon ? (
            <div className="flex gap-2">
              <Input
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="הכנס קוד קופון"
                className="text-right rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400"
              />
              <Button
                type="button"
                onClick={handleApplyCoupon}
                disabled={isCheckingCoupon || !couponCode.trim()}
                variant="outline"
              >
                {isCheckingCoupon ? <Loader2 className="h-4 w-4 animate-spin" /> : 'החל'}
              </Button>
            </div>
          ) : (
            <div className="bg-green-50 border border-green-200 rounded-xl p-3 flex items-center justify-between">
              <div>
                <p className="text-green-800 font-medium">קופון הוחל: {appliedCoupon.code}</p>
                <p className="text-green-600 text-sm">
                  הנחה: {appliedCoupon.discount_type === 'percentage' 
                    ? `${appliedCoupon.discount_value}%` 
                    : `₪${appliedCoupon.discount_value}`
                  }
                </p>
              </div>
              <Button
                type="button"
                onClick={handleRemoveCoupon}
                variant="ghost"
                size="sm"
                className="text-red-600 hover:text-red-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          )}
          {couponError && (
            <p className="text-red-600 text-sm">{couponError}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="notes" className="text-right block text-slate-700 font-medium">
            הערות נוספות
          </Label>
          <div className="relative">
            <MessageSquare className="absolute right-3 top-3 h-5 w-5 text-slate-400" />
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              className="pr-10 text-right rounded-xl border-slate-200 focus:border-amber-400 focus:ring-amber-400 min-h-[100px]"
              placeholder="הוספת בקשות מיוחדות או הערות..."
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-200"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="ml-2 h-5 w-5 animate-spin" />
              שולח הזמנה...
            </>
          ) : (
            <>
              <Send className="ml-2 h-5 w-5" />
              שלח הזמנה
            </>
          )}
        </Button>
      </form>
    </motion.div>
  );
}
