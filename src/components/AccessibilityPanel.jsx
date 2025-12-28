import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Accessibility, Plus, Minus, Eye, Contrast, Type, Volume2 } from 'lucide-react';

export default function AccessibilityPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [fontSize, setFontSize] = useState(100);
  const [highContrast, setHighContrast] = useState(false);
  const [dyslexicFont, setDyslexicFont] = useState(false);

  useEffect(() => {
    // Load saved preferences
    const savedFontSize = localStorage.getItem('accessibility_fontSize');
    const savedHighContrast = localStorage.getItem('accessibility_highContrast');
    const savedDyslexicFont = localStorage.getItem('accessibility_dyslexicFont');

    if (savedFontSize) setFontSize(parseInt(savedFontSize));
    if (savedHighContrast) setHighContrast(savedHighContrast === 'true');
    if (savedDyslexicFont) setDyslexicFont(savedDyslexicFont === 'true');
  }, []);

  useEffect(() => {
    // Apply font size
    document.documentElement.style.fontSize = `${fontSize}%`;
    localStorage.setItem('accessibility_fontSize', fontSize.toString());
  }, [fontSize]);

  useEffect(() => {
    // Apply high contrast
    if (highContrast) {
      document.body.classList.add('high-contrast');
    } else {
      document.body.classList.remove('high-contrast');
    }
    localStorage.setItem('accessibility_highContrast', highContrast.toString());
  }, [highContrast]);

  useEffect(() => {
    // Apply dyslexic font
    if (dyslexicFont) {
      document.body.classList.add('dyslexic-font');
    } else {
      document.body.classList.remove('dyslexic-font');
    }
    localStorage.setItem('accessibility_dyslexicFont', dyslexicFont.toString());
  }, [dyslexicFont]);

  const resetSettings = () => {
    setFontSize(100);
    setHighContrast(false);
    setDyslexicFont(false);
    localStorage.removeItem('accessibility_fontSize');
    localStorage.removeItem('accessibility_highContrast');
    localStorage.removeItem('accessibility_dyslexicFont');
  };

  return (
    <>
      {/* Accessibility Button */}
      <div className="fixed bottom-6 left-6 z-50">
        <Button
          onClick={() => setIsOpen(!isOpen)}
          className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 shadow-xl"
          title="הגדרות נגישות"
        >
          <Accessibility className="h-6 w-6 text-white" />
        </Button>
      </div>

      {/* Accessibility Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, x: -100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -100 }}
            className="fixed bottom-24 left-6 z-40 bg-white rounded-2xl shadow-2xl border border-slate-200 p-6 w-80"
            dir="rtl"
          >
            <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
              <Accessibility className="h-5 w-5 text-blue-600" />
              הגדרות נגישות
            </h3>

            <div className="space-y-4">
              {/* Font Size */}
              <div>
                <label className="flex items-center gap-2 text-sm font-medium text-slate-700 mb-2">
                  <Type className="h-4 w-4" />
                  גודל טקסט: {fontSize}%
                </label>
                <div className="flex items-center gap-3">
                  <Button
                    onClick={() => setFontSize(Math.max(80, fontSize - 10))}
                    size="sm"
                    variant="outline"
                    disabled={fontSize <= 80}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  <div className="flex-1 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${((fontSize - 80) / 40) * 100}%` }}
                    />
                  </div>
                  <Button
                    onClick={() => setFontSize(Math.min(120, fontSize + 10))}
                    size="sm"
                    variant="outline"
                    disabled={fontSize >= 120}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* High Contrast */}
              <div>
                <Button
                  onClick={() => setHighContrast(!highContrast)}
                  variant={highContrast ? "default" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <Contrast className="h-4 w-4" />
                  ניגודיות גבוהה
                </Button>
              </div>

              {/* Dyslexic Font */}
              <div>
                <Button
                  onClick={() => setDyslexicFont(!dyslexicFont)}
                  variant={dyslexicFont ? "default" : "outline"}
                  className="w-full justify-start gap-2"
                >
                  <Eye className="h-4 w-4" />
                  גופן לדיסלקסיה
                </Button>
              </div>

              {/* Reset */}
              <div className="pt-4 border-t border-slate-200">
                <Button
                  onClick={resetSettings}
                  variant="outline"
                  className="w-full"
                >
                  איפוס הגדרות
                </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* CSS Styles */}
      <style jsx global>{`
        .high-contrast {
          filter: contrast(150%) brightness(1.1);
        }
        
        .high-contrast * {
          text-shadow: none !important;
          box-shadow: none !important;
        }
        
        .dyslexic-font * {
          font-family: 'OpenDyslexic', Arial, sans-serif !important;
        }
      `}</style>
    </>
  );
}