
import { CREDIT_CARDS as DEFAULT_CARDS } from '../constants';
import { RecommendationResult, SavingsBreakdown, SpendingProfile, CreditCard } from '../types';

export const calculateRecommendations = (profile: SpendingProfile, cards: CreditCard[] = DEFAULT_CARDS): RecommendationResult[] => {
  // Calculate total annual spend for fee waiver check
  const totalMonthlySpend = (Object.values(profile) as number[]).reduce((a, b) => a + b, 0);
  const totalAnnualSpend = totalMonthlySpend * 12;

  const results: RecommendationResult[] = cards.map((card) => {
    let totalMonthlySavings = 0;
    let breakdown: SavingsBreakdown[] = [];

    // 1. Calculate Individual Category Savings
    (Object.keys(profile) as Array<keyof SpendingProfile>).forEach((category) => {
      const spend = profile[category];
      const reward = card.rewards[category];

      if (spend > 0 && reward) {
        let saved = spend * reward.rate;
        let isCapped = false;

        // Apply Individual Cap if exists
        if (reward.cap && saved > reward.cap) {
          saved = reward.cap;
          isCapped = true;
        }

        if (saved > 0) {
          breakdown.push({
            category,
            spend,
            saved,
            rate: reward.rate,
            cap: reward.cap,
            isCapped
          });
        }
      }
    });

    // 2. Apply Shared Caps (e.g., HDFC Millennia 1000 cap shared across Amazon/Flipkart/Swiggy/etc)
    if (card.sharedCaps) {
      card.sharedCaps.forEach(sharedCap => {
        // Find all breakdown items that belong to this shared group
        const itemsInGroup = breakdown.filter(item => 
          sharedCap.categories.includes(item.category as keyof SpendingProfile)
        );

        const totalSavedInGroup = itemsInGroup.reduce((sum, item) => sum + item.saved, 0);

        // If the group total exceeds the shared cap
        if (totalSavedInGroup > sharedCap.cap) {
          // Calculate scale factor to reduce proportionally
          const scaleFactor = sharedCap.cap / totalSavedInGroup;

          // Update the items in the breakdown
          itemsInGroup.forEach(item => {
            item.saved = item.saved * scaleFactor;
            item.isCapped = true; // Mark as capped by shared limit
            item.cap = sharedCap.cap; // Show the shared cap value
          });
        }
      });
    }

    // 3. Special Hardcoded Logic for complex edge cases not easily modifiable via config
    if (card.id === 'amex-gold') {
       const activeCategories = (Object.values(profile) as number[]).filter(v => v >= 1000).length;
       if (activeCategories >= 2 || totalMonthlySpend > 6000) {
         const bonusSavings = 300; 
         breakdown.push({
           category: 'Milestone Bonus',
           spend: 0,
           saved: bonusSavings,
           rate: 0
         });
       }
    }

    if (card.id === 'amex-platinum-travel') {
       if (totalAnnualSpend >= 190000) {
          const m1MonthlyValue = 4500 / 12;
          breakdown.push({ category: 'Milestone (1.9L)', spend: 0, saved: m1MonthlyValue, rate: 0 });
       }
       
       if (totalAnnualSpend >= 400000) {
          const m2MonthlyValue = 10000 / 12; 
          breakdown.push({ category: 'Milestone (4L)', spend: 0, saved: m2MonthlyValue, rate: 0 });
       }
    }

    if (card.id === 'amex-mrcc') {
        if (totalMonthlySpend >= 6000) {
             breakdown.push({ category: 'Bonus (4x1500)', spend: 0, saved: 300, rate: 0 });
        }
        if (totalMonthlySpend >= 20000) {
             breakdown.push({ category: 'Bonus (20k Spend)', spend: 0, saved: 300, rate: 0 });
        }
    }


    // Recalculate Total Monthly Savings from adjusted breakdown
    totalMonthlySavings = breakdown.reduce((sum, item) => sum + item.saved, 0);

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
