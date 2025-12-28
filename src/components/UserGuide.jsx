import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { X, ChevronLeft, ChevronRight, Lightbulb, CheckCircle } from 'lucide-react';

const guides = {
  blocks: {
    title: 'מדריך בלוקי עץ',
    steps: [
      {
        title: 'ברוכים הבאים!',
        content: 'הדפסה על בלוקי עץ היא דרך מיוחדת להציג את התמונות שלכם. בואו נתחיל!',
        icon: '🌳',
        tips: ['איכות התמונה משפיעה על התוצאה', 'תמונות בחדות גבוהה יתנו תוצאה טובה יותר']
      },
      {
        title: 'בחירת גודל',
        content: 'בחרו את הגודל המתאים לכם. כל גודל מתאים לשימושים שונים.',
        icon: '📏',
        tips: ['10x10 מושלם לשולחן עבודה', '15x20 נהדר לתליה על הקיר', '20x30 יוצר אפקט מרשים']
      },
      {
        title: 'העלאת תמונה',
        content: 'העלו תמונה איכותית. התמונה צריכה להיות ברורה ובחדות טובה.',
        icon: '📷',
        tips: ['העלו תמונות בפורמט JPG או PNG', 'וודאו שהתמונה לא מטושטשת', 'תמונות כהות יותר נראות טוב על עץ']
      },
      {
        title: 'חיתוך ועריכה',
        content: 'חתכו את התמונה בצורה המתאימה לגודל שבחרתם.',
        icon: '✂️',
        tips: ['השאירו מקום לשוליים', 'מרכזו את החלק החשוב בתמונה', 'בדקו את התצוגה המקדימה']
      }
    ]
  },
  magnets: {
    title: 'מדריך מגנטים',
    steps: [
      {
        title: 'ברוכים הבאים למגנטים!',
        content: 'מגנטים מותאמים אישית הם דרך נהדרת לקשט את המקרר או כל משטח ברזל.',
        icon: '🧲',
        tips: ['מגנטים חזקים שלא נופלים', 'עמידים במים ובחום']
      },
      {
        title: 'בחירת גודל מגנט',
        content: 'בחרו מתוך מגוון הגדלים שלנו. כל גודל מתאים לשימוש אחר.',
        icon: '📐',
        tips: ['5x5 מתאים לתמונות קטנות וחמודות', '7x10 נהדר לתמונות משפחה', '10x15 יוצר אפקט בולט']
      },
      {
        title: 'העלאת תמונה איכותית',
        content: 'העלו תמונה ברורה שתיראה טוב בגודל הקטן של המגנט.',
        icon: '🖼️',
        tips: ['תמונות עם פרטים גדולים עובדות טוב יותר', 'הימנעו מתמונות עמוסות מדי', 'ודאו שהתמונה חדה']
      }
    ]
  },
  photos: {
    title: 'מדריך הדפסת תמונות',
    steps: [
      {
        title: 'ברוכים הבאים להדפסת תמונות!',
        content: 'הדפסת תמונות באיכות מקצועית על נייר פוטו איכותי.',
        icon: '📸',
        tips: ['איכות הדפסה מקצועית', 'נייר פוטו עמיד לאורך זמן']
      },
      {
        title: 'בחירת גודל תמונה',
        content: 'בחרו את הגודל המתאים לשימוש שלכם.',
        icon: '📏',
        tips: ['10x15 הגודל הפופולרי ביותר', '13x18 נהדר לאלבומים', 'ודאו שהתמונה מתאימה ליחס הגדלים']
      },
      {
        title: 'העלאת תמונות',
        content: 'העלו מספר תמונות בבת אחת לנוחיותכם.',
        icon: '📤',
        tips: ['אפשר להעלות מספר תמונות יחד', 'ודאו שכל התמונות ברורות', 'בחרו כמות לכל תמונה']
      }
    ]
  }
};

export default function UserGuide({ type, isOpen, onClose }) {
  const [currentStep, setCurrentStep] = useState(0);
  const guide = guides[type];

  if (!guide || !isOpen) return null;

  const nextStep = () => {
    if (currentStep < guide.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleFinish = () => {
    localStorage.setItem(`guide_${type}_completed`, 'true');
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl" dir="rtl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3 text-2xl">
            <Lightbulb className="h-6 w-6 text-amber-500" />
            {guide.title}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Progress Bar */}
          <div className="w-full bg-slate-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-amber-400 to-orange-500 h-2 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / guide.steps.length) * 100}%` }}
            />
          </div>

          <div className="text-center">
            <span className="text-sm text-slate-500">
              שלב {currentStep + 1} מתוך {guide.steps.length}
            </span>
          </div>

          {/* Current Step */}
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="text-center space-y-6"
            >
              <div className="text-6xl">{guide.steps[currentStep].icon}</div>
              
              <h3 className="text-2xl font-bold text-slate-800">
                {guide.steps[currentStep].title}
              </h3>
              
              <p className="text-lg text-slate-600 leading-relaxed">
                {guide.steps[currentStep].content}
              </p>

              {guide.steps[currentStep].tips && (
                <div className="bg-amber-50 rounded-xl p-4 border border-amber-200">
                  <h4 className="font-semibold text-amber-800 mb-3 flex items-center gap-2">
                    💡 טיפים חשובים:
                  </h4>
                  <ul className="space-y-2 text-right">
                    {guide.steps[currentStep].tips.map((tip, index) => (
                      <li key={index} className="flex items-start gap-2 text-amber-700">
                        <CheckCircle className="h-4 w-4 mt-0.5 text-amber-600 flex-shrink-0" />
                        <span className="text-sm">{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between items-center pt-6">
            <Button
              onClick={prevStep}
              variant="outline"
              disabled={currentStep === 0}
              className="flex items-center gap-2"
            >
              <ChevronRight className="h-4 w-4" />
              הקודם
            </Button>

            <div className="flex gap-2">
              {guide.steps.map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full transition-colors ${
                    index === currentStep ? 'bg-amber-500' : 
                    index < currentStep ? 'bg-green-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>

            {currentStep === guide.steps.length - 1 ? (
              <Button
                onClick={handleFinish}
                className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 flex items-center gap-2"
              >
                <CheckCircle className="h-4 w-4" />
                סיימתי!
              </Button>
            ) : (
              <Button
                onClick={nextStep}
                className="bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 flex items-center gap-2"
              >
                הבא
                <ChevronLeft className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}