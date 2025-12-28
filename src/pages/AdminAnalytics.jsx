import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Order } from '@/api/entities';
import { User } from '@/api/entities';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Loader2, AlertCircle, BarChart3, TrendingUp, Package, Clock, Trophy, Calendar, Edit3, Save, X } from 'lucide-react';
import { format, subDays, parseISO } from 'date-fns';
import { he } from 'date-fns/locale';
import { getProductCosts, saveProductCosts, calculateOrderCost, calculateItemCost, useProductCosts } from '../components/ProductCosts';

const ADMIN_EMAILS = ["blocklick1@gmail.com", "noamnissan10@gmail.com"];

export default function AdminAnalytics() {
    const [orders, setOrders] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState('');
    const [editingCosts, setEditingCosts] = useState({});
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingProduct, setEditingProduct] = useState(null);
    
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

    const handleEditCosts = (productType) => {
        setEditingProduct(productType);
        // This handles both objects (block, magnet, photo) and numbers (bookmark) correctly
        setEditingCosts(productCosts[productType] || {});
        setIsEditDialogOpen(true);
    };

    const handleSaveCosts = () => {
        const newCosts = {
            ...productCosts,
            [editingProduct]: editingCosts
        };
        
        if (saveProductCosts(newCosts)) {
            setIsEditDialogOpen(false);
            setEditingProduct(null);
            setEditingCosts({});
        } else {
            setError('שגיאה בשמירת העלויות');
        }
    };

    // חישוב סטטיסטיקות מוצרים
    const productStats = React.useMemo(() => {
        if (!orders.length) return null;

        const stats = {
            block: { total: 0, sizes: {} },
            magnet: { total: 0, sizes: {} },
            photo: { total: 0, sizes: {} }
        };

        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    if (stats[item.type]) {
                        const quantity = item.quantity || 1;
                        stats[item.type].total += quantity;
                        
                        if (!stats[item.type].sizes[item.size]) {
                            stats[item.type].sizes[item.size] = 0;
                        }
                        stats[item.type].sizes[item.size] += quantity;
                    }
                });
            }
        });

        return stats;
    }, [orders]);

    // חישוב פירוט רווחיות באמצעות הפונקציות החדשות
    const profitabilityStats = React.useMemo(() => {
        if (!orders.length) return null;

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

        return productBreakdown;
    }, [orders, productCosts]);

    // חישוב סיכום כללי
    const overallStats = React.useMemo(() => {
        if (!orders.length) return { totalRevenue: 0, totalCosts: 0, estimatedProfit: 0 };

        const totalRevenue = orders.reduce((sum, order) => sum + (order.total_price || 0), 0);
        const totalCosts = orders.reduce((sum, order) => sum + calculateOrderCost(order, productCosts), 0);
        const estimatedProfit = totalRevenue - totalCosts;

        return { totalRevenue, totalCosts, estimatedProfit };
    }, [orders, productCosts]);

    // מוצר הנמכר ביותר השבוע האחרון
    const topProductThisWeek = React.useMemo(() => {
        if (!orders.length) return null;

        const oneWeekAgo = subDays(new Date(), 7);
        const recentOrders = orders.filter(order => {
            const orderDate = parseISO(order.created_date);
            return orderDate >= oneWeekAgo;
        });

        const weeklyStats = {};
        
        recentOrders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const key = `${item.type}_${item.size}`;
                    if (!weeklyStats[key]) {
                        weeklyStats[key] = {
                            type: item.type,
                            size: item.size,
                            count: 0
                        };
                    }
                    weeklyStats[key].count += (item.quantity || 1);
                });
            }
        });

        const topWeekly = Object.values(weeklyStats).sort((a, b) => b.count - a.count)[0];
        return topWeekly || null;
    }, [orders]);

    // מוצר הנמכר ביותר בכל הזמנים
    const topProductAllTime = React.useMemo(() => {
        if (!orders.length) return null;

        const allTimeStats = {};
        
        orders.forEach(order => {
            if (order.items && Array.isArray(order.items)) {
                order.items.forEach(item => {
                    const key = `${item.type}_${item.size}`;
                    if (!allTimeStats[key]) {
                        allTimeStats[key] = {
                            type: item.type,
                            size: item.size,
                            count: 0
                        };
                    }
                    allTimeStats[key].count += (item.quantity || 1);
                });
            }
        });

        const topAllTime = Object.values(allTimeStats).sort((a, b) => b.count - a.count)[0];
        return topAllTime || null;
    }, [orders]);

    const getProductName = (type) => {
        switch (type) {
            case 'block': return 'בלוקי עץ';
            case 'magnet': return 'מגנטים';
            case 'photo': return 'תמונות';
            case 'bookmark': return 'סימניות';
            default: return type;
        }
    };

    const getProductIcon = (type) => {
        switch (type) {
            case 'block': return Package;
            case 'magnet': return BarChart3;
            case 'photo': return TrendingUp;
            default: return Package;
        }
    };

    if (isLoading) return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-slate-500" /></div>;
    if (error) return <div className="container mx-auto p-6"><Alert variant="destructive"><AlertCircle className="h-4 w-4" /><AlertTitle>שגיאה</AlertTitle><AlertDescription>{error}</AlertDescription></Alert></div>;

    return (
        <div className="container mx-auto p-6" dir="rtl">
            <h1 className="text-3xl font-bold text-slate-800 mb-8">נתונים וסטטיסטיקות</h1>

            {/* סטטיסטיקות מוצרים */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                {productStats && Object.entries(productStats).map(([type, data]) => {
                    const Icon = getProductIcon(type);
                    return (
                        <Card key={type}>
                            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                <CardTitle className="text-sm font-medium">{getProductName(type)}</CardTitle>
                                <Icon className="h-4 w-4 text-muted-foreground" />
                            </CardHeader>
                            <CardContent>
                                <div className="text-2xl font-bold mb-4">{data.total} יחידות</div>
                                <div className="space-y-2">
                                    {Object.entries(data.sizes).map(([size, count]) => (
                                        <div key={size} className="flex justify-between text-sm">
                                            <span>{size}:</span>
                                            <span className="font-medium">{count}</span>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    );
                })}
            </div>

            {/* מוצרים פופולריים */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                {/* מוצר השבוע */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">המוצר הנמכר ביותר השבוע</CardTitle>
                        <Calendar className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        {topProductThisWeek ? (
                            <div className="space-y-2">
                                <div className="text-xl font-bold text-blue-600">
                                    {getProductName(topProductThisWeek.type)} {topProductThisWeek.size}
                                </div>
                                <div className="text-lg text-slate-600">
                                    {topProductThisWeek.count} יחידות
                                </div>
                                <div className="text-sm text-slate-500">
                                    7 הימים האחרונים
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-500">אין הזמנות השבוע</div>
                        )}
                    </CardContent>
                </Card>

                {/* מוצר כל הזמנים */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-lg font-medium">המוצר הנמכר ביותר בכל הזמנים</CardTitle>
                        <Trophy className="h-5 w-5 text-amber-500" />
                    </CardHeader>
                    <CardContent>
                        {topProductAllTime ? (
                            <div className="space-y-2">
                                <div className="text-xl font-bold text-amber-600">
                                    {getProductName(topProductAllTime.type)} {topProductAllTime.size}
                                </div>
                                <div className="text-lg text-slate-600">
                                    {topProductAllTime.count} יחידות
                                </div>
                                <div className="text-sm text-slate-500">
                                    מאז ההתחלה
                                </div>
                            </div>
                        ) : (
                            <div className="text-slate-500">אין נתונים</div>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* פירוט רווחיות לפי מוצרים */}
            {profitabilityStats && (
                <div className="mb-8">
                    <h2 className="text-xl font-semibold text-slate-800 mb-6">פירוט רווחיות לפי מוצרים</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {Object.entries(profitabilityStats)
                            .filter(([type, data]) => data.units > 0)
                            .map(([type, data]) => {
                                const productNames = {
                                    block: 'בלוקי עץ',
                                    magnet: 'מגנטים',
                                    photo: 'תמונות',
                                    bookmark: 'סימניות'
                                };
                                
                                const profit = data.revenue - data.costs;
                                const profitMargin = data.revenue > 0 ? (profit / data.revenue * 100) : 0;
                                
                                return (
                                    <Card key={type} className="relative">
                                        <CardHeader className="pb-2">
                                            <CardTitle className="text-lg font-medium flex items-center justify-between">
                                                {productNames[type]}
                                                <Badge variant="outline">{data.units} יח'</Badge>
                                            </CardTitle>
                                        </CardHeader>
                                        <CardContent className="space-y-3">
                                            <div className="flex justify-between text-sm">
                                                <span>הכנסות:</span>
                                                <span className="font-medium text-green-600">₪{data.revenue.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span>עלויות:</span>
                                                <span className="font-medium text-red-600">₪{data.costs.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm border-t pt-2">
                                                <span>רווח:</span>
                                                <span className={`font-bold ${profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                    ₪{profit.toFixed(2)}
                                                </span>
                                            </div>
                                            <div className="flex justify-between text-xs text-slate-500">
                                                <span>רווחיות:</span>
                                                <span>{profitMargin.toFixed(1)}%</span>
                                            </div>
                                            
                                            {/* הצגת עלויות נוכחיות */}
                                            <div className="mt-4 pt-3 border-t">
                                                <div className="flex items-center justify-between mb-2">
                                                    <h4 className="text-xs font-medium text-slate-600">עלויות נוכחיות:</h4>
                                                    <Button
                                                        variant="ghost"
                                                        size="sm"
                                                        onClick={() => handleEditCosts(type)}
                                                        className="h-6 w-6 p-0 text-slate-400 hover:text-slate-600"
                                                    >
                                                        <Edit3 className="h-3 w-3" />
                                                    </Button>
                                                </div>
                                                <div className="space-y-1 text-xs">
                                                    {type === 'bookmark' ? (
                                                        <div className="flex justify-between">
                                                            <span>יחידה:</span>
                                                            <span>₪{productCosts.bookmark.toFixed(2)}</span>
                                                        </div>
                                                    ) : (
                                                        Object.entries(productCosts[type] || {}).map(([size, cost]) => (
                                                            <div key={size} className="flex justify-between">
                                                                <span>{size}:</span>
                                                                <span>₪{cost.toFixed(2)}</span>
                                                            </div>
                                                        ))
                                                    )}
                                                </div>
                                            </div>
                                        </CardContent>
                                    </Card>
                                );
                            })}
                    </div>
                </div>
            )}

            {/* הערה לגבי זמן הזמנה */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-lg font-medium">זמן ממוצע להזמנה</CardTitle>
                    <Clock className="h-5 w-5 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-slate-600">
                        <p>נתון זה אינו זמין כרגע מכיוון שאיננו עוקבים אחר זמן הביקור באתר.</p>
                        <p className="mt-2 text-sm text-slate-500">
                            כדי לקבל נתון זה, יש צורך להוסיף מעקב Google Analytics או כלי דומה.
                        </p>
                    </div>
                </CardContent>
            </Card>

            {/* סיכום כללי */}
            <div className="mt-8 bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-6">
                <h2 className="text-xl font-semibold text-slate-800 mb-4">סיכום כללי</h2>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-center">
                    <div>
                        <div className="text-2xl font-bold text-blue-600">
                            {orders.length}
                        </div>
                        <div className="text-sm text-slate-600">סה"כ הזמנות</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-green-600">
                            {productStats ? Object.values(productStats).reduce((sum, p) => sum + p.total, 0) : 0}
                        </div>
                        <div className="text-sm text-slate-600">סה"כ פריטים</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-emerald-600">
                            ₪{overallStats.totalRevenue.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-600">סה"כ הכנסות</div>
                    </div>
                    <div>
                        <div className="text-2xl font-bold text-red-600">
                            ₪{overallStats.totalCosts.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-600">סה"כ עלויות</div>
                    </div>
                    <div>
                        <div className={`text-2xl font-bold ${overallStats.estimatedProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ₪{overallStats.estimatedProfit.toFixed(2)}
                        </div>
                        <div className="text-sm text-slate-600">רווח משוער</div>
                    </div>
                </div>
            </div>

            {/* דיאלוג עריכת עלויות */}
            <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
                <DialogContent className="sm:max-w-[425px]" dir="rtl">
                    <DialogHeader>
                        <DialogTitle>עריכת עלויות - {editingProduct && getProductName(editingProduct)}</DialogTitle>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        {editingProduct === 'bookmark' ? (
                            <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="bookmark" className="text-right">
                                    עלות יחידה:
                                </Label>
                                <Input
                                    id="bookmark"
                                    value={editingCosts}
                                    onChange={(e) => setEditingCosts(parseFloat(e.target.value) || 0)}
                                    className="col-span-3"
                                    type="number"
                                    step="0.01"
                                />
                            </div>
                        ) : (
                            editingProduct && productCosts[editingProduct] && Object.keys(productCosts[editingProduct]).map(size => (
                                <div key={size} className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor={size} className="text-right">
                                        {size}:
                                    </Label>
                                    <Input
                                        id={size}
                                        value={editingCosts[size] || 0}
                                        onChange={(e) => setEditingCosts(prev => ({
                                            ...prev,
                                            [size]: parseFloat(e.target.value) || 0
                                        }))}
                                        className="col-span-3"
                                        type="number"
                                        step="0.01"
                                    />
                                </div>
                            ))
                        )}
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                            <X className="h-4 w-4 mr-2" />
                            ביטול
                        </Button>
                        <Button onClick={handleSaveCosts}>
                            <Save className="h-4 w-4 mr-2" />
                            שמור
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}