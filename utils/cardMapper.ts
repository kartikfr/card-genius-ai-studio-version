
import { CreditCard, CardRewards } from '../types';

export const mapExhaustiveJSONToCard = (json: any): CreditCard => {
  // Helper to safely extract rate (handles percentage vs flat logic simplistically for MVP)
  const getRate = (section: any): number => {
    if (!section || !section.isApplicable) return 0;
    
    // Check for cashback
    if (section.rewardType === 'cashback' && section.cashback) {
      return (section.cashback.baseRate || 0) / 100;
    }
    
    // Check for points
    if (section.rewardType === 'points' || section.rewardType === 'rewardPoints') {
      const pointsData = section.rewardPoints;
      if (!pointsData) return 0;
      
      const points = pointsData.basePointsPerRs100 || 0;
      const value = pointsData.pointValue || 0;
      const spend = 100; // normalized
      
      return (points * value) / spend;
    }

    // Check for miles/other
    if (section.rewardType === 'miles' || section.rewardType === 'neuCoins') {
        // Generic handler assuming baseRate exists or similar structure
        return (section.cashback?.baseRate || 0) / 100;
    }

    return 0;
  };

  const getCap = (section: any): number | undefined => {
    if (!section?.isApplicable) return undefined;
    if (section.cashback?.monthlyCapAmount) return section.cashback.monthlyCapAmount;
    if (section.rewardPoints?.monthlyPointsCap) return section.rewardPoints.monthlyPointsCap * (section.rewardPoints.pointValue || 0);
    return undefined;
  };

  // Map features list
  const features: string[] = [];
  if (json.marketing?.keyHighlights) {
    features.push(...json.marketing.keyHighlights);
  }
  if (json.welcomeBenefits?.joiningBonus) {
      features.push(`Joining Bonus: ${json.welcomeBenefits.joiningBonus.amount || ''} ${json.welcomeBenefits.joiningBonus.type}`);
  }

  // Extract fees
  const joiningFee = json.fees?.joiningFee?.amount || 0;
  const annualFee = json.fees?.annualFee?.amount || 0;
  
  // Extract Waiver
  const waiverCondition = json.fees?.annualFee?.waiverConditions?.find((c: any) => c.type === 'spend_based');
  const waiverThreshold = waiverCondition?.threshold;
  const feeWaiver = waiverCondition ? waiverCondition.description : 'Not applicable';

  // Map Rewards
  const rewards: CardRewards = {
    flipkart: { rate: getRate(json.flipkartRewards), cap: getCap(json.flipkartRewards) },
    amazon: { rate: getRate(json.amazonRewards), cap: getCap(json.amazonRewards) },
    otherOnline: { rate: getRate(json.otherEcommerce?.genericOnlineShopping), cap: getCap(json.otherEcommerce?.genericOnlineShopping) },
    grocery: { rate: getRate(json.offlineRetailShopping?.supermarkets), cap: getCap(json.offlineRetailShopping?.supermarkets) }, // Fallback to supermarkets
    utilities: { rate: 0 }, // Often excluded, explicit mapping needed if in JSON
    fuel: { rate: 0 }, // Often excluded
    dining: { rate: getRate(json.otherEcommerce?.platforms?.swiggy) || 0.01 }, // Approximate using Swiggy or generic
    movies: { rate: getRate(json.otherEcommerce?.platforms?.bookmyshow) ? 0.05 : 0.01 }, // Approximate
    travel: { rate: 0.01 }, // Default base
    offline: { rate: getRate(json.offlineRetailShopping?.genericRetail), cap: getCap(json.offlineRetailShopping?.genericRetail) },
  };

  return {
    id: json.cardIdentification?.cardId || `card-${Date.now()}`,
    name: json.cardIdentification?.cardName || 'Unknown Card',
    bank: json.cardIdentification?.bankName || 'Unknown Bank',
    imageUrl: json.cardIdentification?.cardImageUrl || '',
    joiningFee,
    annualFee,
    feeWaiver,
    waiverThreshold,
    joiningBonus: json.welcomeBenefits?.joiningBonus?.amount ? `₹${json.welcomeBenefits.joiningBonus.amount} ${json.welcomeBenefits.joiningBonus.type}` : 'None',
    rewards,
    features,
    applyLink: json.cardIdentification?.applicationUrl || '#'
  };
};
