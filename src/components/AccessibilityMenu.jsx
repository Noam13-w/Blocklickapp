import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  Accessibility, 
  Type, 
  Contrast, 
  Link as LinkIcon, 
  Pause, 
  BookOpen,
  X,
  RotateCcw,
  Eye,
  ZoomIn,
  ZoomOut
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function AccessibilityMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [isButtonVisible, setIsButtonVisible] = useState(true);
  const [settings, setSettings] = useState({
    fontSize: 100,
    highContrast: false,
    highlightLinks: false,
    pauseAnimations: false,
    readingMode: false,
    keyboardNav: true,
    cursorSize: 'normal'
  });

  // טעינת הגדרות מ-localStorage ובדיקת מצב כפתור
  useEffect(() => {
    const savedSettings = localStorage.getItem('accessibility-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (e) {
        console.error('Failed to load accessibility settings:', e);
      }
    }

    const isHidden = sessionStorage.getItem('accessibility-button-hidden');
    if (isHidden) {
      setIsButtonVisible(false);
    }
  }, []);

  const hideButton = (e) => {
    e.stopPropagation();
    setIsButtonVisible(false);
    sessionStorage.setItem('accessibility-button-hidden', 'true');
  };

  // שמירת הגדרות ל-localStorage והחלה
  useEffect(() => {
    localStorage.setItem('accessibility-settings', JSON.stringify(settings));
    applySettings();
  }, [settings]);

  const applySettings = () => {
    const root = document.documentElement;

    // גודל גופן
    root.style.fontSize = `${settings.fontSize}%`;

    // ניגודיות גבוהה
    if (settings.highContrast) {
      root.classList.add('high-contrast');
    } else {
      root.classList.remove('high-contrast');
    }

    // הדגשת קישורים
    if (settings.highlightLinks) {
      root.classList.add('highlight-links');
    } else {
      root.classList.remove('highlight-links');
    }

    // השהיית אנימציות
    if (settings.pauseAnimations) {
      root.classList.add('pause-animations');
    } else {
      root.classList.remove('pause-animations');
    }

    // מצב קריאה
    if (settings.readingMode) {
      root.classList.add('reading-mode');
    } else {
      root.classList.remove('reading-mode');
    }

    // גודל סמן
    root.setAttribute('data-cursor-size', settings.cursorSize);
  };

  const increaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.min(prev.fontSize + 10, 150)
    }));
  };

  const decreaseFontSize = () => {
    setSettings(prev => ({
      ...prev,
      fontSize: Math.max(prev.fontSize - 10, 80)
    }));
  };

  const toggleSetting = (key) => {
    setSettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const resetSettings = () => {
    const defaultSettings = {
      fontSize: 100,
      highContrast: false,
      highlightLinks: false,
      pauseAnimations: false,
      readingMode: false,
      keyboardNav: true,
      cursorSize: 'normal'
    };
    setSettings(defaultSettings);
  };

  const changeCursorSize = (size) => {
    setSettings(prev => ({
      ...prev,
      cursorSize: size
    }));
  };

  return (
    <>
      <style>{`
        /* ניגודיות גבוהה */
        .high-contrast {
          filter: contrast(150%) brightness(1.1);
        }
        
        .high-contrast * {
          border-color: #000 !important;
        }

        /* הדגשת קישורים */
        .highlight-links a {
          background-color: #ffff00 !important;
          color: #000 !important;
          text-decoration: underline !important;
          padding: 2px 4px !important;
        }

        /* השהיית אנימציות */
        .pause-animations *,
        .pause-animations *::before,
        .pause-animations *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }

        /* מצב קריאה */
        .reading-mode {
          line-height: 1.8 !important;
          letter-spacing: 0.05em !important;
        }

        .reading-mode p {
          margin-bottom: 1.5em !important;
        }

        /* גודל סמן */
        [data-cursor-size="large"] * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M2 2 L2 28 L12 20 L16 28 L20 26 L16 18 L26 18 Z" fill="black" stroke="white" stroke-width="1"/></svg>') 0 0, auto !important;
        }

        [data-cursor-size="xlarge"] * {
          cursor: url('data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 48 48"><path d="M3 3 L3 42 L18 30 L24 42 L30 39 L24 27 L39 27 Z" fill="black" stroke="white" stroke-width="2"/></svg>') 0 0, auto !important;
        }

        /* focus visible */
        *:focus-visible {
          outline: 3px solid #0066cc !important;
          outline-offset: 2px !important;
        }

        /* כפתור נגישות צף */
        .accessibility-button {
          position: fixed;
          left: 20px;
          top: 50%;
          transform: translateY(-50%);
          z-index: 9999;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
        }

        @media (max-width: 768px) {
          .accessibility-button {
            bottom: 20px;
            top: auto;
            left: 20px;
            transform: none;
          }
        }
      `}</style>

      {/* כפתור צף לפתיחת תפריט הנגישות */}
      <AnimatePresence>
        {isButtonVisible && (
          <motion.div
            className="accessibility-button group"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20, scale: 0.8 }}
            transition={{ delay: 1 }}
          >
            <div className="relative">
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg transition-transform hover:scale-105"
                aria-label="פתח תפריט נגישות"
                title="תפריט נגישות"
              >
                <Accessibility className="h-5 w-5" />
              </Button>
              
              <button
                onClick={hideButton}
                className="absolute -top-1 -right-1 bg-slate-500 hover:bg-slate-600 text-white rounded-full w-4 h-4 flex items-center justify-center shadow-sm opacity-0 group-hover:opacity-100 transition-opacity"
                title="הסתר נגישות"
              >
                <X className="h-2.5 w-2.5" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* דיאלוג תפריט נגישות */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold flex items-center gap-3">
              <Accessibility className="h-6 w-6 text-blue-600" />
              <span>הצהרת נגישות - תקן 5568</span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* הצהרה */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-sm text-slate-700 leading-relaxed">
                אתר זה פועל על פי הנחיות תקן ישראלי 5568 לנגישות תכנים באינטרנט ברמה AA. 
                התאמות הנגישות מאפשרות גלישה נוחה לאנשים עם מוגבלויות.
              </p>
            </div>

            {/* גודל טקסט */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Type className="h-5 w-5 text-blue-600" />
                <span>גודל טקסט</span>
              </h3>
              <div className="flex items-center gap-4">
                <Button
                  onClick={decreaseFontSize}
                  disabled={settings.fontSize <= 80}
                  variant="outline"
                  className="flex items-center gap-2"
                  aria-label="הקטן טקסט"
                >
                  <ZoomOut className="h-4 w-4" />
                  <span>הקטן</span>
                </Button>
                <div className="flex-1 text-center">
                  <span className="text-lg font-semibold">{settings.fontSize}%</span>
                </div>
                <Button
                  onClick={increaseFontSize}
                  disabled={settings.fontSize >= 150}
                  variant="outline"
                  className="flex items-center gap-2"
                  aria-label="הגדל טקסט"
                >
                  <ZoomIn className="h-4 w-4" />
                  <span>הגדל</span>
                </Button>
              </div>
            </div>

            {/* אפשרויות נגישות */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold">אפשרויות תצוגה</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* ניגודיות גבוהה */}
                <button
                  onClick={() => toggleSetting('highContrast')}
                  className={`p-4 rounded-lg border-2 transition-all text-right ${
                    settings.highContrast
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  aria-pressed={settings.highContrast}
                >
                  <div className="flex items-center gap-3">
                    <Contrast className="h-5 w-5 text-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-800">ניגודיות גבוהה</p>
                      <p className="text-xs text-slate-600">הגברת ניגודיות הצבעים</p>
                    </div>
                  </div>
                </button>

                {/* הדגשת קישורים */}
                <button
                  onClick={() => toggleSetting('highlightLinks')}
                  className={`p-4 rounded-lg border-2 transition-all text-right ${
                    settings.highlightLinks
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  aria-pressed={settings.highlightLinks}
                >
                  <div className="flex items-center gap-3">
                    <LinkIcon className="h-5 w-5 text-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-800">הדגש קישורים</p>
                      <p className="text-xs text-slate-600">סימון ברור של קישורים</p>
                    </div>
                  </div>
                </button>

                {/* השהיית אנימציות */}
                <button
                  onClick={() => toggleSetting('pauseAnimations')}
                  className={`p-4 rounded-lg border-2 transition-all text-right ${
                    settings.pauseAnimations
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  aria-pressed={settings.pauseAnimations}
                >
                  <div className="flex items-center gap-3">
                    <Pause className="h-5 w-5 text-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-800">עצור אנימציות</p>
                      <p className="text-xs text-slate-600">הקפאת תנועות באתר</p>
                    </div>
                  </div>
                </button>

                {/* מצב קריאה */}
                <button
                  onClick={() => toggleSetting('readingMode')}
                  className={`p-4 rounded-lg border-2 transition-all text-right ${
                    settings.readingMode
                      ? 'bg-blue-100 border-blue-500'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                  aria-pressed={settings.readingMode}
                >
                  <div className="flex items-center gap-3">
                    <BookOpen className="h-5 w-5 text-slate-700" />
                    <div>
                      <p className="font-semibold text-slate-800">מצב קריאה</p>
                      <p className="text-xs text-slate-600">ריווח משופר לקריאה</p>
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {/* גודל סמן */}
            <div className="space-y-3">
              <h3 className="text-lg font-semibold flex items-center gap-2">
                <Eye className="h-5 w-5 text-blue-600" />
                <span>גודל סמן עכבר</span>
              </h3>
              <div className="flex gap-3">
                <Button
                  onClick={() => changeCursorSize('normal')}
                  variant={settings.cursorSize === 'normal' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  רגיל
                </Button>
                <Button
                  onClick={() => changeCursorSize('large')}
                  variant={settings.cursorSize === 'large' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  גדול
                </Button>
                <Button
                  onClick={() => changeCursorSize('xlarge')}
                  variant={settings.cursorSize === 'xlarge' ? 'default' : 'outline'}
                  className="flex-1"
                >
                  גדול מאוד
                </Button>
              </div>
            </div>

            {/* קיצורי מקלדת */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold mb-3">קיצורי מקלדת</h3>
              <div className="space-y-2 text-sm text-slate-700">
                <div className="flex justify-between">
                  <span>ניווט קדימה</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">Tab</kbd>
                </div>
                <div className="flex justify-between">
                  <span>ניווט אחורה</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">Shift + Tab</kbd>
                </div>
                <div className="flex justify-between">
                  <span>הפעלת אלמנט</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">Enter / Space</kbd>
                </div>
                <div className="flex justify-between">
                  <span>סגירת דיאלוג</span>
                  <kbd className="px-2 py-1 bg-white border border-slate-300 rounded text-xs">Esc</kbd>
                </div>
              </div>
            </div>

            {/* פעולות */}
            <div className="flex gap-3 pt-4 border-t border-slate-200">
              <Button
                onClick={resetSettings}
                variant="outline"
                className="flex-1 flex items-center justify-center gap-2"
              >
                <RotateCcw className="h-4 w-4" />
                <span>איפוס הגדרות</span>
              </Button>
              <Button
                onClick={() => setIsOpen(false)}
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                <span>סגור</span>
              </Button>
            </div>

            {/* יצירת קשר */}
            <div className="text-center text-sm text-slate-600 pt-4 border-t border-slate-200">
              <p>נתקלתם בבעיית נגישות?</p>
              <a 
                href="mailto:blocklick1@gmail.com" 
                className="text-blue-600 hover:underline font-semibold"
              >
                דווחו לנו: blocklick1@gmail.com
              </a>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}