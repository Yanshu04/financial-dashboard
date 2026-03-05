import { motion } from 'framer-motion';
import { TrendingDown, PiggyBank, CreditCard, Shield, BarChart3, AlertTriangle } from 'lucide-react';
import type { Suggestion } from '@/lib/types';

interface SmartSuggestionsProps {
  suggestions: Suggestion[];
}

const iconMap: Record<string, React.ReactNode> = {
  PiggyBank: <PiggyBank className="w-5 h-5" />,
  TrendingDown: <TrendingDown className="w-5 h-5" />,
  AlertTriangle: <AlertTriangle className="w-5 h-5" />,
  CreditCard: <CreditCard className="w-5 h-5" />,
  BarChart3: <BarChart3 className="w-5 h-5" />,
  Shield: <Shield className="w-5 h-5" />,
};

const impactColor = {
  high: 'bg-destructive/20 text-destructive',
  medium: 'bg-warning/20 text-warning',
  low: 'bg-info/20 text-info',
};

export function SmartSuggestions({ suggestions }: SmartSuggestionsProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="card-gradient rounded-xl border border-border p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Smart Suggestions</h3>
      
      <div className="space-y-3">
        {suggestions.map((s, i) => (
          <motion.div
            key={s.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className="flex items-start gap-3 p-3 rounded-lg bg-secondary/50 hover:bg-secondary/80 transition-colors"
          >
            <div className="text-primary mt-0.5">
              {iconMap[s.icon] || <BarChart3 className="w-5 h-5" />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="text-sm font-medium text-foreground">{s.title}</p>
                <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${impactColor[s.impact]}`}>
                  {s.impact}
                </span>
              </div>
              <p className="text-xs text-muted-foreground">{s.description}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
