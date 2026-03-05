import type { Transaction, CategoryBreakdown, Anomaly, HealthScore, Suggestion, ForecastPoint, DailySpending } from './types';
import { parseIndianBankCSV } from './indian-bank-parser';

const CATEGORY_KEYWORDS: Record<string, string[]> = {
  'Food & Dining': ['restaurant', 'cafe', 'coffee', 'food', 'pizza', 'burger', 'sushi', 'uber eats', 'doordash', 'grubhub', 'mcdonald', 'starbucks', 'chipotle', 'subway', 'dining', 'lunch', 'dinner', 'breakfast', 'bakery', 'deli'],
  'Transportation': ['uber', 'lyft', 'gas', 'fuel', 'parking', 'transit', 'metro', 'bus', 'train', 'airline', 'flight', 'taxi', 'toll', 'car wash', 'auto'],
  'Shopping': ['amazon', 'walmart', 'target', 'costco', 'store', 'shop', 'mall', 'clothing', 'shoes', 'electronics', 'best buy', 'apple', 'nike', 'zara', 'h&m'],
  'Entertainment': ['netflix', 'spotify', 'hulu', 'disney', 'movie', 'theater', 'concert', 'game', 'steam', 'playstation', 'xbox', 'music', 'ticket'],
  'Bills & Utilities': ['electric', 'water', 'gas bill', 'internet', 'phone', 'insurance', 'rent', 'mortgage', 'cable', 'utility', 'verizon', 'at&t', 'comcast', 'pge'],
  'Health & Fitness': ['gym', 'fitness', 'pharmacy', 'cvs', 'walgreens', 'doctor', 'hospital', 'dental', 'medical', 'health', 'vitamin', 'yoga', 'peloton'],
  'Education': ['tuition', 'school', 'university', 'course', 'udemy', 'coursera', 'book', 'textbook', 'library'],
  'Travel': ['hotel', 'airbnb', 'booking', 'resort', 'vacation', 'travel', 'expedia', 'trip'],
  'Subscriptions': ['subscription', 'membership', 'monthly', 'annual', 'premium', 'pro plan', 'patreon'],
  'Income': ['salary', 'payroll', 'deposit', 'transfer in', 'payment received', 'refund', 'cashback', 'dividend', 'interest earned'],
};

const CATEGORY_COLORS: Record<string, string> = {
  'Food & Dining': 'hsl(35, 85%, 55%)',
  'Transportation': 'hsl(200, 70%, 50%)',
  'Shopping': 'hsl(280, 60%, 55%)',
  'Entertainment': 'hsl(340, 65%, 55%)',
  'Bills & Utilities': 'hsl(160, 60%, 45%)',
  'Health & Fitness': 'hsl(120, 50%, 45%)',
  'Education': 'hsl(45, 80%, 50%)',
  'Travel': 'hsl(190, 70%, 50%)',
  'Subscriptions': 'hsl(260, 55%, 55%)',
  'Income': 'hsl(160, 70%, 50%)',
  'Other': 'hsl(215, 12%, 50%)',
};

export function categorizeTransaction(description: string, type: string): { category: string; confidence: number } {
  const desc = description.toLowerCase();
  
  if (type === 'credit') {
    for (const keyword of CATEGORY_KEYWORDS['Income']) {
      if (desc.includes(keyword)) return { category: 'Income', confidence: 0.92 };
    }
    return { category: 'Income', confidence: 0.75 };
  }

  let bestMatch = { category: 'Other', confidence: 0.3 };
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === 'Income') continue;
    for (const keyword of keywords) {
      if (desc.includes(keyword)) {
        const confidence = keyword.length > 5 ? 0.95 : 0.85;
        if (confidence > bestMatch.confidence) {
          bestMatch = { category, confidence };
        }
      }
    }
  }

  return bestMatch;
}

export function getCategoryColor(category: string): string {
  return CATEGORY_COLORS[category] || CATEGORY_COLORS['Other'];
}

export function getCategoryBreakdown(transactions: Transaction[]): CategoryBreakdown[] {
  const debits = transactions.filter(t => t.type === 'debit');
  const totalSpending = debits.reduce((sum, t) => sum + Math.abs(t.amount), 0);
  
  const grouped = debits.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = { total: 0, count: 0 };
    acc[t.category].total += Math.abs(t.amount);
    acc[t.category].count += 1;
    return acc;
  }, {} as Record<string, { total: number; count: number }>);

  return Object.entries(grouped)
    .map(([category, data]) => ({
      category,
      total: data.total,
      count: data.count,
      percentage: totalSpending > 0 ? (data.total / totalSpending) * 100 : 0,
      color: getCategoryColor(category),
    }))
    .sort((a, b) => b.total - a.total);
}

export function detectAnomalies(transactions: Transaction[]): Anomaly[] {
  const debits = transactions.filter(t => t.type === 'debit');
  if (debits.length < 3) return [];

  const amounts = debits.map(t => Math.abs(t.amount));
  const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
  const stdDev = Math.sqrt(amounts.reduce((sum, a) => sum + (a - mean) ** 2, 0) / amounts.length);

  const anomalies: Anomaly[] = [];

  for (const t of debits) {
    const absAmount = Math.abs(t.amount);
    const zScore = stdDev > 0 ? (absAmount - mean) / stdDev : 0;

    if (zScore > 2) {
      anomalies.push({
        transaction: t,
        reason: `Unusually large transaction: ₹${absAmount.toFixed(2)} is ${zScore.toFixed(1)}σ above average (₹${mean.toFixed(2)})`,

        severity: zScore > 3 ? 'high' : zScore > 2.5 ? 'medium' : 'low',
        zScore,
      });
    }
  }

  // Category spike detection
  const categoryAvg: Record<string, number[]> = {};
  for (const t of debits) {
    if (!categoryAvg[t.category]) categoryAvg[t.category] = [];
    categoryAvg[t.category].push(Math.abs(t.amount));
  }

  for (const t of debits) {
    const catAmounts = categoryAvg[t.category];
    if (catAmounts && catAmounts.length >= 3) {
      const catMean = catAmounts.reduce((a, b) => a + b, 0) / catAmounts.length;
      const catStd = Math.sqrt(catAmounts.reduce((s, a) => s + (a - catMean) ** 2, 0) / catAmounts.length);
      const catZ = catStd > 0 ? (Math.abs(t.amount) - catMean) / catStd : 0;
      
      if (catZ > 2.5 && !anomalies.find(a => a.transaction.id === t.id)) {
        anomalies.push({
          transaction: t,
          reason: `Spike in ${t.category}: ₹${Math.abs(t.amount).toFixed(2)} vs category avg ₹${catMean.toFixed(2)}`,

          severity: 'medium',
          zScore: catZ,
        });
      }
    }
  }

  return anomalies.sort((a, b) => b.zScore - a.zScore).slice(0, 10);
}

export function calculateHealthScore(transactions: Transaction[]): HealthScore {
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + Math.abs(t.amount), 0);
  const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + Math.abs(t.amount), 0);

  // Savings rate (0-100)
  const savingsRate = totalIncome > 0 ? Math.max(0, Math.min(100, ((totalIncome - totalExpenses) / totalIncome) * 100)) : 0;

  // Expense stability (lower variance = higher score)
  const debits = transactions.filter(t => t.type === 'debit');
  const amounts = debits.map(t => Math.abs(t.amount));
  const mean = amounts.length > 0 ? amounts.reduce((a, b) => a + b, 0) / amounts.length : 0;
  const cv = mean > 0 ? Math.sqrt(amounts.reduce((s, a) => s + (a - mean) ** 2, 0) / amounts.length) / mean : 1;
  const expenseStability = Math.max(0, Math.min(100, (1 - Math.min(cv, 2) / 2) * 100));

  // Income consistency
  const credits = transactions.filter(t => t.type === 'credit');
  const creditAmounts = credits.map(t => Math.abs(t.amount));
  const creditMean = creditAmounts.length > 0 ? creditAmounts.reduce((a, b) => a + b, 0) / creditAmounts.length : 0;
  const creditCv = creditMean > 0 ? Math.sqrt(creditAmounts.reduce((s, a) => s + (a - creditMean) ** 2, 0) / creditAmounts.length) / creditMean : 1;
  const incomeConsistency = Math.max(0, Math.min(100, (1 - Math.min(creditCv, 2) / 2) * 100));

  // Spending efficiency (diverse but controlled)
  const categories = new Set(debits.map(t => t.category));
  const spendingEfficiency = Math.min(100, categories.size * 15 + savingsRate * 0.5);

  const overall = Math.round(savingsRate * 0.35 + expenseStability * 0.25 + incomeConsistency * 0.25 + spendingEfficiency * 0.15);

  const grade: HealthScore['grade'] = overall >= 80 ? 'A' : overall >= 65 ? 'B' : overall >= 50 ? 'C' : overall >= 35 ? 'D' : 'F';

  return {
    overall,
    savingsRate: Math.round(savingsRate),
    expenseStability: Math.round(expenseStability),
    incomeConsistency: Math.round(incomeConsistency),
    spendingEfficiency: Math.round(spendingEfficiency),
    grade,
  };
}

export function generateSuggestions(transactions: Transaction[], healthScore: HealthScore, anomalies: Anomaly[]): Suggestion[] {
  const suggestions: Suggestion[] = [];
  const breakdown = getCategoryBreakdown(transactions);

  if (healthScore.savingsRate < 20) {
    suggestions.push({
      id: 's1', title: 'Boost Your Savings Rate',
      description: `Your savings rate is ${healthScore.savingsRate}%. Aim for at least 20% by reducing discretionary spending.`,
      impact: 'high', category: 'savings', icon: 'PiggyBank',
    });
  }

  const topCategory = breakdown[0];
  if (topCategory && topCategory.percentage > 40) {
    suggestions.push({
      id: 's2', title: `Reduce ${topCategory.category} Spending`,
      description: `${topCategory.category} makes up ${topCategory.percentage.toFixed(0)}% of spending (₹${topCategory.total.toFixed(0)}). Consider setting a monthly budget.`,

      impact: 'high', category: 'budget', icon: 'TrendingDown',
    });
  }

  if (anomalies.length > 3) {
    suggestions.push({
      id: 's3', title: 'Review Unusual Transactions',
      description: `${anomalies.length} anomalous transactions detected. Review them for unauthorized charges or impulse purchases.`,
      impact: 'medium', category: 'review', icon: 'AlertTriangle',
    });
  }

  const subscriptions = breakdown.find(b => b.category === 'Subscriptions');
  if (subscriptions && subscriptions.total > 100) {
    suggestions.push({
      id: 's4', title: 'Audit Your Subscriptions',
      description: `You're spending ₹${subscriptions.total.toFixed(0)}/month on subscriptions. Review for unused services.`,

      impact: 'medium', category: 'subscriptions', icon: 'CreditCard',
    });
  }

  if (healthScore.expenseStability < 50) {
    suggestions.push({
      id: 's5', title: 'Stabilize Your Spending',
      description: 'Your spending is highly variable. Create a consistent budget to improve financial predictability.',
      impact: 'medium', category: 'stability', icon: 'BarChart3',
    });
  }

  suggestions.push({
    id: 's6', title: 'Set Up an Emergency Fund',
    description: 'Aim for 3-6 months of expenses saved. This provides a crucial safety net for unexpected costs.',
    impact: 'high', category: 'emergency', icon: 'Shield',
  });

  return suggestions.slice(0, 5);
}

export function generateForecast(transactions: Transaction[], days: number = 30): ForecastPoint[] {
  const debits = transactions.filter(t => t.type === 'debit');
  if (debits.length < 5) return [];

  // Simple moving average forecast
  const dailySpending = getDailySpending(debits);
  const recentDays = dailySpending.slice(-14);
  const avgDaily = recentDays.length > 0 ? recentDays.reduce((s, d) => s + d.amount, 0) / recentDays.length : 0;
  const trend = recentDays.length > 1 ? (recentDays[recentDays.length - 1].amount - recentDays[0].amount) / recentDays.length : 0;

  const forecast: ForecastPoint[] = [];
  const lastDate = debits.length > 0 ? new Date(Math.max(...debits.map(t => t.date.getTime()))) : new Date();

  for (let i = 1; i <= days; i++) {
    const date = new Date(lastDate);
    date.setDate(date.getDate() + i);
    const predicted = Math.max(0, avgDaily + trend * i);
    const uncertainty = avgDaily * 0.3 * Math.sqrt(i / 7);
    forecast.push({
      date: date.toISOString().split('T')[0],
      predicted: Math.round(predicted * 100) / 100,
      lower: Math.max(0, Math.round((predicted - uncertainty) * 100) / 100),
      upper: Math.round((predicted + uncertainty) * 100) / 100,
    });
  }

  return forecast;
}

export function getDailySpending(transactions: Transaction[]): DailySpending[] {
  const debits = transactions.filter(t => t.type === 'debit');
  const grouped: Record<string, number> = {};
  
  for (const t of debits) {
    const key = t.date.toISOString().split('T')[0];
    grouped[key] = (grouped[key] || 0) + Math.abs(t.amount);
  }

  return Object.entries(grouped)
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
    .sort((a, b) => a.date.localeCompare(b.date));
}

export function parseCSV(csvText: string): Transaction[] {
  // Use the enhanced Indian bank parser
  return parseIndianBankCSV(csvText);
}

export function generateSampleData(): Transaction[] {
  const now = new Date();
  const transactions: Transaction[] = [];
  const descriptions = [
    { desc: 'Starbucks Coffee', type: 'debit' as const, range: [4, 8] },
    { desc: 'Amazon Purchase', type: 'debit' as const, range: [15, 200] },
    { desc: 'Uber Ride', type: 'debit' as const, range: [8, 35] },
    { desc: 'Netflix Subscription', type: 'debit' as const, range: [15, 15] },
    { desc: 'Spotify Premium', type: 'debit' as const, range: [10, 10] },
    { desc: 'Whole Foods Market', type: 'debit' as const, range: [30, 120] },
    { desc: 'Electric Bill - PGE', type: 'debit' as const, range: [80, 150] },
    { desc: 'Gym Membership', type: 'debit' as const, range: [50, 50] },
    { desc: 'Gas Station Shell', type: 'debit' as const, range: [30, 60] },
    { desc: 'Chipotle Mexican Grill', type: 'debit' as const, range: [10, 18] },
    { desc: 'Salary Deposit', type: 'credit' as const, range: [3500, 3500] },
    { desc: 'Freelance Payment Received', type: 'credit' as const, range: [500, 1500] },
    { desc: 'Target Store', type: 'debit' as const, range: [20, 80] },
    { desc: 'CVS Pharmacy', type: 'debit' as const, range: [10, 45] },
    { desc: 'Parking Garage', type: 'debit' as const, range: [5, 20] },
    { desc: 'Restaurant Downtown', type: 'debit' as const, range: [25, 80] },
    { desc: 'Apple Store', type: 'debit' as const, range: [50, 999] },
    { desc: 'Internet Bill Comcast', type: 'debit' as const, range: [60, 60] },
    { desc: 'Udemy Course', type: 'debit' as const, range: [10, 15] },
    { desc: 'Cashback Reward', type: 'credit' as const, range: [5, 25] },
  ];

  for (let i = 0; i < 90; i++) {
    const date = new Date(now);
    date.setDate(date.getDate() - i);
    
    const numTxns = Math.floor(Math.random() * 4) + 1;
    for (let j = 0; j < numTxns; j++) {
      const item = descriptions[Math.floor(Math.random() * descriptions.length)];
      const amount = item.range[0] + Math.random() * (item.range[1] - item.range[0]);
      const { category, confidence } = categorizeTransaction(item.desc, item.type);
      
      transactions.push({
        id: `txn-${i}-${j}`,
        date: new Date(date),
        description: item.desc,
        amount: Math.round(amount * 100) / 100,
        type: item.type,
        category,
        confidence,
      });
    }
  }

  // Add a few anomalies
  const anomalyDate = new Date(now);
  anomalyDate.setDate(anomalyDate.getDate() - 5);
  transactions.push({
    id: 'txn-anomaly-1',
    date: anomalyDate,
    description: 'Apple Store MacBook Pro',
    amount: 2499.99,
    type: 'debit',
    category: 'Shopping',
    confidence: 0.95,
  });

  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}
