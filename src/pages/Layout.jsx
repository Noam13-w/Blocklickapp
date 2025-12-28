
import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { base44 } from "@/api/base44Client";
import { createPageUrl } from "@/utils";
import { Button } from "@/components/ui/button";
import { LogOut, ShieldCheck, User as UserIcon, Loader2, Tag, MessageCircle, ChevronDown, TrendingUp } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { CartProvider } from "@/components/GlobalCart";
import CartIcon from "@/components/CartIcon";
import { Toaster } from 'react-hot-toast';
import AccessibilityMenu from "@/components/AccessibilityMenu";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";

const ADMIN_EMAILS = ["blocklick1@gmail.com", "noamnissan10@gmail.com"];

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCodeDialogOpen, setIsCodeDialogOpen] = useState(false);
  const [inputCode, setInputCode] = useState('');
  const [codeError, setCodeError] = useState('');
  const [showPrivacyDialog, setShowPrivacyDialog] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
    }, 50);
    
    return () => clearTimeout(timeoutId);
  }, [location.pathname]);

  useEffect(() => {
    const fetchUser = async () => {
      setIsLoading(true);
      try {
        const currentUser = await base44.auth.me();
        setUser(currentUser);
      } catch (error) {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, [location.key]);

  // Add meta tags to document head
  useEffect(() => {
    let googleVerificationMeta = document.querySelector('meta[name="google-site-verification"]');
    if (!googleVerificationMeta) {
      googleVerificationMeta = document.createElement('meta');
      googleVerificationMeta.setAttribute('name', 'google-site-verification');
      googleVerificationMeta.setAttribute('content', 'Se4FprioNk-bYKL-LikCgf7TV1ardvjaoIUkG1SbYGg');
      document.getElementsByTagName('head')[0].appendChild(googleVerificationMeta);
    }

    const ogTags = [
      { property: 'og:site_name', content: 'בלוקליק - הדפסות איכותיות' },
      { property: 'og:type', content: 'website' },
      { property: 'og:locale', content: 'he_IL' },
      { property: 'og:url', content: 'https://blocklick.base44.app' },
      { property: 'og:title', content: 'בלוקליק - פיתוח תמונות בזול, בלוקי עץ ומגנטים בקרני שומרון' },
      { property: 'og:description', content: 'פיתוח תמונות איכותי החל מ-0.7₪, בלוקי עץ מעוצבים ומגנטים. מתנות סוף שנה, איסוף מקרני שומרון. הזמינו עכשיו!' },
      { property: 'og:image', content: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a0d10edc6_LS20250728185756.png' },
      { property: 'og:image:width', content: '1200' },
      { property: 'og:image:height', content: '630' },
      { name: 'twitter:card', content: 'summary_large_image' },
      { name: 'twitter:title', content: 'בלוקליק - פיתוח תמונות בזול, בלוקי עץ ומגנטים' },
      { name: 'twitter:description', content: 'פיתוח תמונות איכותי החל מ-0.7₪ בקרני שומרון. בלוקי עץ מעוצבים ומגנטים. מתנות סוף שנה.' }
    ];

    ogTags.forEach(tag => {
      let existingTag = document.querySelector(`meta[${tag.property ? 'property' : 'name'}="${tag.property || tag.name}"]`);
      if (!existingTag) {
        existingTag = document.createElement('meta');
        existingTag.setAttribute(tag.property ? 'property' : 'name', tag.property || tag.name);
        document.getElementsByTagName('head')[0].appendChild(existingTag);
      }
      existingTag.setAttribute('content', tag.content);
    });

    let structuredData = document.querySelector('#structured-data');
    if (!structuredData) {
      structuredData = document.createElement('script');
      structuredData.setAttribute('type', 'application/ld+json');
      structuredData.setAttribute('id', 'structured-data');
      document.getElementsByTagName('head')[0].appendChild(structuredData);
    }

    const businessStructuredData = {
      "@context": "https://schema.org",
      "@type": "LocalBusiness",
      "name": "בלוקליק",
      "alternateName": "בלוק קליק",
      "description": "פיתוח תמונות איכותי, אינסטה בלוק בזול, צילום מגנטים והדפסה על בלוקי עץ בקרני שומרון. בלוק קליק - מתנות סוף שנה מותאמות אישית",
      "telephone": "0504928189",
      "email": "blocklick1@gmail.com",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "הקוממיות 4",
        "addressLocality": "קרני שומרון",
        "addressCountry": "IL"
      },
      "geo": {
        "@type": "GeoCoordinates",
        "latitude": "32.1689",
        "longitude": "35.0818"
      },
      "url": "https://blocklick.base44.app",
      "priceRange": "₪₪",
      "paymentAccepted": ["Cash", "Bit", "PayBox"],
      "currenciesAccepted": "ILS",
      "openingHours": "Mo-Su 09:00-21:00",
      "serviceArea": {
        "@type": "Place",
        "name": "ישראל"
      },
      "hasOfferCatalog": {
        "@type": "OfferCatalog",
        "name": "שירותי הדפסה",
        "itemListElement": [
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "פיתוח תמונות",
              "description": "פיתוח תמונות איכותי בהדפסה תרמית"
            },
            "price": "0.7",
            "priceCurrency": "ILS"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "בלוקי עץ",
              "description": "הדפסה איכותית על בלוקי עץ טבעי"
            },
            "price": "18",
            "priceCurrency": "ILS"
          },
          {
            "@type": "Offer",
            "itemOffered": {
              "@type": "Product",
              "name": "מגנטים",
              "description": "מגנטים איכותיים בהדפסה עמידה"
            },
            "price": "2.5",
            "priceCurrency": "ILS"
          }
        ]
      }
    };

    structuredData.textContent = JSON.stringify(businessStructuredData);
  }, []);

  const handleLogout = async () => {
    await base44.auth.logout();
    window.location.href = createPageUrl("Home");
  };

  const handleAdminLoginClick = () => {
    setInputCode('');
    setCodeError('');
    setIsCodeDialogOpen(true);
  };
  
  const handleCodeSubmit = () => {
    if (inputCode === 'Noam794166209') {
      setIsCodeDialogOpen(false);
      base44.auth.redirectToLogin();
    } else {
      setCodeError('קוד אישור שגוי. נסה שנית.');
    }
  };

  const isAdmin = user && ADMIN_EMAILS.some(email => email.toLowerCase() === user.email.toLowerCase());
  const isHomePage = currentPageName === 'Home' || location.pathname === '/' || location.pathname === '/Home';

  return (
    <CartProvider>
      <div className="min-h-screen bg-slate-50" dir="rtl">
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
          
          body, *, .font-sans {
            font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
            font-feature-settings: 'cv02', 'cv03', 'cv04', 'cv11';
            font-weight: 400;
          }

          h1, h2, h3, h4, h5, h6 {
            font-weight: 500 !important;
          }

          .font-bold {
            font-weight: 600 !important;
          }

          .font-semibold {
            font-weight: 500 !important;
          }

          .font-medium {
            font-weight: 500 !important;
          }

          html {
            scroll-behavior: auto !important;
          }

          *:focus {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
            border-radius: 4px;
          }

          button:focus,
          a:focus,
          input:focus,
          textarea:focus,
          select:focus {
            outline: 3px solid #3b82f6;
            outline-offset: 2px;
          }

          @media (prefers-contrast: high) {
            .bg-gradient-to-r {
              background: #000 !important;
              color: #fff !important;
            }
            
            .text-slate-600 {
              color: #000 !important;
            }
            
            .border-slate-200 {
              border-color: #000 !important;
            }
          }

          body {
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            text-rendering: optimizeLegibility;
            letter-spacing: -0.01em;
          }

          @keyframes pulse {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.5; }
          }

          .loading {
            animation: pulse 2s infinite;
          }

          * {
            will-change: auto;
          }

          img {
            content-visibility: auto;
          }

          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }

          @media (max-width: 768px) {
            .motion-reduce {
              transform: none !important;
              animation: none !important;
              transition: none !important;
            }
          }
        `}</style>
        
        <header className="bg-white/95 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-50 shadow-sm">
          <nav className="container mx-auto px-6 py-4 flex justify-between items-center relative">
            <Link to={createPageUrl("Home")} className="text-2xl font-bold text-slate-800 hover:text-amber-600 transition-colors flex items-center gap-2 z-10">
              <img 
                src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a0d10edc6_LS20250728185756.png" 
                alt="בלוקליק" 
                className="w-8 h-8 object-contain"
              />
              בלוקליק
            </Link>

            <div className="flex items-center gap-3 z-10">
              <Button
                onClick={() => window.open('https://wa.me/9720504928189', '_blank')}
                variant="ghost"
                className="flex items-center gap-2 text-slate-600 hover:bg-green-100 hover:text-green-700 rounded-full z-10"
              >
                <MessageCircle className="h-5 w-5" />
                <span className="hidden sm:inline">צור קשר</span>
              </Button>

              <div className="z-10">
                <CartIcon />
              </div>

              {isLoading ? (
                <div className="w-8 h-8 flex items-center justify-center z-10">
                  <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                </div>
              ) : user ? (
                <div className="flex items-center gap-3 z-10">
                  {isAdmin && (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 text-slate-600 hover:bg-amber-100 hover:text-amber-700 rounded-full z-10">
                          <ShieldCheck className="h-5 w-5" />
                          <span className="hidden sm:inline">ניהול</span>
                          <ChevronDown className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48 z-[60]" dir="rtl">
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("AdminOrders")} className="flex items-center gap-2 w-full">
                            <ShieldCheck className="h-4 w-4" />
                            <span>ניהול הזמנות</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("AdminCoupons")} className="flex items-center gap-2 w-full">
                            <Tag className="h-4 w-4" />
                            <span>ניהול קופונים</span>
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to={createPageUrl("AdminAnalytics")} className="flex items-center gap-2 w-full">
                            <TrendingUp className="h-4 w-4" />
                            <span>נתונים וסטטיסטיקות</span>
                          </Link>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  )}
                  
                  <div className="flex items-center gap-2 text-slate-600 bg-slate-100 rounded-full px-3 py-2 z-10">
                      <UserIcon className="h-4 w-4" />
                      <span className="font-medium text-sm hidden sm:inline">{user.full_name}</span>
                  </div>
                  
                  <Button onClick={handleLogout} size="sm" variant="outline" className="rounded-full hover:bg-red-50 hover:text-red-600 hover:border-red-200 z-10">
                    <LogOut className="h-4 w-4 ml-2" />
                    <span>התנתק</span>
                  </Button>
                </div>
              ) : !isHomePage ? null : ( 
                <div></div>
              )}
            </div>
          </nav>
        </header>

        <main className="min-h-screen">
          {children}
        </main>

        <footer className="bg-gradient-to-r from-slate-800 to-slate-900 text-white border-t border-slate-700 mt-12">
          <div className="container mx-auto px-6 py-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <div>
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <img 
                    src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a0d10edc6_LS20250728185756.png" 
                    alt="בלוקליק" 
                    className="w-6 h-6 object-contain"
                  />
                  בלוקליק
                </h3>
                <p className="text-slate-300 leading-relaxed">
                  הדפסות איכותיות על בלוקי עץ, מגנטים ותמונות. 
                  איכות פרימיום ושירות מקצועי.
                </p>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">קישורים מהירים</h4>
                <div className="space-y-2">
                  <Link to={createPageUrl("Blocks")} className="block text-slate-300 hover:text-white transition-colors">
                    בלוקי עץ
                  </Link>
                  <Link to={createPageUrl("Magnets")} className="block text-slate-300 hover:text-white transition-colors">
                    מגנטים
                  </Link>
                  <Link to={createPageUrl("Photos")} className="block text-slate-300 hover:text-white transition-colors">
                    הדפסת תמונות
                  </Link>
                </div>
              </div>
              
              <div>
                <h4 className="font-semibold mb-4">צור קשר</h4>
                <div className="space-y-2 text-slate-300">
                  <p>
                    📞 <a 
                      href="https://wa.me/9720504928189" 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="hover:text-green-400 transition-colors cursor-pointer"
                    >
                      0504928189
                    </a>
                  </p>
                  <p>📧 blocklick1@gmail.com</p>
                  <p>📍 הקוממיות 4, קרני שומרון</p>
                </div>
              </div>
            </div>
            
            <div className="border-t border-slate-700 mt-8 pt-6 text-center text-slate-400">
              <p>&copy; {new Date().getFullYear()} בלוקליק. כל הזכויות שמורות.</p>
              
              {isHomePage && !user && (
                <div className="mt-4 flex justify-center gap-4">
                  <Button 
                    onClick={handleAdminLoginClick}
                    variant="ghost" 
                    size="sm"
                    className="text-slate-500 hover:text-slate-300 text-xs"
                  >
                    כניסת מנהל
                  </Button>
                  <Button 
                    onClick={() => setShowPrivacyDialog(true)}
                    variant="ghost" 
                    size="sm"
                    className="text-slate-500 hover:text-slate-300 text-xs"
                  >
                    מדיניות פרטיות
                  </Button>
                </div>
              )}
            </div>
          </div>
        </footer>

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

        <Dialog open={isCodeDialogOpen} onOpenChange={setIsCodeDialogOpen}>
          <DialogContent className="sm:max-w-[425px]" dir="rtl">
            <DialogHeader>
              <DialogTitle>כניסת מנהל</DialogTitle>
              <DialogDescription>
                יש להזין קוד אישור כדי להמשיך.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="flex flex-col gap-2">
                <Label htmlFor="code" className="text-right">
                  קוד אישור
                </Label>
                <Input
                  id="code"
                  value={inputCode}
                  onChange={(e) => setInputCode(e.target.value)}
                  type="password"
                  placeholder="הכנס את הקוד"
                  onKeyPress={(e) => e.key === 'Enter' && handleCodeSubmit()}
                />
              </div>
              {codeError && <p className="text-red-500 text-sm">{codeError}</p>}
            </div>
            <DialogFooter>
              <Button onClick={() => setIsCodeDialogOpen(false)} variant="outline">ביטול</Button>
              <Button onClick={handleCodeSubmit}>המשך</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={showPrivacyDialog} onOpenChange={setShowPrivacyDialog}>
          <DialogContent className="sm:max-w-[800px] max-h-[90vh] overflow-y-auto" dir="rtl">
            <DialogHeader>
              <DialogTitle className="text-2xl font-bold text-slate-800">מדיניות פרטיות – Blocklick.com</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4 text-slate-700 leading-relaxed">
              <p>
                באתר Blocklick.com ("האתר") אנו מכבדים את פרטיות המשתמשים ושומרים על המידע האישי הנאסף במסגרת השימוש באתר. מטרת מסמך זה היא לפרט כיצד אנו אוספים, משתמשים, שומרים ומגנים על המידע.
              </p>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">1. איסוף מידע</h3>
                <p className="mb-3">בעת השימוש באתר אנו עשויים לאסוף את המידע הבא:</p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>פרטי קשר שמסרת (שם מלא, כתובת אימייל, מספר טלפון).</li>
                  <li>פרטי הזמנה ותשלום (כתובת למשלוח, פרטי תשלום)</li>
                  <li>תמונות שהמשתמש מעלה לצורך הפקת המוצר.</li>
                  <li>מידע טכני על השימוש באתר (כגון כתובת IP, סוג דפדפן, נתוני שימוש אנונימיים).</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">2. שימוש במידע</h3>
                <p className="mb-3">המידע שנאסף ישמש אותנו למטרות הבאות:</p>
                <ul className="list-disc list-inside space-y-1 mr-4">
                  <li>אספקת השירות והשלמת הזמנות.</li>
                  <li>שיפור חוויית המשתמש באתר.</li>
                  <li>מתן תמיכה ושירות לקוחות.</li>
                  <li>שליחת עדכונים, הצעות שיווקיות ומבצעים.</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">3. שמירת תמונות</h3>
                <p>
                  התמונות שהמשתמש מעלה משמשות אך ורק לצורך הפקת המוצר שהוזמן. התמונות אינן מועברות לגורמים אחרים ואינן נחשפות לציבור. אנו שומרים את התמונות לפרק זמן סביר הנדרש לצורך השלמת ההזמנה בלבד, ולאחר מכן הן עשויות להימחק ממערכותינו אך לא הכרחי.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">4. העברת מידע לצדדים שלישיים</h3>
                <p>
                  אנו עשויים לשתף מידע אישי רק עם גורמים חיצוניים המסייעים לנו בהפעלת האתר ובמתן השירות (כגון ספקי תשלום, שירותי משלוחים). לא נעביר מידע לצדדים שלישיים למטרות אחרות ללא הסכמתך המפורשת, אלא אם נידרש לכך על פי דין.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">5. אבטחת מידע</h3>
                <p>
                  אנו מיישמים אמצעים סבירים ומקובלים לשמירה על המידע האישי מפני גישה לא מורשית, שימוש לרעה או חשיפה. יחד עם זאת, אין באפשרותנו להבטיח אבטחה מוחלטת.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">6. קוקיז (Cookies)</h3>
                <p>
                  האתר עושה שימוש בקבצי קוקיז לצורך תפעול תקין, ניתוח שימוש ושיפור חוויית המשתמש. באפשרותך לנהל או לחסום שימוש בקוקיז דרך הגדרות הדפדפן שלך.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">7. זכויות המשתמש</h3>
                <p>
                  כל משתמש רשאי לעיין במידע שנאסף עליו, לבקש את תיקונו או את מחיקתו, בהתאם להוראות הדין.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">8. עדכוני מדיניות</h3>
                <p>
                  מדיניות זו עשויה להתעדכן מעת לעת. הגרסה המעודכנת תפורסם באתר ותיכנס לתוקף מיד עם פרסומה.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-slate-800 mb-3">9. יצירת קשר</h3>
                <p>
                  לשאלות נוספות ניתן לפנות אלינו בכתובת האימייל: blocklick1@gmail.com
                </p>
              </div>
            </div>
            <div className="flex justify-center pt-4">
              <Button
                onClick={() => setShowPrivacyDialog(false)}
                className="bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white px-8"
              >
                הבנתי
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        <AccessibilityMenu />
        </div>
        </CartProvider>
        );
        }
