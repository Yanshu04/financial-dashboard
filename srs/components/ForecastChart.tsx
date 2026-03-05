import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import type { ForecastPoint, DailySpending } from '@/lib/types';

interface ForecastChartProps {
  historical: DailySpending[];
  forecast: ForecastPoint[];
}

export function ForecastChart({ historical, forecast }: ForecastChartProps) {
  const histData = historical.slice(-30).map(d => ({
    date: d.date.slice(5),
    actual: d.amount,
  }));

  const foreData = forecast.slice(0, 14).map(d => ({
    date: d.date.slice(5),
    predicted: d.predicted,
    upper: d.upper,
    lower: d.lower,
  }));

  // Combine with a bridge point
  const lastHist = histData[histData.length - 1];
  const combined = [
    ...histData.map(d => ({ ...d, predicted: undefined as number | undefined, upper: undefined as number | undefined, lower: undefined as number | undefined })),
    ...(lastHist ? [{ date: lastHist.date, actual: lastHist.actual, predicted: lastHist.actual, upper: lastHist.actual, lower: lastHist.actual }] : []),
    ...foreData.map(d => ({ ...d, actual: undefined as number | undefined })),
  ];

  const totalForecast = forecast.reduce((s, f) => s + f.predicted, 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.25 }}
      className="card-gradient rounded-xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Spending Forecast</h3>
        <div className="text-right">
          <p className="text-lg font-bold font-mono text-foreground">₹{totalForecast.toFixed(0)}</p>
          <p className="text-[10px] text-muted-foreground">projected next 30 days</p>
        </div>
      </div>
      
      <div className="h-48">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={combined} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
            <defs>
              <linearGradient id="actualGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(160, 60%, 45%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0.2} />
                <stop offset="95%" stopColor="hsl(200, 70%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'hsl(215, 12%, 50%)' }} tickLine={false} axisLine={false} tickFormatter={(v) => `₹${v}`} width={45} />
            <Tooltip
              contentStyle={{
                backgroundColor: 'hsl(220, 18%, 10%)',
                border: '1px solid hsl(220, 14%, 18%)',
                borderRadius: '8px',
                fontSize: '12px',
                color: 'hsl(210, 20%, 92%)',
              }}
            />
            <Area type="monotone" dataKey="actual" stroke="hsl(160, 60%, 45%)" fill="url(#actualGrad)" strokeWidth={2} connectNulls={false} />
            <Area type="monotone" dataKey="predicted" stroke="hsl(200, 70%, 50%)" fill="url(#forecastGrad)" strokeWidth={2} strokeDasharray="5 5" connectNulls={false} />
            <Area type="monotone" dataKey="upper" stroke="none" fill="hsl(200, 70%, 50%)" fillOpacity={0.05} connectNulls={false} />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center gap-4 mt-3 text-[10px] text-muted-foreground">
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-primary rounded" /> Actual</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-0.5 bg-info rounded border-dashed" style={{ borderTop: '1px dashed hsl(200, 70%, 50%)' }} /> Forecast</span>
      </div>
    </motion.div>
  );
}
