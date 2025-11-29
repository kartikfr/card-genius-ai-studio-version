import React, { useState } from 'react';
import { RecommendationResult } from '../types';
import { Button } from './Button';
import { ChevronDown, ChevronUp, CheckCircle2, IndianRupee, Trophy, ExternalLink, Gift, Sparkles, Loader2, Globe } from 'lucide-react';
import { clsx } from 'clsx';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { fetchCardUpdates, SearchResult } from '../services/aiService';

interface Props {
  data: RecommendationResult;
  rank: number;
  isExpanded?: boolean;
}

export const RecommendationCard: React.FC<Props> = ({ data, rank, isExpanded = false }) => {
  const [expanded, setExpanded] = useState(isExpanded);
  const [loadingUpdates, setLoadingUpdates] = useState(false);
  const [updates, setUpdates] = useState<SearchResult | null>(null);
  
  const { card, monthlySavings, netAnnualSavings, breakdown, isFeeWaived } = data;
  
  // Prepare chart data
  const sortedBreakdown = [...breakdown].sort((a, b) => b.saved - a.saved);
  const chartData = sortedBreakdown.map(item => ({
    name: item.category === 'otherOnline' ? 'Other Online' : item.category.charAt(0).toUpperCase() + item.category.slice(1),
    value: item.saved
  }));

  const COLORS = ['#4f46e5', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#ef4444', '#6366f1', '#14b8a6'];

  const handleFetchUpdates = async () => {
    if (updates) return;
    setLoadingUpdates(true);
    const result = await fetchCardUpdates(card.name);
    setUpdates(result);
    setLoadingUpdates(false);
  };

  return (
    <div className={clsx(
      "bg-white rounded-xl overflow-hidden transition-all duration-300 border",
      rank === 1 ? "border-indigo-200 shadow-xl ring-1 ring-indigo-100 relative" : "border-slate-200 shadow-sm mt-6"
    )}>
      {rank === 1 && (
        <div className="bg-indigo-600 text-white text-xs font-bold px-3 py-1 absolute top-0 right-0 rounded-bl-xl z-10 flex items-center gap-1">
          <Trophy size={12} /> BEST MATCH
        </div>
      )}

      <div className="p-6 md:p-8">
        <div className="flex flex-col md:flex-row gap-6 md:items-start">
          {/* Card Image */}
          <div className="shrink-0 flex justify-center md:justify-start">
            <div className="relative w-40 h-24 md:w-56 md:h-36 rounded-lg overflow-hidden shadow-md bg-white border border-slate-100">
                <img src={card.imageUrl} alt={card.name} className="w-full h-full object-contain p-2" />
            </div>
          </div>

          {/* Header Info */}
          <div className="flex-1">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
              <div>
                <h3 className="text-xl font-bold text-slate-900 leading-tight">{card.name}</h3>
                <p className="text-slate-500 text-sm font-medium">{card.bank}</p>
              </div>
              <div className="text-left md:text-right bg-emerald-50 px-4 py-2 rounded-lg border border-emerald-100 w-full md:w-auto">
                <p className="text-xs font-medium text-emerald-700 uppercase tracking-wide">Net Annual Savings</p>
                <p className="text-2xl font-bold text-emerald-700">₹{Math.max(0, netAnnualSavings).toLocaleString('en-IN')}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-slate-600 mb-6 bg-slate-50 p-4 rounded-lg">
              <div>
                <span className="block text-xs text-slate-400 mb-1">Monthly Savings</span>
                <span className="font-semibold text-slate-900 block">₹{Math.round(monthlySavings).toLocaleString('en-IN')}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Annual Fee</span>
                <span className={clsx("font-semibold block", isFeeWaived ? "text-emerald-600" : "text-slate-900")}>
                  {isFeeWaived ? (
                    <span className="flex items-center gap-1">₹0 <span className="text-[10px] bg-emerald-100 px-1 rounded">WAIVED</span></span>
                  ) : (
                    `₹${card.annualFee}`
                  )}
                </span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Fee Waiver</span>
                <span className="truncate block text-xs md:text-sm" title={card.feeWaiver || 'N/A'}>{card.feeWaiver || 'N/A'}</span>
              </div>
              <div>
                <span className="block text-xs text-slate-400 mb-1">Joining Bonus</span>
                <span className="truncate block text-indigo-600 font-medium text-xs md:text-sm flex items-center gap-1" title={card.joiningBonus}>
                    {card.joiningBonus !== 'None' && <Gift size={12} />}
                    {card.joiningBonus || 'None'}
                </span>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3">
               <Button size="sm" onClick={() => setExpanded(!expanded)} variant="outline">
                {expanded ? 'Hide Breakdown' : 'See Savings Breakdown'}
                {expanded ? <ChevronUp className="ml-2 h-4 w-4" /> : <ChevronDown className="ml-2 h-4 w-4" />}
              </Button>
              <Button size="sm" className="w-full sm:w-auto bg-slate-900 hover:bg-slate-800">
                Apply Now <ExternalLink className="ml-2 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        {/* Expanded Details */}
        {expanded && (
          <div className="mt-8 pt-8 border-t border-slate-100 animate-fadeIn">
            <div className="grid md:grid-cols-2 gap-8">
              {/* Table Breakdown */}
              <div className="flex flex-col gap-8">
                <div>
                  <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                    <IndianRupee size={16} /> Where you save money
                  </h4>
                  <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                    {sortedBreakdown.map((item) => (
                      <div key={item.category} className="flex justify-between items-center text-sm p-3 bg-slate-50 rounded-lg border border-slate-100">
                        <div>
                          <span className="font-medium text-slate-700 capitalize block">
                            {item.category === 'otherOnline' ? 'Other Online' : item.category}
                          </span>
                          <span className="text-xs text-slate-400">Spend: ₹{item.spend.toLocaleString()} • Rate: {(item.rate * 100).toFixed(2)}%</span>
                        </div>
                        <span className="font-bold text-emerald-600">+₹{Math.round(item.saved).toLocaleString()}</span>
                      </div>
                    ))}
                    {breakdown.length === 0 && (
                      <p className="text-slate-400 text-sm italic">No savings found based on current input.</p>
                    )}
                  </div>
                </div>

                {/* AI Updates Section */}
                <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-xl p-5 border border-indigo-100">
                   <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-indigo-900 flex items-center gap-2">
                        <Sparkles size={16} className="text-indigo-600" /> 
                        Latest Updates
                      </h4>
                      {!updates && !loadingUpdates && (
                        <Button onClick={handleFetchUpdates} size="sm" variant="ghost" className="h-8 text-xs bg-white/50 hover:bg-white text-indigo-700">
                          Check for News
                        </Button>
                      )}
                   </div>
                   
                   {loadingUpdates && (
                     <div className="flex flex-col items-center justify-center py-6 text-slate-500">
                       <Loader2 className="animate-spin h-6 w-6 mb-2 text-indigo-500" />
                       <span className="text-xs">Searching for latest card news...</span>
                     </div>
                   )}

                   {updates && (
                     <div className="animate-fadeIn">
                       <div className="prose prose-sm prose-indigo text-slate-700 text-xs leading-relaxed mb-3">
                         {updates.text.split('\n').map((line, i) => (
                           <p key={i} className="mb-1">{line}</p>
                         ))}
                       </div>
                       {updates.sources.length > 0 && (
                         <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-indigo-100/50">
                           {updates.sources.map((source, idx) => (
                             <a 
                                key={idx} 
                                href={source.uri} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[10px] bg-white text-indigo-600 px-2 py-1 rounded border border-indigo-100 hover:bg-indigo-50 transition-colors"
                             >
                               <Globe size={10} />
                               {source.title.substring(0, 20)}...
                             </a>
                           ))}
                         </div>
                       )}
                     </div>
                   )}
                   
                   {!updates && !loadingUpdates && (
                     <p className="text-xs text-slate-500">
                       Get real-time info about devaluations, new offers, and terms directly from Google Search.
                     </p>
                   )}
                </div>
              </div>

              {/* Why this card & Chart */}
              <div>
                <h4 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                   <CheckCircle2 size={16} /> Key Benefits
                </h4>
                <ul className="space-y-3 mb-6">
                  {card.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-sm text-slate-600">
                      <CheckCircle2 className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                      <span className="leading-tight">{feature}</span>
                    </li>
                  ))}
                </ul>
                
                {chartData.length > 0 && (
                   <div className="h-48 w-full mt-8">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={chartData}
                            cx="50%"
                            cy="50%"
                            innerRadius={40}
                            outerRadius={70}
                            paddingAngle={2}
                            dataKey="value"
                          >
                            {chartData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="none" />
                            ))}
                          </Pie>
                          <Tooltip 
                            formatter={(value: number) => `₹${Math.round(value)}`}
                            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 10px rgb(0 0 0 / 0.1)', fontSize: '12px' }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                   </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};