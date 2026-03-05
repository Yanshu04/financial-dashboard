import { motion } from 'framer-motion';
import { AlertTriangle, AlertCircle, Info } from 'lucide-react';
import type { Anomaly } from '@/lib/types';

interface AnomalyAlertsProps {
  anomalies: Anomaly[];
}

export function AnomalyAlerts({ anomalies }: AnomalyAlertsProps) {
  if (anomalies.length === 0) return null;

  const severityIcon = {
    high: <AlertTriangle className="w-4 h-4 text-destructive" />,
    medium: <AlertCircle className="w-4 h-4 text-warning" />,
    low: <Info className="w-4 h-4 text-info" />,
  };

  const severityBorder = {
    high: 'border-destructive/30',
    medium: 'border-warning/30',
    low: 'border-info/30',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className="card-gradient rounded-xl border border-border p-6"
    >
      <h3 className="text-sm font-medium text-muted-foreground mb-4">
        Anomaly Detection
        <span className="ml-2 text-xs bg-destructive/20 text-destructive px-2 py-0.5 rounded-full">
          {anomalies.length} found
        </span>
      </h3>
      
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {anomalies.map((a, i) => (
          <motion.div
            key={a.transaction.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 * i }}
            className={`flex items-start gap-3 p-3 rounded-lg bg-secondary/50 border ${severityBorder[a.severity]}`}
          >
            {severityIcon[a.severity]}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-medium text-foreground truncate">
                {a.transaction.description}
              </p>
              <p className="text-xs text-muted-foreground mt-0.5">{a.reason}</p>
              <p className="text-xs text-muted-foreground mt-0.5 font-mono">
                {a.transaction.date.toLocaleDateString()}
              </p>
            </div>
            <span className="text-xs font-mono text-foreground">
              ₹{a.transaction.amount.toFixed(2)}
            </span>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
