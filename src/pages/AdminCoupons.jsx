
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Coupon } from '@/api/entities';
import { User } from '@/api/entities';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Plus, Edit2, Trash2, Percent, DollarSign, Tag, Loader2, AlertCircle, Gift, Ticket, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion } from 'framer-motion';

const ADMIN_EMAILS = ["blocklick1@gmail.com", "noamnissan10@gmail.com"];

export default function AdminCoupons() {
  const [coupons, setCoupons] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discount_type: 'percentage',
    discount_value: 0,
    min_order_amount: 0,
    max_discount_amount: 0,
    applicable_products: [],
    usage_limit: 0,
    valid_from: '',
    valid_until: '',
    description: '',
    is_active: true
  });
  const navigate = useNavigate();

  const fetchCoupons = async () => {
    setIsLoading(true);
    try {
      const user = await User.me();
      if (!ADMIN_EMAILS.some(email => email.toLowerCase() === user.email.toLowerCase())) {
        navigate('/');
        return;
      }
      const fetchedCoupons = await Coupon.list('-created_date');
      setCoupons(fetchedCoupons);
    } catch (err) {
      console.error('Error fetching coupons:', err);
      if (err.message && err.message.includes('Rate limit')) {
        setError('יותר מדי בקשות לשרת. אנא המתן רגע ונסה שוב.');
      } else {
        navigate('/');
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Add a small delay to prevent too many calls
    const timer = setTimeout(() => {
      fetchCoupons();
    }, 100);
    
    return () => clearTimeout(timer);
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      if (editingCoupon) {
        await Coupon.update(editingCoupon.id, formData);
      } else {
        await Coupon.create(formData);
      }
      setIsDialogOpen(false);
      setEditingCoupon(null);
      setFormData({
        code: '',
        discount_type: 'percentage',
        discount_value: 0,
        min_order_amount: 0,
        max_discount_amount: 0,
        applicable_products: [],
        usage_limit: 0,
        valid_from: '',
        valid_until: '',
        description: '',
        is_active: true
      });
      
      // Add delay before refetching
      setTimeout(() => {
        fetchCoupons();
      }, 500);
    } catch (err) {
      console.error('Error saving coupon:', err);
      if (err.message && err.message.includes('Rate limit')) {
        setError('יותר מדי בקשות לשרת. אנא המתן רגע ונסה שוב.');
      } else {
        setError('שגיאה בשמירת הקופון');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleEdit = (coupon) => {
    setEditingCoupon(coupon);
    setFormData({
      code: coupon.code,
      discount_type: coupon.discount_type,
      discount_value: coupon.discount_value,
      min_order_amount: coupon.min_order_amount || 0,
      max_discount_amount: coupon.max_discount_amount || 0,
      applicable_products: coupon.applicable_products || [],
      usage_limit: coupon.usage_limit || 0,
      valid_from: coupon.valid_from ? new Date(coupon.valid_from).toISOString().split('T')[0] : '',
      valid_until: coupon.valid_until ? new Date(coupon.valid_until).toISOString().split('T')[0] : '',
      description: coupon.description || '',
      is_active: coupon.is_active
    });
    setIsDialogOpen(true);
  };

  const handleDelete = async (couponId) => {
    if (confirm('האם אתה בטוח שברצונך למחוק את הקופון?')) {
      try {
        await Coupon.delete(couponId);
        setTimeout(() => {
          fetchCoupons();
        }, 300);
      } catch (err) {
        console.error('Error deleting coupon:', err);
        if (err.message && err.message.includes('Rate limit')) {
          setError('יותר מדי בקשות לשרת. אנא המתן רגע ונסה שוב.');
        } else {
          setError('שגיאה במחיקת הקופון');
        }
      }
    }
  };

  const handleToggleActive = async (coupon) => {
    try {
      await Coupon.update(coupon.id, { ...coupon, is_active: !coupon.is_active });
      setTimeout(() => {
        fetchCoupons();
      }, 300);
    } catch (err) {
      console.error('Error updating coupon:', err);
      if (err.message && err.message.includes('Rate limit')) {
        setError('יותר מדי בקשות לשרת. אנא המתן רגע ונסה שוב.');
      } else {
        setError('שגיאה בעדכון הקופון');
      }
    }
  };

  if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-amber-50" dir="rtl">
      {/* Header with decorative elements */}
      <div className="bg-gradient-to-r from-purple-600 to-amber-500 text-white py-16 relative overflow-hidden">
        <div className="absolute inset-0">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="absolute top-10 right-10 w-20 h-20 bg-white/10 rounded-full flex items-center justify-center"
          >
            <Gift className="h-10 w-10" />
          </motion.div>
          <motion.div
            animate={{ rotate: -360 }}
            transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
            className="absolute bottom-10 left-10 w-16 h-16 bg-white/10 rounded-full flex items-center justify-center"
          >
            <Sparkles className="h-8 w-8" />
          </motion.div>
        </div>
        
        <div className="container mx-auto px-6 text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex items-center justify-center gap-4 mb-4"
          >
            <Ticket className="h-12 w-12" />
            <h1 className="text-4xl font-bold">ניהול קופונים</h1>
            <Tag className="h-12 w-12" />
          </motion.div>
          <p className="text-xl opacity-90">צור והנהל קופוני הנחה ללקוחות</p>
        </div>
      </div>

      <div className="container mx-auto p-6 -mt-8 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
              <Gift className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">רשימת קופונים</h2>
              <p className="text-slate-600">נהל את כל הקופונים שיצרת</p>
            </div>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600 shadow-lg hover:shadow-xl transition-all duration-300">
                <Plus className="h-4 w-4 mr-2" />
                קופון חדש
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden" dir="rtl">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2 text-2xl">
                  <Ticket className="h-6 w-6 text-purple-600" />
                  {editingCoupon ? 'עריכת קופון' : 'קופון חדש'}
                </DialogTitle>
              </DialogHeader>
              <ScrollArea className="max-h-[75vh] px-1">
                <form onSubmit={handleSubmit} className="space-y-6 pr-4">
                  {/* Basic Info */}
                  <div className="bg-slate-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <Tag className="h-5 w-5 text-purple-600" />
                      פרטים בסיסיים
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="code" className="text-slate-700 font-medium">קוד קופון *</Label>
                        <Input
                          id="code"
                          value={formData.code}
                          onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                          placeholder="SAVE10"
                          className="mt-1"
                          required
                        />
                      </div>
                      
                      <div>
                        <Label htmlFor="discount_type" className="text-slate-700 font-medium">סוג הנחה *</Label>
                        <Select value={formData.discount_type} onValueChange={(value) => setFormData({...formData, discount_type: value})}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="percentage">
                              <div className="flex items-center gap-2">
                                <Percent className="h-4 w-4" />
                                אחוזים
                              </div>
                            </SelectItem>
                            <SelectItem value="fixed">
                              <div className="flex items-center gap-2">
                                <DollarSign className="h-4 w-4" />
                                סכום קבוע
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="discount_value" className="text-slate-700 font-medium">
                        {formData.discount_type === 'percentage' ? 'אחוז הנחה *' : 'סכום הנחה (₪) *'}
                      </Label>
                      <Input
                        id="discount_value"
                        type="number"
                        min="0"
                        max={formData.discount_type === 'percentage' ? '100' : undefined}
                        value={formData.discount_value}
                        onChange={(e) => setFormData({...formData, discount_value: parseFloat(e.target.value) || 0})}
                        className="mt-1"
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="description" className="text-slate-700 font-medium">תיאור הקופון</Label>
                      <Input
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({...formData, description: e.target.value})}
                        placeholder="הנחה מיוחדת ללקוחות חדשים"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Restrictions */}
                  <div className="bg-amber-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800 flex items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-amber-600" />
                      מגבלות ותנאים
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="min_order_amount" className="text-slate-700 font-medium">סכום הזמנה מינימלי (₪)</Label>
                        <Input
                          id="min_order_amount"
                          type="number"
                          min="0"
                          value={formData.min_order_amount}
                          onChange={(e) => setFormData({...formData, min_order_amount: parseFloat(e.target.value) || 0})}
                          placeholder="0 = ללא מגבלה"
                          className="mt-1"
                        />
                      </div>

                      {formData.discount_type === 'percentage' && (
                        <div>
                          <Label htmlFor="max_discount_amount" className="text-slate-700 font-medium">הנחה מקסימלית (₪)</Label>
                          <Input
                            id="max_discount_amount"
                            type="number"
                            min="0"
                            value={formData.max_discount_amount}
                            onChange={(e) => setFormData({...formData, max_discount_amount: parseFloat(e.target.value) || 0})}
                            placeholder="0 = ללא מגבלה"
                            className="mt-1"
                          />
                        </div>
                      )}
                    </div>

                    <div>
                      <Label htmlFor="usage_limit" className="text-slate-700 font-medium">מגבלת שימושים</Label>
                      <Input
                        id="usage_limit"
                        type="number"
                        min="0"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({...formData, usage_limit: parseInt(e.target.value) || 0})}
                        placeholder="0 = ללא מגבלה"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  {/* Product Selection */}
                  <div className="bg-green-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">מוצרים רלוונטיים</h3>
                    <div className="flex gap-4 flex-wrap">
                      {['block', 'magnet', 'photo'].map(product => {
                        const productNames = {
                          block: 'בלוקי עץ',
                          magnet: 'מגנטים',
                          photo: 'תמונות'
                        };
                        return (
                          <label key={product} className="flex items-center gap-3 bg-white rounded-lg px-4 py-3 border border-slate-200 hover:border-green-300 transition-colors cursor-pointer">
                            <input
                              type="checkbox"
                              checked={formData.applicable_products.includes(product)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setFormData({...formData, applicable_products: [...formData.applicable_products, product]});
                                } else {
                                  setFormData({...formData, applicable_products: formData.applicable_products.filter(p => p !== product)});
                                }
                              }}
                              className="w-4 h-4 text-green-600"
                            />
                            <span className="font-medium text-slate-700">{productNames[product]}</span>
                          </label>
                        );
                      })}
                    </div>
                    <p className="text-sm text-slate-500">לא בחירת מוצרים = הקופון חל על כל המוצרים</p>
                  </div>

                  {/* Dates */}
                  <div className="bg-blue-50 rounded-xl p-6 space-y-4">
                    <h3 className="text-lg font-semibold text-slate-800">תקופת תוקף</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="valid_from" className="text-slate-700 font-medium">תקף מתאריך</Label>
                        <Input
                          id="valid_from"
                          type="date"
                          value={formData.valid_from}
                          onChange={(e) => setFormData({...formData, valid_from: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="valid_until" className="text-slate-700 font-medium">תקף עד תאריך</Label>
                        <Input
                          id="valid_until"
                          type="date"
                          value={formData.valid_until}
                          onChange={(e) => setFormData({...formData, valid_until: e.target.value})}
                          className="mt-1"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Active Toggle */}
                  <div className="flex items-center justify-between bg-slate-50 rounded-xl p-6">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-800">סטטוס הקופון</h3>
                      <p className="text-slate-600">קופון פעיל יוכל לשימוש ללקוחות</p>
                    </div>
                    <Switch
                      id="is_active"
                      checked={formData.is_active}
                      onCheckedChange={(checked) => setFormData({...formData, is_active: checked})}
                    />
                  </div>
                  
                  {/* Submit Buttons */}
                  <div className="flex justify-end gap-3 pt-6 border-t">
                    <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                      ביטול
                    </Button>
                    <Button type="submit" className="bg-gradient-to-r from-purple-500 to-amber-500 hover:from-purple-600 hover:to-amber-600">
                      {editingCoupon ? 'עדכן' : 'צור'} קופון
                    </Button>
                  </div>
                </form>
              </ScrollArea>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>שגיאה</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
          <div className="bg-gradient-to-r from-slate-50 to-amber-50 p-6 border-b border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-amber-500 rounded-full flex items-center justify-center">
                  <Ticket className="h-5 w-5 text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800">
                  {coupons.length} קופונים פעילים
                </h3>
              </div>
            </div>
          </div>
          
          <ScrollArea className="h-[60vh]">
            <Table>
              <TableHeader className="sticky top-0 bg-slate-50 z-10">
                <TableRow className="border-b-2 border-slate-200">
                  <TableHead className="text-right font-bold text-slate-700">קוד קופון</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">סוג הנחה</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">גובה הנחה</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">מוצרים</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">מגבלות</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">סטטוס</TableHead>
                  <TableHead className="text-right font-bold text-slate-700">פעולות</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {coupons.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan="7" className="text-center text-slate-500 py-16">
                      <div className="flex flex-col items-center gap-4">
                        <Ticket className="h-16 w-16 text-slate-300" />
                        <div>
                          <h3 className="text-lg font-semibold mb-2">לא נמצאו קופונים</h3>
                          <p>צור קופון חדש כדי להתחיל</p>
                        </div>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : (
                  coupons.map((coupon) => (
                    <TableRow key={coupon.id} className="hover:bg-slate-50 transition-colors">
                      <TableCell className="font-mono font-bold text-slate-800">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-purple-100 to-amber-100 rounded-full flex items-center justify-center">
                            <Tag className="h-4 w-4 text-purple-600" />
                          </div>
                          <span className="bg-gradient-to-r from-purple-600 to-amber-600 bg-clip-text text-transparent font-bold">
                            {coupon.code}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {coupon.discount_type === 'percentage' ? (
                            <>
                              <Percent className="h-4 w-4 text-blue-600" />
                              <span className="text-blue-700 font-medium">אחוזים</span>
                            </>
                          ) : (
                            <>
                              <DollarSign className="h-4 w-4 text-green-600" />
                              <span className="text-green-700 font-medium">סכום קבוע</span>
                            </>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-semibold">
                        <div className="flex items-center gap-2">
                          <span className={`text-lg ${coupon.discount_type === 'percentage' ? 'text-blue-700' : 'text-green-700'}`}>
                            {coupon.discount_type === 'percentage' 
                              ? `${coupon.discount_value}%` 
                              : `₪${coupon.discount_value}`
                            }
                          </span>
                        </div>
                        {coupon.max_discount_amount && coupon.discount_type === 'percentage' && (
                          <div className="text-xs text-slate-500 mt-1">מקס: ₪{coupon.max_discount_amount}</div>
                        )}
                      </TableCell>
                      <TableCell>
                        {coupon.applicable_products && coupon.applicable_products.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {coupon.applicable_products.map(product => {
                              const names = { block: 'בלוק', magnet: 'מגנט', photo: 'תמונה' };
                              const colors = { block: 'bg-amber-100 text-amber-800', magnet: 'bg-blue-100 text-blue-800', photo: 'bg-green-100 text-green-800' };
                              return (
                                <span key={product} className={`${colors[product]} text-xs px-2 py-1 rounded-full font-medium`}>
                                  {names[product]}
                                </span>
                              );
                            })}
                          </div>
                        ) : (
                          <span className="text-slate-500 text-sm bg-slate-100 px-2 py-1 rounded-full">כל המוצרים</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          {coupon.min_order_amount > 0 && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <span className="text-xs">מינימום:</span>
                              <span className="font-medium">₪{coupon.min_order_amount}</span>
                            </div>
                          )}
                          {coupon.usage_limit > 0 && (
                            <div className="flex items-center gap-1 text-slate-600">
                              <span className="text-xs">שימושים:</span>
                              <span className="font-medium">{coupon.usage_count || 0}/{coupon.usage_limit}</span>
                            </div>
                          )}
                          {coupon.valid_until && (
                            <div className="text-xs text-slate-500">
                              עד: {new Date(coupon.valid_until).toLocaleDateString('he-IL')}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleToggleActive(coupon)}
                          className={`${coupon.is_active 
                            ? 'text-green-600 hover:bg-green-50 bg-green-100' 
                            : 'text-red-600 hover:bg-red-50 bg-red-100'
                          } font-medium px-3 py-1 rounded-full text-xs`}
                        >
                          {coupon.is_active ? '✓ פעיל' : '✗ לא פעיל'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleEdit(coupon)}
                            className="hover:bg-blue-50 border-blue-200 text-blue-600"
                          >
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleDelete(coupon.id)}
                            className="hover:bg-red-50 border-red-200 text-red-600"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </div>
      </div>
    </div>
  );
}
