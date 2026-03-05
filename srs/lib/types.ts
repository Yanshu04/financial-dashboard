export interface Transaction {
  id: string;
  date: Date;
  description: string;
  amount: number;
  type: 'credit' | 'debit';
  category: string;
  confidence: number;
}

export interface CategoryBreakdown {
  category: string;
  total: number;
  count: number;
  percentage: number;
  color: string;
}

export interface Anomaly {
  transaction: Transaction;
  reason: string;
  severity: 'low' | 'medium' | 'high';
  zScore: number;
}

export interface HealthScore {
  overall: number;
  savingsRate: number;
  expenseStability: number;
  incomeConsistency: number;
  spendingEfficiency: number;
  grade: 'A' | 'B' | 'C' | 'D' | 'F';
}

export interface Suggestion {
  id: string;
  title: string;
  description: string;
  impact: 'low' | 'medium' | 'high';
  category: string;
  icon: string;
}

export interface ForecastPoint {
  date: string;
  predicted: number;
  lower: number;
  upper: number;
}

export interface DailySpending {
  date: string;
  amount: number;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  period: 'monthly' | 'weekly';
  alertThreshold: number; // percentage (e.g., 80 for 80%)
}

export interface BudgetStatus {
  budget: Budget;
  spent: number;
  remaining: number;
  percentageUsed: number;
  isOverBudget: boolean;
  shouldAlert: boolean;
}
