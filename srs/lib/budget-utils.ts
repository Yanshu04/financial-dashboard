import type { Transaction, Budget, BudgetStatus } from './types';

export function calculateBudgetStatus(
  budget: Budget,
  transactions: Transaction[]
): BudgetStatus {
  const now = new Date();
  let startDate: Date;

  if (budget.period === 'monthly') {
    startDate = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    // weekly - last 7 days
    startDate = new Date(now);
    startDate.setDate(startDate.getDate() - 7);
  }

  const spent = transactions
    .filter(t => 
      t.type === 'debit' &&
      t.category === budget.category &&
      new Date(t.date) >= startDate &&
      new Date(t.date) <= now
    )
    .reduce((sum, t) => sum + t.amount, 0);

  const remaining = budget.limit - spent;
  const percentageUsed = budget.limit > 0 ? (spent / budget.limit) * 100 : 0;
  const isOverBudget = spent > budget.limit;
  const shouldAlert = percentageUsed >= budget.alertThreshold && !isOverBudget;

  return {
    budget,
    spent,
    remaining,
    percentageUsed,
    isOverBudget,
    shouldAlert,
  };
}

export function getAllBudgetStatuses(
  budgets: Budget[],
  transactions: Transaction[]
): BudgetStatus[] {
  return budgets.map(budget => calculateBudgetStatus(budget, transactions));
}
