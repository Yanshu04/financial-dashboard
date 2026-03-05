import { motion } from 'framer-motion';
import { Wallet, TrendingUp, TrendingDown, ArrowUpDown } from 'lucide-react';
import type { Transaction } from '@/lib/types';

interface MetricCardsProps {
  transactions: Transaction[];
}

export function MetricCards({ transactions }: MetricCardsProps) {
  const totalIncome = transactions.filter(t => t.type === 'credit').reduce((s, t) => s + t.amount, 0);
  const totalExpenses = transactions.filter(t => t.type === 'debit').reduce((s, t) => s + t.amount, 0);
  const netFlow = totalIncome - totalExpenses;
  const avgTransaction = transactions.length > 0 ? totalExpenses / transactions.filter(t => t.type === 'debit').length : 0;

  const cards = [
    { label: 'Total Income', value: totalIncome, prefix: '₹', icon: <TrendingUp className="w-4 h-4" />, positive: true },
    { label: 'Total Expenses', value: totalExpenses, prefix: '₹', icon: <TrendingDown className="w-4 h-4" />, positive: false },
    { label: 'Net Cash Flow', value: netFlow, prefix: '₹', icon: <Wallet className="w-4 h-4" />, positive: netFlow >= 0 },
    { label: 'Avg Transaction', value: avgTransaction, prefix: '₹', icon: <ArrowUpDown className="w-4 h-4" />, positive: true },
  ];

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {cards.map((card, i) => (
        <motion.div
          key={card.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 * i }}
          className="card-gradient rounded-xl border border-border p-4"
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs text-muted-foreground">{card.label}</span>
            <span className={card.positive ? 'text-primary' : 'text-destructive'}>{card.icon}</span>
          </div>
          <p className={`text-xl font-bold font-mono ${card.positive ? 'text-foreground' : card.label === 'Total Expenses' ? 'text-foreground' : 'text-destructive'}`}>
            {card.value < 0 ? '-' : ''}{card.prefix}{Math.abs(card.value).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
          </p>
        </motion.div>
      ))}
    </div>
  );
}
