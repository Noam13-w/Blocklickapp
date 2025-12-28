import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { Button } from '@/components/ui/button';
import { Package, Magnet, Image as ImageIcon, ArrowLeft, Star, Heart, Zap, CheckCircle, ArrowDown, ArrowUp, MapPin } from 'lucide-react';
import ImageWithLoader from '@/components/ImageWithLoader';

export default function Home() {
  // SEO Meta information
  React.useEffect(() => {
    document.title = 'בלוקליק - פיתוח תמונות בזול קרני שומרון, בלוקי עץ ומגנטים | מתנות סוף שעה';
    
    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.getElementsByTagName('head')[0].appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', 'פיתוח תמונות בזול החל מ-0.7₪ בקרני שומרון! אינסטה בלוק מעוצב, צילום מגנטים איכותי. מתנות סוף שנה, איסוף עצמי. הזמינו עכשיו - איכות מעולה במחירים משתלמים!');
    
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (!metaKeywords) {
      metaKeywords = document.createElement('meta');
      metaKeywords.setAttribute('name', 'keywords');
      document.getElementsByTagName('head')[0].appendChild(metaKeywords);
    }
    metaKeywords.setAttribute('content', 'בלוק קליק, Blocklick, Block Click, בלוקליק, הדפסה תמונות, פיתוח תמונות בקדומים, פיתוח תמונות בזול, אינסטבלוקים במרכז, מתנות סוף שנה מומלצות, פיתוח תמונות קרני שומרון, בלוקי עץ, מגנטים, הדפסה דיגיטלית, מתנות סוף שנה קרני שומרון, מתנות מותאמות אישית, הדפסה על עץ, הדפסת תמונות איכותית, מגנטים מעוצבים, שומרון, מתנות אישיות, הדפסה תרמית, נייר פוטו, עץ טבעי, אינסטה בלוק בזול, צילום מגנטים, מתנות לגני ילדים, מתנות לסוף שנה, עיצוב תמונות, הדפסה על קנבס, מתנות לגננות, מתנות למורים, מתנות לעובדים, מתנות לחג, מתנות ליום הולדת, מתנה לבן זוג, מתנה לבת זוג, מתנה לאמא, מתנה לאבא, פיתוח תמונות בשומרון, דפוס בשומרון, מתנות בקרני שומרון, הדפסת תמונות אונליין, הזמנת תמונות מהנייד, פיתוח תמונות מהטלפון, בלוקים לאירועים, מגנטים לאירועים, הדפסת מגנטים, קולאז\' תמונות, תמונות לבית, עיצוב הבית, מזכרות לאירועים, מתנות לוועדי עובדים, הדפסה על בלוק, תמונות על עץ, מגנטים למקרר, פיתוח תמונות איכותי, שירות מהיר, הדפסת תמונות מהיום להיום, מתנות עם תמונה, הדפסה על עץ המקורי, פיתוח תמונות מהיר');

    // Add canonical URL
    let canonicalLink = document.querySelector('link[rel="canonical"]');
    if (!canonicalLink) {
      canonicalLink = document.createElement('link');
      canonicalLink.setAttribute('rel', 'canonical');
      document.getElementsByTagName('head')[0].appendChild(canonicalLink);
    }
    canonicalLink.setAttribute('href', 'https://blocklick.base44.app');

    // Add robots meta
    let robotsMeta = document.querySelector('meta[name="robots"]');
    if (!robotsMeta) {
      robotsMeta = document.createElement('meta');
      robotsMeta.setAttribute('name', 'robots');
      document.getElementsByTagName('head')[0].appendChild(robotsMeta);
    }
    robotsMeta.setAttribute('content', 'index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1');

    // Add author meta
    let authorMeta = document.querySelector('meta[name="author"]');
    if (!authorMeta) {
      authorMeta = document.createElement('meta');
      authorMeta.setAttribute('name', 'author');
      document.getElementsByTagName('head')[0].appendChild(authorMeta);
    }
    authorMeta.setAttribute('content', 'בלוקליק - הדפסות איכותיות');
  }, []);

  const scrollToProducts = () => {
    const productsSection = document.getElementById('products-section');
    if (productsSection) {
      productsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const categories = [
    {
      id: 'blocks',
      title: 'אינסטה בלוק', // Corrected from 'אינסטא בלוק'
      description: 'הדפסה איכותית על בלוקי עץ טבעי',
      icon: Package,
      image: 'https://base44.app/api/apps/685d8eb0c6e253c41e780e66/files/43f60a564_1000466182.png',
      link: 'Blocks',
      price: 'החל מ-₪18',
      features: ['3 גדלים זמינים', 'עץ טבעי איכותי', 'עטוף בצלופן'],
      gradient: 'from-amber-500 to-orange-600',
      bgGradient: 'from-amber-50 to-orange-50',
      buttonText: 'להזמנת בלוקים'
    },
    {
      id: 'magnets',
      title: 'מגנטים',
      description: 'מגנטים חזקים בגדלים שונים',
      icon: Magnet,
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/7f3ae4253_file_00000000f0d461fdb442a0931b03709a.png',
      link: 'Magnets',
      price: 'החל מ-₪2.5',
      features: ['מגנטים בגדלים שונים', 'הדבקה חזקה', 'הדפסה עמידה'],
      gradient: 'from-blue-500 to-purple-600',
      bgGradient: 'from-blue-50 to-purple-50',
      buttonText: 'להזמנת מגנטים'
    },
    {
      id: 'photos',
      title: 'פיתוח תמונות',
      description: 'תמונות באיכות פרימיום',
      icon: ImageIcon,
      image: 'https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/e0aad6f6b_file_0000000078ec61fdb8b3d63cfad53c171.png',
      link: 'Photos',
      price: 'החל מ-₪0.7',
      features: ['הדפסה תרמית איכותית', '3 גדלים זמינים', 'נייר פוטו פרימיום'],
      gradient: 'from-green-500 to-emerald-600',
      bgGradient: 'from-green-50 to-emerald-50',
      buttonText: 'להזמנת תמונות'
    }
  ];

  const features = [
    { 
      icon: Star, 
      title: 'איכות מעולה', 
      desc: 'חומרים איכותיים וטכנולוגיית הדפסה מתקדמת',
      gradient: 'from-yellow-500 to-orange-600',
      bgColor: 'from-yellow-50 to-orange-50'
    },
    { 
      icon: Zap, 
      title: 'הכנה מהירה', 
      desc: 'זמן הכנה של עד 3 ימי עסקים',
      gradient: 'from-blue-500 to-cyan-600',
      bgColor: 'from-blue-50 to-cyan-50'
    },
    { 
      icon: Heart, 
      title: 'עבודת יד', 
      desc: 'כל מוצר מיוצר בקפידה ובאהבה',
      gradient: 'from-pink-500 to-red-600',
      bgColor: 'from-pink-50 to-red-50'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white font-sans">
      {/* Hero Section */}
      <section className="relative py-12 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white overflow-hidden">
        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent)] opacity-20"></div>
        
        <div className="container mx-auto px-6 relative z-10">
          <div className="max-w-5xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              className="mb-6"
            >
              <div className="flex items-center justify-center gap-4 mb-8">
                <ImageWithLoader
                  src="https://qtrypzzcjebvfcihiynt.supabase.co/storage/v1/object/public/base44-prod/public/a0d10edc6_LS20250728185756.png" 
                  alt="בלוקליק" 
                  className="w-16 h-16 md:w-20 md:h-20 object-contain"
                />
                <h1 className="text-6xl md:text-8xl font-bold bg-gradient-to-r from-white via-amber-200 to-orange-300 bg-clip-text text-transparent leading-tight">
                  בלוקליק
                </h1>
              </div>
              <p className="text-2xl md:text-3xl text-slate-300 mb-4 leading-relaxed font-light">
                הדפסות איכותיות על בלוקי עץ, מגנטים ותמונות
              </p>
              <p className="text-xl text-amber-300 font-medium mb-6">
                הפכו את התמונות שלכם למזכרות מיוחדות
              </p>
              <p className="text-base text-amber-300 font-medium mb-6">
                איסוף עצמי מקרני שומרון
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.3 }}
            >
              <Button 
                onClick={scrollToProducts}
                size="lg" 
                className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-12 py-6 text-xl font-bold rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 font-sans"
              >
                גלה את כל המוצרים
                <ArrowDown className="mr-3 h-6 w-6" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Products Section */}
      <section id="products-section" className="py-12 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {categories.map((category, index) => {
              const Icon = category.icon;
              return (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 40, scale: 0.95 }}
                  whileInView={{ opacity: 1, y: 0, scale: 1 }}
                  viewport={{ once: true, amount: 0.2 }} // Changed amount to 0.2
                  transition={{ 
                    delay: index * 0.1, 
                    duration: 0.4, // Changed duration to 0.4
                    ease: [0.25, 0.46, 0.45, 0.94]
                  }}
                  whileHover={{ 
                    y: -8, 
                    scale: 1.02,
                    transition: { duration: 0.3 }
                  }}
                  className="group"
                >
                  <div className={`bg-gradient-to-br ${category.bgGradient} rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50 backdrop-blur-sm h-full flex flex-col`}>
                    {/* Product Image */}
                    <motion.div 
                      className="relative mb-6 rounded-2xl overflow-hidden bg-white shadow-lg"
                      whileHover={{ scale: 1.02 }}
                      transition={{ duration: 0.3 }}
                    >
                      <div className="w-full h-48 overflow-hidden">
                        <ImageWithLoader 
                          src={category.image} 
                          alt={category.title}
                          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                        />
                      </div>
                      <div className="absolute top-4 right-4">
                        <motion.div 
                          className={`w-12 h-12 bg-gradient-to-r ${category.gradient} rounded-xl flex items-center justify-center shadow-lg`}
                          whileHover={{ rotate: 10, scale: 1.1 }}
                          transition={{ duration: 0.2 }}
                        >
                          <Icon className="h-6 w-6 text-white" />
                        </motion.div>
                      </div>
                    </motion.div>

                    {/* Content */}
                    <div className="flex-1 flex flex-col">
                      <h3 className="text-2xl font-medium text-slate-900 mb-3">
                        {category.title}
                      </h3>
                      <p className="text-slate-600 mb-6 leading-relaxed flex-1 text-base">
                        {category.description}
                      </p>
                      
                      {/* Price */}
                      <div className={`text-3xl font-medium bg-gradient-to-r ${category.gradient} bg-clip-text text-transparent mb-6`}>
                        {category.price}
                      </div>
                      
                      {/* Features */}
                      <div className="space-y-3 mb-8">
                        {category.features.map((feature, idx) => (
                          <motion.div 
                            key={idx} 
                            className="flex items-center gap-3"
                            initial={{ opacity: 0, x: -10 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true, amount: 0.3 }} // Added amount to 0.3
                            transition={{ delay: (index * 0.1) + (idx * 0.05) + 0.2 }} // Adjusted delays
                          >
                            <CheckCircle className="h-5 w-5 text-green-600 flex-shrink-0" />
                            <span className="text-slate-700 text-base font-normal">{feature}</span>
                          </motion.div>
                        ))}
                      </div>

                      {/* CTA Button */}
                      <Link to={createPageUrl(category.link)} className="mt-auto">
                        <motion.div
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          <Button className={`w-full bg-gradient-to-r ${category.gradient} hover:shadow-xl text-white py-5 text-lg font-medium rounded-xl shadow-lg transition-all duration-300 group flex items-center justify-center gap-3`}>
                            <span>{category.buttonText}</span>
                            <ArrowLeft className="h-5 w-5 transition-transform group-hover:-translate-x-1 flex-shrink-0" />
                          </Button>
                        </motion.div>
                      </Link>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-white">
        <div className="container mx-auto px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }} // Changed amount to 0.3
            transition={{ duration: 0.4 }} // Changed duration to 0.4
            className="text-center mb-12"
          >
            <h2 className="text-5xl font-bold text-slate-900 mb-8 font-sans">למה לבחור בנו?</h2>
            <p className="text-2xl text-slate-600 max-w-3xl mx-auto font-light">
              אנחנו מתחייבים לספק לכם את האיכות הטובה ביותר עם שירות מעולה
            </p>
          </motion.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-10 max-w-6xl mx-auto">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.3 }} // Changed amount to 0.3
                transition={{ delay: index * 0.1, duration: 0.3 }} // Changed duration to 0.3
                whileHover={{ y: -12, scale: 1.03 }}
                className={`text-center group p-10 rounded-3xl bg-gradient-to-br ${feature.bgColor} shadow-xl hover:shadow-2xl transition-all duration-500 border border-white/50`}
              >
                <motion.div
                  whileHover={{ scale: 1.2, rotate: 10 }}
                  transition={{ type: "spring", stiffness: 300 }}
                  className={`w-24 h-24 bg-gradient-to-r ${feature.gradient} rounded-full flex items-center justify-center mx-auto mb-8 group-hover:shadow-2xl transition-all duration-300`}
                >
                  <feature.icon className="h-12 w-12 text-white" />
                </motion.div>
                <h3 className="text-3xl font-bold text-slate-900 mb-6 group-hover:text-slate-800 transition-colors duration-300 font-sans">
                  {feature.title}
                </h3>
                <p className="text-slate-600 leading-relaxed text-xl font-light">
                  {feature.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white">
        <div className="container mx-auto px-6 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.4 }} // Changed amount to 0.4
            transition={{ duration: 0.4 }} // Changed duration to 0.4
            className="max-w-5xl mx-auto"
          >
            <h2 className="text-5xl md:text-6xl font-medium mb-8 font-sans">
              הגעתם עד לכאן?
            </h2>
            <p className="text-2xl text-slate-300 mb-12 leading-relaxed font-light">
              התחילו את ההזמנה עוד היום
            </p>
            <Button 
              onClick={scrollToProducts}
              size="lg" 
              className="bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white px-16 py-8 text-2xl font-medium rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 font-sans"
            >
              התחל עכשיו
              <ArrowUp className="mr-4 h-7 w-7" />
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}