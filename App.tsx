
import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { SpendingForm } from './components/SpendingForm';
import { ResultsView } from './components/ResultsView';
import { AdminLogin } from './components/AdminLogin';
import { AdminDashboard } from './components/AdminDashboard';
import { INITIAL_SPENDING_PROFILE, CREDIT_CARDS as INITIAL_CARDS } from './constants';
import { SpendingProfile, RecommendationResult, CreditCard } from './types';
import { calculateRecommendations } from './services/recommendationService';
import { Button } from './components/Button';
import { CreditCard as CreditCardIcon, ArrowRight, Loader2 } from 'lucide-react';

// Simple Enum for View State
type ViewState = 'WELCOME' | 'INPUT' | 'LOADING' | 'RESULTS' | 'ADMIN_LOGIN' | 'ADMIN_DASHBOARD';

function App() {
  const [view, setView] = useState<ViewState>('WELCOME');
  const [spendingData, setSpendingData] = useState<SpendingProfile>(INITIAL_SPENDING_PROFILE);
  const [recommendations, setRecommendations] = useState<RecommendationResult[]>([]);
  
  // Lifted State for Cards to allow Admin Updates
  const [cards, setCards] = useState<CreditCard[]>(INITIAL_CARDS);

  const handleStart = () => {
    setView('INPUT');
    window.scrollTo(0, 0);
  };

  const handleFormSubmit = (data: SpendingProfile) => {
    setSpendingData(data);
    setView('LOADING');
  };

  const handleRecalculate = () => {
    setView('INPUT');
  };

  const handleHomeClick = () => {
    setView('WELCOME');
    setSpendingData(INITIAL_SPENDING_PROFILE);
  };

  const handleAdminClick = () => {
    setView('ADMIN_LOGIN');
  };

  // Simulate analysis process
  useEffect(() => {
    if (view === 'LOADING') {
      const timer = setTimeout(() => {
        // Use the dynamic 'cards' state instead of static constant
        const results = calculateRecommendations(spendingData, cards);
        setRecommendations(results);
        setView('RESULTS');
        window.scrollTo(0, 0);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [view, spendingData, cards]);

  return (
    <Layout onHomeClick={handleHomeClick} onAdminClick={handleAdminClick}>
      {view === 'WELCOME' && (
        <div className="flex flex-col items-center justify-center py-12 md:py-20 text-center animate-fadeIn">
          <div className="bg-indigo-50 p-4 rounded-full mb-8">
            <CreditCardIcon className="w-12 h-12 text-indigo-600" />
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 tracking-tight mb-6">
            Find Your Perfect <br className="hidden md:block" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 to-purple-600">
              Shopping Credit Card
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-600 max-w-2xl mb-10 leading-relaxed">
            Stop guessing. Tell us where you shop, and our engine will analyze 50+ credit cards to calculate your exact potential savings.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <Button size="lg" onClick={handleStart} className="px-10 text-lg shadow-xl shadow-indigo-200">
              Calculate My Savings <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </div>
          
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 text-left w-full max-w-4xl">
             <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-lg mb-2">Real Data</h3>
               <p className="text-slate-500 text-sm">We use actual spending patterns, not generic averages.</p>
             </div>
             <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-lg mb-2">Transparent</h3>
               <p className="text-slate-500 text-sm">See exactly how every rupee of savings is calculated.</p>
             </div>
             <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm">
               <h3 className="font-bold text-lg mb-2">Unbiased</h3>
               <p className="text-slate-500 text-sm">Pure math. We recommend what saves you the most.</p>
             </div>
          </div>
        </div>
      )}

      {view === 'INPUT' && (
        <SpendingForm initialData={spendingData} onSubmit={handleFormSubmit} />
      )}

      {view === 'LOADING' && (
        <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
          <Loader2 className="h-16 w-16 text-indigo-600 animate-spin mb-6" />
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Analyzing your spending...</h2>
          <p className="text-slate-500">Comparing rewards across major banks</p>
        </div>
      )}

      {view === 'RESULTS' && (
        <ResultsView results={recommendations} onRecalculate={handleRecalculate} />
      )}

      {view === 'ADMIN_LOGIN' && (
        <AdminLogin onLogin={() => setView('ADMIN_DASHBOARD')} />
      )}

      {view === 'ADMIN_DASHBOARD' && (
        <AdminDashboard 
          cards={cards} 
          onUpdateCards={setCards} 
          onLogout={() => setView('WELCOME')} 
        />
      )}
    </Layout>
  );
}

export default App;
