import React from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';

export default function EmptyState({ 
  icon: Icon, 
  title, 
  description, 
  actionText, 
  actionLink, 
  actionClick 
}) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col items-center justify-center py-16 text-center px-4"
    >
      <div className="bg-slate-50 p-6 rounded-full mb-6">
        <Icon className="h-12 w-12 text-slate-300" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-md mb-8">{description}</p>
      
      {actionText && (actionLink || actionClick) && (
        actionLink ? (
          <Link to={createPageUrl(actionLink)}>
            <Button className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-8">
              {actionText}
            </Button>
          </Link>
        ) : (
          <Button 
            onClick={actionClick}
            className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-full px-8"
          >
            {actionText}
          </Button>
        )
      )}
    </motion.div>
  );
}