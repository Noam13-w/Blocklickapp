import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/api/entities';
import { User } from '@/api/entities';
import { Coupon } from '@/api/entities'; // Import the Coupon entity
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Download, CheckCircle, Clock, Loader2, AlertCircle, Eye, MapPin, CreditCard, XCircle, Filter, Search, Trash2, TrendingUp, Users, DollarSign, Package } from 'lucide-react';
import { format } from 'date-fns';
import { he } from 'date-fns/locale';
import { Checkbox } from "@/components/ui/checkbox"
import OrderDetailsDialog from '../components/OrderDetailsDialog';
import { getProductCosts, calculateOrderCost, calculateItemCost, useProductCosts } from '../components/ProductCosts';
import { motion } from 'framer-motion';
import { Skeleton } from '@/components/ui/skeleton';
import EmptyState from '@/components/EmptyState';

const ADMIN_EMAILS = ["blocklick1@gmail.com", "noamnissan10@gmail.com"];

const multiStatusFilters = [
    { value: 'pending', label: 'בהמתנה', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' },
    { value: 'processing', label: 'בטיפול', color: 'bg-blue-100 text-blue-800 border-blue-200' },
    { value: 'completed', label: 'הושלמו', color: 'bg-green-100 text-green-800 border-green-200' }
];

const paymentFilters = [
    { value: 'paid', label: 'שולם', color: 'bg-green-100 text-green-800 border-green-200' },
    { value: 'unpaid', label: 'לא שולם', color: 'bg-red-100 text-red-800 border-red-200' }
];

export default function AdminOrders() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [detailsDialogOpen, setDetailsDialogOpen] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const [selectedStatuses, setSelectedStatuses] = useState([]);
    const [selectedPaymentStatus, setSelectedPaymentStatus] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [returningCustomersDialogOpen, setReturningCustomersDialogOpen] = useState(false);
    const [returningCustomersList, setReturningCustomersList] = useState([]);
    
    // שימוש בעלויות מוצרים עם עדכון אוטומטי
    const productCosts = useProductCosts();
    const navigate = useNavigate();

    const fetchOrders = async () => {
        setIsLoading(true);
        try {
            const user = await User.me();
            if (!ADMIN_EMAILS.some(email => email.toLowerCase() === user.email.toLowerCase())) {
                navigate('/');
                return;
            }
            const fetchedOrders = await Order.list('-created_date');
            setOrders(fetchedOrders);
        } catch (err) {
            navigate('/');
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, [navigate]);

    // פונקציה להמרת תאריך לזמן ישראל
    const formatIsraeliDate = (dateString) => {
        try {
            const date = new Date(dateString);
            const israelOffset = 3;
            const israelDate = new Date(date.getTime() + (israelOffset * 60 * 60 * 1000));
            return format(israelDate, 'd/MM/yy, HH:mm', { locale: he });
        } catch (error) {
            return format(new Date(dateString), 'd/MM/yy, HH:mm', { locale: he });
        }
    };

    const handleStatusToggle = async (order) => {
        if (!order) return;
        try {
            let newStatus;
            if (order.status === 'pending') {
                newStatus = 'processing';
            } else if (order.status === 'processing') {
                newStatus = 'completed';
            } else {
                newStatus = 'pending';
            }
            
            await Order.update(order.id, { status: newStatus });
            
            // אם הסטטוס נשתנה ל-completed, שלח הודעת וואטסאפ
            if (newStatus === 'completed' && order.customer_phone) {
                const msgOrderNumber = order.order_number || order.id;
                const message = `שלום ${order.customer_name}!

הזמנתך מספר #${msgOrderNumber} מוכנה לאיסוף.

מיקום איסוף: הקוממיות 4, קרני שומרון.

נא לתאם מראש את מועד האיסוף ואני אוציא את ההזמנה למחוץ לדלת.

תודה שבחרת בבלוקליק!`;

                const customerPhone = order.customer_phone.replace(/\D/g, '');
                const formattedPhone = customerPhone.startsWith('0') ? `972${customerPhone.slice(1)}` : customerPhone;
                const whatsappUrl = `https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`;
                window.open(whatsappUrl, '_blank');
            }

            fetchOrders();
        } catch (err) {
            setError('נכשל בעדכון סטטוס ההזמנה.');
            console.error('Error updating order status:', err);
        }
    };

    const handleViewDetails = (order) => {
        setSelectedOrder(order);
        setDetailsDialogOpen(true);
    };

    const handlePaymentToggle = async (orderId, currentStatus) => {
        try {
            await Order.update(orderId, { is_paid: !currentStatus });
            fetchOrders();
        } catch(err) {
            setError('נכשל בעדכון סטטוס תשלום.');
            console.error('Error updating payment status:', err);
        }
    };

    const handleDeleteOrder = async (orderId) => {
        if (confirm('האם אתה בטוח שברצונך למחוק את ההזמנה? פעולה זו לא ניתנת לביטול.')) {
            try {
                await Order.delete(orderId);
                fetchOrders();
            } catch (err) {
                setError('נכשל במחיקת ההזמנה.');
                console.error('Error deleting order:', err);
            }
        }
    };

    const createReceipt = async (order) => {
        const orderDate = new Date(order.created_date);
        const israelOffset = 3;
        const israelDate = new Date(orderDate.getTime() + (israelOffset * 60 * 60 * 1000));

        // המרת מספר טלפון לפורמט של 10 ספרות
        const formatPhoneNumber = (phone) => {
            if (!phone) return '';
            // הסרת כל מה שלא ספרה
            let cleaned = phone.replace(/\D/g, '');
            // אם מתחיל ב-972, הורד אותו והוסף 0
            if (cleaned.startsWith('972')) {
                cleaned = '0' + cleaned.substring(3);
            }
            // ודא שמתחיל ב-0 ובאורך 10 ספרות
            if (!cleaned.startsWith('0') && cleaned.length > 0) {
                cleaned = '0' + cleaned;
            }
            return cleaned.substring(0, 10);
        };

        // יצירת רשימת מוצרים מאוחדת
        const createUnifiedItemsList = (items) => {
            if (!items || !Array.isArray(items)) return [];
            
            const summary = {};
            items.forEach(item => {
                let itemType = '';
                switch (item.type) {
                    case 'block':
                        itemType = 'בלוק עץ';
                        break;
                    case 'magnet':
                        itemType = 'מגנט';
                        break;
                    case 'photo':
                        itemType = 'תמונה';
                        break;
                    case 'bookmark':
                        itemType = 'סימניה';
                        break;
                    default:
                        itemType = item.type;
                }
                const key = `${itemType} ${item.size || ''}`.trim();
                if (!summary[key]) {
                    summary[key] = { 
                        quantity: 0, 
                        price: item.price || 0,
                        total: 0 
                    };
                }
                summary[key].quantity += item.quantity;
                summary[key].total += (item.price || 0) * item.quantity;
            });

            return Object.entries(summary).map(([name, data]) => ({
                name: name,
                quantity: data.quantity,
                price: parseFloat(data.price.toFixed(2)),
                total: parseFloat(data.total.toFixed(2))
            }));
        };

        // קבלת פרטי הקופון אם יש
        let discountType = '';
        if (order.coupon_code) {
            try {
                const coupons = await Coupon.filter({ code: order.coupon_code });
                if (coupons.length > 0) {
                    discountType = coupons[0].discount_type; // "percentage" או "fixed"
                }
            } catch (error) {
                console.error('Error fetching coupon details:', error);
            }
        }

        // הכנת נתונים לאתר הקבלות - פורמט מתוקן
        const receiptData = {
            order_number: order.order_number || order.id,
            customer_name: order.customer_name,
            customer_phone: formatPhoneNumber(order.customer_phone),
            customer_email: order.customer_email,
            order_date: israelDate.toISOString(),
            items: createUnifiedItemsList(order.items),
            total_amount: parseFloat((order.total_price || 0).toFixed(2)),
            original_price: parseFloat((order.original_price || order.total_price || 0).toFixed(2)),
            discount_amount: parseFloat((order.discount_amount || 0).toFixed(2)),
            discount_type: discountType, // "percentage" או "fixed" או ריק
            coupon_code: order.coupon_code || '',
            notes: order.notes || ''
        };

        // קידוד הנתונים ל-URL
        const jsonString = JSON.stringify(receiptData);
        const encodedData = encodeURIComponent(jsonString);
        
        // פתיחת אתר הקבלות
        const receiptUrl = `https://futureceipt.app/CreateInvoice?data=${encodedData}`;
        window.open(receiptUrl, '_blank');
    };

    const statusMap = {
        pending: { text: 'ממתין', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: Clock },
        processing: { text: 'בטיפול', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: Clock },
        completed: { text: 'הושלם', color: 'bg-green-100 text-green-800 border-green-200', icon: CheckCircle },
    };

    // חישוב סטטיסטיקות
    const statistics = React.useMemo(() => {
        if (!orders.length) return null;

        // כמות הזמנות
        const totalOrders = orders.length;

        // חישוב לקוחות חוזרים
        const phoneOrdersMap = {};
        orders.forEach(order => {
            const phone = order.customer_phone;
            const orderDate = new Date(order.created_date).toDateString();
            
            if (!phoneOrdersMap[phone]) {
                phoneOrdersMap[phone] = {
                    name: order.customer_name,
                    phone: phone,
                    orderDates: new Set(),
                    orders: []
                };
            }
            phoneOrdersMap[phone].orderDates.add(orderDate);
            phoneOrdersMap[phone].orders.push(order);
        });

        const returningCustomersData = Object.values(phoneOrdersMap).filter(customer => customer.orderDates.size >= 2);
        const returningCustomers = returningCustomersData.length;

        // חישוב הכנסות
        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);

        // חישוב עלויות ורווח כולל ולפי מוצרים באמצעות הפונקציות החדשות
        const totalCosts = orders.reduce((sum, order) => sum + calculateOrderCost(order, productCosts), 0);
        const estimatedProfit = totalRevenue - totalCosts;

        // פירוט לפי מוצרים
        const productBreakdown = {
            block: { revenue: 0, costs: 0, units: 0 },
            magnet: { revenue: 0, costs: 0, units: 0 },
            photo: { revenue: 0, costs: 0, units: 0 },
            bookmark: { revenue: 0, costs: 0, units: 0 }
        };
        
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const quantity = item.quantity || 1;
                    const itemRevenue = (item.price || 0) * quantity;
                    const itemCost = calculateItemCost(item, productCosts) * quantity;
                    
                    if (productBreakdown[item.type]) {
                        productBreakdown[item.type].revenue += itemRevenue;
                        productBreakdown[item.type].costs += itemCost;
                        productBreakdown[item.type].units += quantity;
                    }
                });
            }
        });

        return {
            totalOrders,
            returningCustomers,
            returningCustomersData,
            totalRevenue,
            totalCosts,
            estimatedProfit,
            productBreakdown
        };
    }, [orders, productCosts]);

    // פונקציה לחישוב סיכום הזמנה
    const getOrderSummary = (order) => {
        if (!order.items || !Array.isArray(order.items)) return '';

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
                summary[key] = { count: 0, totalPrice: 0 };
            }
            summary[key].count += item.quantity;
            summary[key].totalPrice += (item.price * item.quantity);
        });
        
        return Object.entries(summary).map(([key, data]) => 
            `${data.count} ${key}`
        ).join(', ');
    };

    // פילטור הזמנות לפי סטטוס, תשלום וחיפוש
    const filteredOrders = orders.filter(order => {
        const statusMatch = selectedStatuses.length === 0 || selectedStatuses.includes(order.status);
        
        const paymentMatch = selectedPaymentStatus.length === 0 || 
            (selectedPaymentStatus.includes('paid') && order.is_paid) ||
            (selectedPaymentStatus.includes('unpaid') && !order.is_paid);

        const searchMatch = searchTerm === '' || 
            (order.order_number && order.order_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customer_name && order.customer_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (order.customer_phone && order.customer_phone.includes(searchTerm)) ||
            (order.id && order.id.toString().includes(searchTerm)) ||
            (getOrderSummary(order).toLowerCase().includes(searchTerm.toLowerCase()));
        
        return statusMatch && paymentMatch && searchMatch;
    });

    const handleFilterStatusToggle = (status) => {
        setSelectedStatuses(prev => {
            if (prev.includes(status)) {
                return prev.filter(s => s !== status);
            } else {
                return [...prev, status];
            }
        });
    };

    const handlePaymentFilterToggle = (paymentStatus) => {
        setSelectedPaymentStatus(prev => {
            if (prev.includes(paymentStatus)) {
                return prev.filter(s => s !== paymentStatus);
            } else {
                return [...prev, paymentStatus];
            }
        });
    };

    const showReturningCustomers = () => {
        if (statistics?.returningCustomersData) {
            setReturningCustomersList(statistics.returningCustomersData);
            setReturningCustomersDialogOpen(true);
        }
    };

    if (isLoading) return (
        <div className="container mx-auto p-6 max-w-7xl space-y-4">
            <div className="space-y-2">
                <Skeleton className="h-10 w-1/4" />
                <Skeleton className="h-4 w-1/3" />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 my-8">
                {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}
            </div>
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100 p-4">
                <div className="space-y-4">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="flex gap-4">
                            <Skeleton className="h-12 w-full" />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    if (error) return <div className="container mx-auto p-6"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>שגיאה</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-100" dir="rtl">
            <div className="container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <motion.div 
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-slate-800 to-slate-600 bg-clip-text text-transparent mb-2">
                        ניהול הזמנות
                    </h1>
                    <p className="text-slate-500 text-lg">מעקב וניהול כל ההזמנות במערכת</p>
                </motion.div>

                {/* סטטיסטיקות משופרות */}
                {statistics && (
                    <motion.div 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 mb-10"
                    >
                        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-white/90">סה"כ הזמנות</CardTitle>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Package className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-3xl font-bold text-white">{statistics.totalOrders}</div>
                                    <p className="text-xs text-white/70 mt-1">כל ההזמנות במערכת</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-emerald-600">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-white/90">לקוחות חוזרים</CardTitle>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <Users className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <button
                                        onClick={showReturningCustomers}
                                        className="text-3xl font-bold text-white hover:text-white/90 transition-colors"
                                    >
                                        {statistics.returningCustomers}
                                    </button>
                                    <p className="text-xs text-white/70 mt-1">
                                        {statistics.totalOrders > 0 ? `${Math.round((statistics.returningCustomers / statistics.totalOrders) * 100)}% מהלקוחות` : 'אין לקוחות'}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-amber-500 to-orange-600">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-white/90">סה"כ הכנסות</CardTitle>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <DollarSign className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-3xl font-bold text-white">₪{statistics.totalRevenue.toFixed(2)}</div>
                                    <p className="text-xs text-white/70 mt-1">סך כל ההכנסות</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                            <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600">
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-white/90">עלויות משוערות</CardTitle>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-3xl font-bold text-white">₪{statistics.totalCosts.toFixed(2)}</div>
                                    <p className="text-xs text-white/70 mt-1">סך כל העלויות</p>
                                </CardContent>
                            </Card>
                        </motion.div>

                        <motion.div whileHover={{ scale: 1.02, y: -4 }} transition={{ duration: 0.2 }}>
                            <Card className={`relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 ${
                                statistics.estimatedProfit >= 0 
                                    ? 'bg-gradient-to-br from-green-600 to-emerald-700' 
                                    : 'bg-gradient-to-br from-red-500 to-red-600'
                            }`}>
                                <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative">
                                    <CardTitle className="text-sm font-medium text-white/90">רווח משוער</CardTitle>
                                    <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                                        <TrendingUp className="h-5 w-5 text-white" />
                                    </div>
                                </CardHeader>
                                <CardContent className="relative">
                                    <div className="text-3xl font-bold text-white">
                                        ₪{statistics.estimatedProfit.toFixed(2)}
                                    </div>
                                    <p className="text-xs text-white/70 mt-1">
                                        {statistics.totalRevenue > 0 ? `${Math.round((statistics.estimatedProfit / statistics.totalRevenue) * 100)}% רווחיות` : 'אין רווחיות לחשב'}
                                    </p>
                                </CardContent>
                            </Card>
                        </motion.div>
                    </motion.div>
                )}

                {/* סינונים וחיפוש משופרים */}
                <motion.div 
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="mb-8 bg-white rounded-2xl shadow-lg p-6 border border-slate-100"
                >
                    <div className="space-y-6">
                        {/* שורת חיפוש */}
                        <div className="relative">
                            <Search className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                            <Input
                                placeholder="חפש לפי מספר הזמנה, שם לקוח, טלפון או מוצרים..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="pr-12 py-6 text-lg border-slate-200 focus:border-blue-400 focus:ring-blue-400 rounded-xl"
                            />
                        </div>

                        {/* פילטרי סטטוס */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <Filter className="h-5 w-5 text-slate-500" />
                                <span>סינון לפי סטטוס:</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {multiStatusFilters.map(filter => {
                                    const isSelected = selectedStatuses.includes(filter.value);
                                    return (
                                        <motion.div
                                            key={filter.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                onClick={() => handleFilterStatusToggle(filter.value)}
                                                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                    isSelected 
                                                        ? `${filter.color} border-2 shadow-md` 
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                                                }`}
                                                size="sm"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {isSelected && <CheckCircle className="h-4 w-4" />}
                                                    {filter.label}
                                                </span>
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                                {selectedStatuses.length > 0 && (
                                    <Button
                                        onClick={() => setSelectedStatuses([])}
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                                    >
                                        נקה הכל
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* פילטרי תשלום */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <div className="flex items-center gap-2 text-slate-700 font-medium">
                                <CreditCard className="h-5 w-5 text-slate-500" />
                                <span>סינון לפי תשלום:</span>
                            </div>
                            <div className="flex flex-wrap items-center gap-3">
                                {paymentFilters.map(filter => {
                                    const isSelected = selectedPaymentStatus.includes(filter.value);
                                    return (
                                        <motion.div
                                            key={filter.value}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                        >
                                            <Button
                                                onClick={() => handlePaymentFilterToggle(filter.value)}
                                                className={`rounded-xl px-5 py-2.5 text-sm font-medium transition-all duration-200 ${
                                                    isSelected 
                                                        ? `${filter.color} border-2 shadow-md` 
                                                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200 border-2 border-transparent'
                                                }`}
                                                size="sm"
                                            >
                                                <span className="flex items-center gap-2">
                                                    {isSelected && <CheckCircle className="h-4 w-4" />}
                                                    {filter.label}
                                                </span>
                                            </Button>
                                        </motion.div>
                                    );
                                })}
                                {selectedPaymentStatus.length > 0 && (
                                    <Button
                                        onClick={() => setSelectedPaymentStatus([])}
                                        variant="ghost"
                                        size="sm"
                                        className="text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl"
                                    >
                                        נקה הכל
                                    </Button>
                                )}
                            </div>
                        </div>

                        {/* תצוגת פילטרים פעילים */}
                        {(selectedStatuses.length > 0 || selectedPaymentStatus.length > 0) && (
                            <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                className="flex items-center gap-3 pt-2 border-t border-slate-100"
                            >
                                <span className="text-sm text-slate-600 font-medium">מציג:</span>
                                <div className="flex gap-2 flex-wrap">
                                    {selectedStatuses.map(status => {
                                        const filter = multiStatusFilters.find(f => f.value === status);
                                        return (
                                            <span key={status} className={`text-xs px-3 py-1.5 rounded-lg ${filter.color} font-medium shadow-sm`}>
                                                {filter.label}
                                            </span>
                                        );
                                    })}
                                    {selectedPaymentStatus.map(payment => {
                                        const filter = paymentFilters.find(f => f.value === payment);
                                        return (
                                            <span key={payment} className={`text-xs px-3 py-1.5 rounded-lg ${filter.color} font-medium shadow-sm`}>
                                                {filter.label}
                                            </span>
                                        );
                                    })}
                                </div>
                            </motion.div>
                        )}
                    </div>
                </motion.div>

                {/* טבלת הזמנות משופרת */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3 }}
                    className="bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-100"
                >
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-gradient-to-r from-slate-50 to-slate-100 border-b-2 border-slate-200">
                                <TableHead className="text-right font-semibold text-slate-700">מספר הזמנה</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">לקוח</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">תשלום</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">סטטוס</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">סה"כ</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">תאריך</TableHead>
                                <TableHead className="text-right font-semibold text-slate-700">פעולות</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredOrders.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan="7">
                                        <EmptyState 
                                          icon={Package}
                                          title="לא נמצאו הזמנות"
                                          description={searchTerm ? 'נסה לשנות את מילות החיפוש או הסינון' : 'עדיין אין הזמנות במערכת'}
                                        />
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredOrders.map((order, index) => {
                                    const statusInfo = statusMap[order.status] || statusMap.pending;
                                    const StatusIcon = statusInfo.icon;
                                    // const orderSummary = getOrderSummary(order); // This variable is not used in the updated TableCell structure
                                    return (
                                        <motion.tr
                                            key={order.id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: index * 0.03 }}
                                            className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors duration-200"
                                        >
                                            <TableCell className="font-mono font-bold text-blue-600 cursor-pointer hover:text-blue-700 transition-colors" onClick={() => handleViewDetails(order)}>
                                                #{order.order_number || order.id}
                                            </TableCell>
                                            <TableCell>
                                                <div className="space-y-1">
                                                    <div className="font-semibold text-slate-800">{order.customer_name}</div>
                                                    <div className="text-sm text-slate-500">{order.customer_phone}</div>
                                                    {order.notes && (
                                                        <div className="text-xs bg-amber-50 text-amber-700 px-2 py-1 rounded-lg inline-block mt-1 font-medium">
                                                            💬 {order.notes}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 ${
                                                        order.is_paid 
                                                            ? 'bg-green-50 text-green-700 hover:bg-green-100' 
                                                            : 'bg-red-50 text-red-700 hover:bg-red-100'
                                                    }`}
                                                    onClick={() => handlePaymentToggle(order.id, order.is_paid)}
                                                >
                                                    {order.is_paid ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                                                    <span className="font-medium">{order.is_paid ? 'שולם' : 'לא שולם'}</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    className={`flex items-center gap-2 rounded-xl px-3 py-2 font-medium ${
                                                        statusInfo.color.includes('green') ? 'bg-green-50 text-green-700 hover:bg-green-100' :
                                                        statusInfo.color.includes('blue') ? 'bg-blue-50 text-blue-700 hover:bg-blue-100' :
                                                        'bg-yellow-50 text-yellow-700 hover:bg-yellow-100'
                                                    }`}
                                                    onClick={() => handleStatusToggle(order)}
                                                >
                                                    <StatusIcon className="h-4 w-4" />
                                                    <span>{statusInfo.text}</span>
                                                </Button>
                                            </TableCell>
                                            <TableCell className="font-bold text-lg text-slate-800">₪{order.total_price}</TableCell>
                                            <TableCell className="text-slate-600">{formatIsraeliDate(order.created_date)}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-2">
                                                    <Button 
                                                        onClick={() => handleViewDetails(order)} 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex items-center gap-2 rounded-xl border-blue-200 text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                        <span>פרטים</span>
                                                    </Button>
                                                    <Button 
                                                        onClick={() => createReceipt(order)} 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex items-center gap-2 rounded-xl border-green-200 text-green-600 hover:bg-green-50 hover:border-green-300"
                                                    >
                                                        <Download className="h-4 w-4" />
                                                        <span>צור קבלה</span>
                                                    </Button>
                                                    <Button 
                                                        onClick={() => handleDeleteOrder(order.id)} 
                                                        variant="outline" 
                                                        size="sm" 
                                                        className="flex items-center gap-2 rounded-xl border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                        <span>מחק</span>
                                                    </Button>
                                                </div>
                                            </TableCell>
                                        </motion.tr>
                                    );
                                })
                            )}
                        </TableBody>
                    </Table>
                </motion.div>
            </div>

            <OrderDetailsDialog order={selectedOrder} open={detailsDialogOpen} onOpenChange={setDetailsDialogOpen} onUpdateOrder={fetchOrders} />

            {/* דיאלוג לקוחות חוזרים - משופר */}
            <Dialog open={returningCustomersDialogOpen} onOpenChange={setReturningCustomersDialogOpen}>
                <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto rounded-2xl" dir="rtl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                            לקוחות חוזרים ({returningCustomersList.length})
                        </DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        {returningCustomersList.map((customer, index) => (
                            <motion.div
                                key={customer.phone}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-all duration-200 bg-gradient-to-r from-white to-slate-50"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h3 className="font-bold text-lg text-slate-800">{customer.name}</h3>
                                        <p className="text-slate-600">{customer.phone}</p>
                                    </div>
                                    <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 px-3 py-1 text-sm font-semibold rounded-xl">
                                        {customer.orders.length} הזמנות
                                    </Badge>
                                </div>
                                <div className="space-y-2">
                                    <h4 className="text-sm font-semibold text-slate-700 mb-2">הזמנות:</h4>
                                    {customer.orders.map(order => (
                                        <div key={order.id} className="text-sm text-slate-600 bg-white p-3 rounded-lg border border-slate-100">
                                            <span className="font-bold text-blue-600">#{order.order_number || order.id}</span> - 
                                            <span className="mr-2 font-semibold">₪{order.total_price}</span> - 
                                            <span className="mr-2 text-slate-500">{formatIsraeliDate(order.created_date)}</span>
                                            {getOrderSummary(order) && (
                                                <div className="text-xs text-blue-600 mt-1 font-medium">{getOrderSummary(order)}</div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
}