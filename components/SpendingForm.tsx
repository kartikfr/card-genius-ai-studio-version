import React, { useState } from 'react';
import { ArrowRight, ArrowLeft, ShoppingCart, Smartphone, Globe, CreditCard, Coffee, Plane, Fuel, Tv, Zap, CheckCircle2 } from 'lucide-react';
import { SpendingProfile } from '../types';
import { Button } from './Button';
import { Input } from './Input';
import { clsx } from 'clsx';

interface SpendingFormProps {
  initialData: SpendingProfile;
  onSubmit: (data: SpendingProfile) => void;
}

const CATEGORY_CONFIG = [
  { key: 'flipkart', label: 'Flipkart', icon: ShoppingCart, desc: 'Electronics, Fashion on Flipkart' },
  { key: 'amazon', label: 'Amazon', icon: ShoppingCart, desc: 'Shopping on Amazon.in' },
  { key: 'otherOnline', label: 'Other Online', icon: Globe, desc: 'Myntra, Nykaa, Ajio, etc.' },
  { key: 'grocery', label: 'Groceries', icon: ShoppingCart, desc: 'BigBasket, Blinkit, Instamart, Offline' },
  { key: 'dining', label: 'Dining & Food', icon: Coffee, desc: 'Swiggy, Zomato, Restaurants' },
  { key: 'utilities', label: 'Bills & Utilities', icon: Zap, desc: 'Electricity, Mobile, Broadband' },
  { key: 'fuel', label: 'Fuel', icon: Fuel, desc: 'Petrol, Diesel, CNG' },
  { key: 'movies', label: 'Movies & Events', icon: Tv, desc: 'BookMyShow, PVR, Inox' },
  { key: 'travel', label: 'Travel', icon: Plane, desc: 'Flights, Hotels, Cabs (Uber/Ola)' },
  { key: 'offline', label: 'Offline Retail', icon: Smartphone, desc: 'Malls, Local Shops, Department Stores' },
] as const;

export const SpendingForm: React.FC<SpendingFormProps> = ({ initialData, onSubmit }) => {
  const [mode, setMode] = useState<'SELECT_CATEGORIES' | 'INPUT_SPEND'>('SELECT_CATEGORIES');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [formData, setFormData] = useState<SpendingProfile>(initialData);

  // Toggle category selection
  const toggleCategory = (key: string) => {
    setSelectedCategories(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  const handleStartQuestions = () => {
    if (selectedCategories.length === 0) return;
    setMode('INPUT_SPEND');
    setCurrentStepIndex(0);
  };

  // Get only selected steps
  const activeSteps = CATEGORY_CONFIG.filter(c => selectedCategories.includes(c.key));
  const stepData = activeSteps[currentStepIndex];
  
  const progress = activeSteps.length > 0 
    ? ((currentStepIndex + 1) / activeSteps.length) * 100 
    : 0;

  const handleNext = () => {
    if (currentStepIndex < activeSteps.length - 1) {
      setCurrentStepIndex(prev => prev + 1);
    } else {
      onSubmit(formData);
    }
  };

  const handleBack = () => {
    if (currentStepIndex > 0) {
      setCurrentStepIndex(prev => prev - 1);
    } else {
      setMode('SELECT_CATEGORIES');
    }
  };

  const handleChange = (val: string) => {
    const num = parseInt(val.replace(/[^0-9]/g, ''), 10) || 0;
    if (stepData) {
      setFormData(prev => ({ ...prev, [stepData.key]: num }));
    }
  };

  const handleQuickSelect = (amount: number) => {
    if (stepData) {
      setFormData(prev => ({ ...prev, [stepData.key]: amount }));
    }
  };

  if (mode === 'SELECT_CATEGORIES') {
    return (
      <div className="max-w-3xl mx-auto animate-fadeIn">
        <div className="text-center mb-10">
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Where do you spend most?</h2>
          <p className="text-slate-500">Select the categories relevant to you. We'll skip the rest.</p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-10">
          {CATEGORY_CONFIG.map((cat) => {
            const isSelected = selectedCategories.includes(cat.key);
            return (
              <button
                key={cat.key}
                onClick={() => toggleCategory(cat.key)}
                className={clsx(
                  "flex flex-col items-center justify-center p-6 rounded-xl border-2 transition-all duration-200 h-40 text-center relative",
                  isSelected 
                    ? "border-indigo-600 bg-indigo-50 text-indigo-700 shadow-md transform scale-105" 
                    : "border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:bg-slate-50"
                )}
              >
                {isSelected && (
                  <div className="absolute top-3 right-3 text-indigo-600">
                    <CheckCircle2 size={20} fill="currentColor" className="text-white" />
                  </div>
                )}
                <cat.icon size={32} className="mb-4" strokeWidth={1.5} />
                <span className="font-semibold text-sm block">{cat.label}</span>
                <span className="text-xs text-slate-400 mt-1 hidden sm:block">{cat.desc.split(',')[0]}</span>
              </button>
            );
          })}
        </div>

        <div className="flex justify-center">
          <Button 
            size="lg" 
            onClick={handleStartQuestions} 
            disabled={selectedCategories.length === 0}
            className="px-12"
          >
            Continue <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
        </div>
        {selectedCategories.length === 0 && (
           <p className="text-center text-sm text-red-500 mt-4 animate-pulse">Please select at least one category to proceed</p>
        )}
      </div>
    );
  }

  // --- QUESTION MODE ---
  const currentVal = formData[stepData.key as keyof SpendingProfile];

  return (
    <div className="max-w-xl mx-auto animate-fadeIn">
      {/* Progress Bar */}
      <div className="mb-8">
        <div className="flex justify-between text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
          <span>Question {currentStepIndex + 1} of {activeSteps.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden">
          <div 
            className="h-full bg-indigo-600 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-8 min-h-[420px] flex flex-col">
        <div className="flex-1">
          <div className="inline-flex items-center justify-center p-3 bg-indigo-50 text-indigo-600 rounded-xl mb-6">
            <stepData.icon size={32} />
          </div>
          
          <h2 className="text-2xl font-bold text-slate-900 mb-2">
            Monthly spend on {stepData.label}?
          </h2>
          <p className="text-slate-500 mb-8">{stepData.desc}</p>

          <Input
            autoFocus
            type="text"
            inputMode="numeric"
            value={currentVal > 0 ? currentVal.toLocaleString('en-IN') : ''}
            onChange={(e) => handleChange(e.target.value)}
            placeholder="0"
            startAdornment={<span className="text-slate-500 font-medium">₹</span>}
            className="text-3xl font-bold h-16"
          />

          <div className="mt-6 flex flex-wrap gap-3">
            {[2000, 5000, 10000, 25000].map(amt => (
              <button
                key={amt}
                onClick={() => handleQuickSelect(amt)}
                className={clsx(
                  "px-4 py-2 rounded-full text-sm font-medium border transition-colors",
                  currentVal === amt 
                    ? "bg-indigo-600 text-white border-indigo-600" 
                    : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600"
                )}
              >
                ₹{amt.toLocaleString()}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 flex gap-4 pt-6 border-t border-slate-100">
          <Button 
            variant="ghost" 
            onClick={handleBack} 
          >
            <ArrowLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button 
            className="flex-1" 
            onClick={handleNext}
          >
            {currentStepIndex === activeSteps.length - 1 ? 'Calculate Savings' : 'Next'}
            {currentStepIndex !== activeSteps.length - 1 && <ArrowRight className="ml-2 h-4 w-4" />}
          </Button>
        </div>
      </div>
      
      {/* Total Spend Summary */}
      <div className="mt-6 text-center">
        <p className="text-sm text-slate-500">
          Total Estimated Spend: <span className="font-semibold text-slate-900">
            ₹{(Object.values(formData) as number[]).reduce((a, b) => a + b, 0).toLocaleString('en-IN')}
          </span>
        </p>
      </div>
    </div>
  );
};