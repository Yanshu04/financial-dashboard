import { motion } from 'framer-motion';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import type { CategoryBreakdown } from '@/lib/types';

interface SpendingChartProps {
  breakdown: CategoryBreakdown[];
}

export function SpendingChart({ breakdown }: SpendingChartProps) {
  const data = breakdown.map(b => ({
    name: b.category,
    value: Math.round(b.total * 100) / 100,
    color: b.color,
    percentage: b.percentage,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="card-gradient rounded-xl border border-border p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">Spending by Category</h3>
      
      <div className="flex items-center gap-4">
        <div className="w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={70}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={index} fill={entry.color} stroke="none" />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(220, 18%, 10%)',
                  border: '1px solid hsl(220, 14%, 18%)',
                  borderRadius: '8px',
                  fontSize: '12px',
                  color: 'hsl(210, 20%, 92%)',
                }}
                formatter={(value: number) => [`$${value.toFixed(2)}`, '']}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="flex-1 space-y-2 max-h-40 overflow-y-auto">
          {breakdown.slice(0, 6).map((b) => (
            <div key={b.category} className="flex items-center gap-2 text-xs">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-muted-foreground flex-1 truncate">{b.category}</span>
              <span className="font-mono text-foreground">₹{b.total.toFixed(0)}</span>
              <span className="font-mono text-muted-foreground w-10 text-right">{b.percentage.toFixed(0)}%</span>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
