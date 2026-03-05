import { motion } from 'framer-motion';
import type { HealthScore } from '@/lib/types';

interface HealthScoreCardProps {
  score: HealthScore;
}

export function HealthScoreCard({ score }: HealthScoreCardProps) {
  const circumference = 2 * Math.PI * 54;
  const strokeDashoffset = circumference - (score.overall / 100) * circumference;

  const gradeColor = {
    A: 'text-success',
    B: 'text-primary',
    C: 'text-warning',
    D: 'text-destructive',
    F: 'text-destructive',
  }[score.grade];

  const metrics = [
    { label: 'Savings Rate', value: score.savingsRate },
    { label: 'Expense Stability', value: score.expenseStability },
    { label: 'Income Consistency', value: score.incomeConsistency },
    { label: 'Spending Efficiency', value: score.spendingEfficiency },
  ];

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="card-gradient rounded-xl border border-border p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Financial Health</h3>
      
      <div className="flex items-center gap-6">
        <div className="relative w-32 h-32 flex-shrink-0">
          <svg className="w-full h-full -rotate-90" viewBox="0 0 120 120">
            <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
            <motion.circle
              cx="60" cy="60" r="54" fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={circumference}
              initial={{ strokeDashoffset: circumference }}
              animate={{ strokeDashoffset }}
              transition={{ duration: 1.5, ease: 'easeOut' }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className={`text-3xl font-bold font-mono ${gradeColor}`}>{score.overall}</span>
            <span className="text-xs text-muted-foreground">/ 100</span>
          </div>
        </div>

        <div className="flex-1 space-y-3">
          {metrics.map((m) => (
            <div key={m.label}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-muted-foreground">{m.label}</span>
                <span className="font-mono text-foreground">{m.value}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full bg-primary"
                  initial={{ width: 0 }}
                  animate={{ width: `${m.value}%` }}
                  transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-4 flex items-center gap-2">
        <span className={`text-2xl font-bold ${gradeColor}`}>Grade: {score.grade}</span>
      </div>
    </motion.div>
  );
}
