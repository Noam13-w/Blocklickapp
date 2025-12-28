import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Phone, Mail, MapPin, MessageCircle, Send, Clock, CheckCircle } from 'lucide-react';
import { SendEmail } from '@/api/integrations';

export default function ContactModal({ isOpen, onClose }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const emailBody = `
        הודעה חדשה מאתר בלוקליק:
        
        שם: ${formData.name}
        אימייל: ${formData.email}
        טלפון: ${formData.phone}
        נושא: ${formData.subject}
        
        הודעה:
        ${formData.message}
      `;

      await SendEmail({
        to: 'blockarnash@gmail.com',
        subject: `צור קשר - ${formData.subject}`,
        body: emailBody
      });

      setIsSubmitted(true);
      setTimeout(() => {
        onClose();
        setIsSubmitted(false);
        setFormData({
          name: '',
          email: '',
          phone: '',
          subject: '',
          message: ''
        });
      }, 2000);
    } catch (error) {
      console.error('Failed to send message:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-md" dir="rtl">
          <div className="text-center space-y-6 py-8">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto"
            >
              <CheckCircle className="h-10 w-10 text-green-600" />
            </motion.div>
            <h3 className="text-2xl font-bold text-slate-800">ההודעה נשלחה!</h3>
            <p className="text-slate-600">נחזור אליכם בהקדם האפשרי</p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto" dir="rtl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold flex items-center gap-3">
            <MessageCircle className="h-6 w-6 text-amber-600" />
            צור קשר
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <h3 className="text-lg font-semibold text-slate-800">פרטי התקשרות</h3>
            
            <div className="space-y-4">
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Phone className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-800">טלפון</p>
                  <p className="text-slate-600">058-580-2298</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Mail className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-800">אימייל</p>
                  <p className="text-slate-600">blockarnash@gmail.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <MapPin className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-800">כתובת איסוף</p>
                  <p className="text-slate-600">הקוממיות 4, קרני שומרון</p>
                </div>
              </div>

              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl">
                <Clock className="h-5 w-5 text-amber-600" />
                <div>
                  <p className="font-medium text-slate-800">שעות פעילות</p>
                  <p className="text-slate-600">ימים א'-ה' 09:00-17:00</p>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <h4 className="font-semibold text-amber-800 mb-2">💡 טיפ:</h4>
              <p className="text-amber-700 text-sm">
                לתגובה מהירה יותר, שלחו לנו הודעת וואטסאפ או התקשרו ישירות
              </p>
            </div>
          </div>

          {/* Contact Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="name">שם מלא *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">אימייל *</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                required
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="phone">טלפון</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="subject">נושא *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
                required
                className="mt-1"
                placeholder="מה הנושא שברצונכם לשאול עליו?"
              />
            </div>

            <div>
              <Label htmlFor="message">הודעה *</Label>
              <Textarea
                id="message"
                value={formData.message}
                onChange={(e) => setFormData({...formData, message: e.target.value})}
                required
                className="mt-1 h-32"
                placeholder="ספרו לנו איך נוכל לעזור..."
              />
            </div>

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
            >
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  שולח...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  שלח הודעה
                </span>
              )}
            </Button>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}