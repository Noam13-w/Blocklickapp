import React, { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function ProgressSaver({ currentStep, productType, formData }) {
  useEffect(() => {
    // Save progress automatically
    const progressData = {
      step: currentStep,
      type: productType,
      data: formData,
      timestamp: Date.now()
    };

    localStorage.setItem(`progress_${productType}`, JSON.stringify(progressData));
    
    // Show save indicator
    if (currentStep > 1) {
      toast.success('התקדמות נשמרה אוטומטית', {
        duration: 2000,
        position: 'bottom-center',
      });
    }
  }, [currentStep, productType, formData]);

  return null;
}

// Helper function to load saved progress
export const loadSavedProgress = (productType) => {
  try {
    const saved = localStorage.getItem(`progress_${productType}`);
    if (saved) {
      const data = JSON.parse(saved);
      // Check if progress is less than 1 hour old
      if (Date.now() - data.timestamp < 3600000) {
        return data;
      }
    }
  } catch (error) {
    console.error('Failed to load saved progress:', error);
  }
  return null;
};

// Helper function to clear saved progress
export const clearSavedProgress = (productType) => {
  localStorage.removeItem(`progress_${productType}`);
};