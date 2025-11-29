import { CREDIT_CARDS } from '../constants';
import { RecommendationResult, SavingsBreakdown, SpendingProfile } from '../types';

export const calculateRecommendations = (profile: SpendingProfile): RecommendationResult[] => {
  // Calculate total annual spend for fee waiver check
  const totalMonthlySpend = (Object.values(profile) as number[]).reduce((a, b) => a + b, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;

  const results: RecommendationResult[] = CREDIT_CARDS.map((card) => {
    let totalMonthlySavings = 0;
    const breakdown: SavingsBreakdown[] = [];

    // Helper to calculate savings for a category
    const calculateCategorySavings = (category: keyof SpendingProfile, spend: number) => {
      const reward = card.rewards[category];
      if (!reward) return { saved: 0, rate: 0 }; // Safety check for missing reward keys

      let saved = spend * reward.rate;
      
      // Apply Cap if exists
      // Note: Some cards have combined caps (like HSBC dining+grocery). 
      // For MVP, we use the specific cap defined in the constant.
      if (reward.cap && saved > reward.cap) {
        saved = reward.cap;
      }
      
      return { saved, rate: reward.rate };
    };

    // Calculate for all categories present in profile
    (Object.keys(profile) as Array<keyof SpendingProfile>).forEach((category) => {
      const spend = profile[category];
      if (spend > 0) {
        const { saved, rate } = calculateCategorySavings(category, spend);
        totalMonthlySavings += saved;
        
        if (saved > 0) {
          breakdown.push({
            category,
            spend,
            saved,
            rate
          });
        }
      }
    });

    // Special logic for Combined Caps (Hardcoded for specific popular edge cases)
    // 1. HSBC Cashback: Combined cap of 1000 for Dining, Grocery, Food Delivery
    if (card.id === 'hsbc-cashback') {
      const hsbcHighYield = ['dining', 'grocery'];
      let highYieldSavings = 0;
      
      // Recalculate these specific ones to enforce combined cap
      const otherSavings = breakdown.filter(b => !hsbcHighYield.includes(b.category));
      
      hsbcHighYield.forEach(cat => {
        const item = breakdown.find(b => b.category === cat);
        if (item) highYieldSavings += item.saved;
      });

      if (highYieldSavings > 1000) {
        const cappedTotal = 1000;
        // Reduce the total savings by the excess amount
        totalMonthlySavings = totalMonthlySavings - (highYieldSavings - cappedTotal);
        
        // Update breakdown for display purposes
        breakdown.forEach(b => {
           if (hsbcHighYield.includes(b.category)) {
             b.saved = (b.saved / highYieldSavings) * cappedTotal;
           }
        });
      }
    }

    const annualSavings = totalMonthlySavings * 12;
    
    // Fee Waiver Logic
    let appliedAnnualFee = card.annualFee;
    let isFeeWaived = false;

    if (card.waiverThreshold && totalAnnualSpend >= card.waiverThreshold) {
      appliedAnnualFee = 0;
      isFeeWaived = true;
    } else if (card.annualFee === 0) {
        isFeeWaived = true; // Lifetime free
    }

    const netAnnualSavings = annualSavings - appliedAnnualFee; 

    return {
      card,
      monthlySavings: totalMonthlySavings,
      annualSavings,
      netAnnualSavings,
      isFeeWaived,
      breakdown
    };
  });

  // Sort by Net Annual Savings Descending
  return results.sort((a, b) => b.netAnnualSavings - a.netAnnualSavings);
};