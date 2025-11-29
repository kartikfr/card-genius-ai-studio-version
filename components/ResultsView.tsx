import React from 'react';
import { RecommendationResult } from '../types';
import { RecommendationCard } from './RecommendationCard';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { Button } from './Button';

interface Props {
  results: RecommendationResult[];
  onRecalculate: () => void;
}

export const ResultsView: React.FC<Props> = ({ results, onRecalculate }) => {
  const topMatch = results[0];
  const others = results.slice(1, 3);

  return (
    <div className="space-y-8 animate-fadeIn">
      <div className="flex items-center justify-between">
        <Button variant="ghost" onClick={onRecalculate} size="sm" className="pl-0 hover:bg-transparent hover:text-indigo-600">
          <ArrowLeft className="mr-2 h-4 w-4" /> Edit Spending
        </Button>
        <span className="text-sm text-slate-400">Analyzed {results.length} cards</span>
      </div>

      <div className="text-center space-y-2 mb-10">
        <div className="inline-flex items-center justify-center p-2 bg-emerald-100 text-emerald-800 rounded-full mb-2">
           <Sparkles className="w-4 h-4 mr-1" />
           <span className="text-xs font-bold uppercase tracking-wide">Optimization Complete</span>
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-slate-900">
          You could save <span className="text-emerald-600">₹{topMatch.netAnnualSavings.toLocaleString('en-IN')}</span> per year
        </h2>
        <p className="text-slate-500 max-w-lg mx-auto">
          Based on your spending habits, we've identified the credit card that will maximize your rewards.
        </p>
      </div>

      <div>
        <h3 className="text-lg font-semibold text-slate-900 mb-4">Top Recommendation</h3>
        <RecommendationCard data={topMatch} rank={1} isExpanded={true} />
      </div>

      {others.length > 0 && (
        <div className="pt-8">
          <h3 className="text-lg font-semibold text-slate-900 mb-4">Runner Ups</h3>
          <div className="space-y-4">
            {others.map((res, idx) => (
              <RecommendationCard key={res.card.id} data={res} rank={idx + 2} />
            ))}
          </div>
        </div>
      )}

      <div className="bg-slate-100 rounded-xl p-6 text-center mt-12">
         <h4 className="font-semibold text-slate-800 mb-2">Disclaimer</h4>
         <p className="text-xs text-slate-500 max-w-3xl mx-auto leading-relaxed">
           The savings calculated are estimates based on the reward rates provided by the banks for standard transactions. Actual savings may vary depending on specific merchant category codes (MCC), transaction types, and changes in bank policies. We do not guarantee approval of any credit card. Please read the full terms and conditions on the bank's website before applying.
         </p>
      </div>
    </div>
  );
};
