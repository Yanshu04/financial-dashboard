import { useState, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Activity, Upload, Zap } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CSVUpload } from '@/components/CSVUpload';
import { MetricCards } from '@/components/MetricCards';
import { HealthScoreCard } from '@/components/HealthScoreCard';
import { SpendingChart } from '@/components/SpendingChart';
import { ForecastChart } from '@/components/ForecastChart';
import { AnomalyAlerts } from '@/components/AnomalyAlerts';
import { SmartSuggestions } from '@/components/SmartSuggestions';
import { TransactionTable } from '@/components/TransactionTable';
import { TransactionFilters, type FilterOptions } from '@/components/TransactionFilters';
import { TransactionEditDialog } from '@/components/TransactionEditDialog';
import { BudgetManager } from '@/components/BudgetManager';
import { UploadGuide } from '@/components/UploadGuide';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useLocalStorage } from '@/hooks/use-local-storage';
import {
  getCategoryBreakdown,
  detectAnomalies,
  calculateHealthScore,
  generateSuggestions,
  generateForecast,
  getDailySpending,
  generateSampleData,
} from '@/lib/financial-engine';
import { getAllBudgetStatuses } from '@/lib/budget-utils';
import type { Transaction, Budget } from '@/lib/types';

const Index = () => {
  const [transactions, setTransactions] = useLocalStorage<Transaction[]>('finsight-transactions', []);
  const [budgets, setBudgets] = useLocalStorage<Budget[]>('finsight-budgets', []);
  const [showUpload, setShowUpload] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [filters, setFilters] = useState<FilterOptions>({
    searchTerm: '',
    category: 'all',
    type: 'all',
    dateRange: 'all',
    minAmount: '',
    maxAmount: '',
  });

  const hasData = transactions.length > 0;

  // Filter transactions
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Search filter
    if (filters.searchTerm) {
      filtered = filtered.filter(t => 
        t.description.toLowerCase().includes(filters.searchTerm.toLowerCase())
      );
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(t => t.category === filters.category);
    }

    // Type filter
    if (filters.type !== 'all') {
      filtered = filtered.filter(t => t.type === filters.type);
    }

    // Date range filter
    if (filters.dateRange !== 'all') {
      const days = parseInt(filters.dateRange);
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - days);
      filtered = filtered.filter(t => new Date(t.date) >= cutoff);
    }

    // Amount range filter
    if (filters.minAmount) {
      const min = parseFloat(filters.minAmount);
      filtered = filtered.filter(t => t.amount >= min);
    }
    if (filters.maxAmount) {
      const max = parseFloat(filters.maxAmount);
      filtered = filtered.filter(t => t.amount <= max);
    }

    return filtered;
  }, [transactions, filters]);

  // Get unique categories
  const categories = useMemo(() => {
    const cats = new Set(transactions.map(t => t.category));
    return Array.from(cats).sort();
  }, [transactions]);

  const breakdown = useMemo(() => getCategoryBreakdown(filteredTransactions), [filteredTransactions]);
  const anomalies = useMemo(() => detectAnomalies(filteredTransactions), [filteredTransactions]);
  const healthScore = useMemo(() => calculateHealthScore(filteredTransactions), [filteredTransactions]);
  const suggestions = useMemo(() => generateSuggestions(filteredTransactions, healthScore, anomalies), [filteredTransactions, healthScore, anomalies]);
  const forecast = useMemo(() => generateForecast(filteredTransactions), [filteredTransactions]);
  const dailySpending = useMemo(() => getDailySpending(filteredTransactions), [filteredTransactions]);
  const budgetStatuses = useMemo(() => getAllBudgetStatuses(budgets, transactions), [budgets, transactions]);

  const handleLoadSample = useCallback(() => {
    setTransactions(generateSampleData());
  }, []);

  const handleDataLoaded = useCallback((data: Transaction[]) => {
    setTransactions(data);
    setShowUpload(false);
  }, []);

  const handleEditTransaction = useCallback((transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowEditDialog(true);
  }, []);

  const handleSaveTransaction = useCallback((updatedTransaction: Transaction) => {
    setTransactions(prev => 
      prev.map(t => t.id === updatedTransaction.id ? updatedTransaction : t)
    );
  }, [setTransactions]);

  const handleDeleteTransaction = useCallback((id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  }, [setTransactions]);

  const handleAddBudget = useCallback((budgetData: Omit<Budget, 'id'>) => {
    const newBudget: Budget = {
      ...budgetData,
      id: `budget-${Date.now()}`,
    };
    setBudgets(prev => [...prev, newBudget]);
  }, [setBudgets]);

  const handleUpdateBudget = useCallback((updatedBudget: Budget) => {
    setBudgets(prev => prev.map(b => b.id === updatedBudget.id ? updatedBudget : b));
  }, [setBudgets]);

  const handleDeleteBudget = useCallback((id: string) => {
    setBudgets(prev => prev.filter(b => b.id !== id));
  }, [setBudgets]);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border glass sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg score-gradient flex items-center justify-center">
              <Activity className="w-4 h-4 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground tracking-tight">FinSight</h1>
              <p className="text-[10px] text-muted-foreground">Financial Intelligence Engine</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            {hasData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(!showUpload)}
                className="text-xs"
              >
                <Upload className="w-3 h-3 mr-1.5" />
                Upload CSV
              </Button>
            )}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        <AnimatePresence mode="wait">
          {!hasData ? (
            <motion.div
              key="empty"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="flex flex-col items-center justify-center min-h-[70vh] gap-8"
            >
              <div className="text-center">
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: 'spring', stiffness: 200, damping: 15 }}
                  className="w-20 h-20 rounded-2xl score-gradient flex items-center justify-center mx-auto mb-6 glow-primary"
                >
                  <Zap className="w-10 h-10 text-primary-foreground" />
                </motion.div>
                <h2 className="text-3xl font-bold text-foreground mb-2">Financial Intelligence Engine</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                  Upload your transaction data or load sample data to get instant insights, anomaly detection, and smart suggestions.
                </p>
              </div>

              <div className="w-full max-w-md space-y-4">
                <UploadGuide />
                <CSVUpload onDataLoaded={handleDataLoaded} />
                <div className="text-center">
                  <span className="text-xs text-muted-foreground">or</span>
                </div>
                <Button
                  onClick={handleLoadSample}
                  className="w-full"
                  size="lg"
                >
                  <Activity className="w-4 h-4 mr-2" />
                  Load Sample Data
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              {showUpload && (
                <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }}>
                  <CSVUpload onDataLoaded={handleDataLoaded} />
                </motion.div>
              )}

              <MetricCards transactions={transactions} />

              <BudgetManager
                budgetStatuses={budgetStatuses}
                categories={categories}
                onAddBudget={handleAddBudget}
                onUpdateBudget={handleUpdateBudget}
                onDeleteBudget={handleDeleteBudget}
              />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <HealthScoreCard score={healthScore} />
                <SpendingChart breakdown={breakdown} />
              </div>

              <ForecastChart historical={dailySpending} forecast={forecast} />

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <AnomalyAlerts anomalies={anomalies} />
                <SmartSuggestions suggestions={suggestions} />
              </div>

              <TransactionFilters 
                transactions={transactions}
                filters={filters}
                onFilterChange={setFilters}
                categories={categories}
              />

              <TransactionTable 
                transactions={filteredTransactions} 
                onEdit={handleEditTransaction}
              />

              <TransactionEditDialog
                transaction={editingTransaction}
                open={showEditDialog}
                onOpenChange={setShowEditDialog}
                onSave={handleSaveTransaction}
                onDelete={handleDeleteTransaction}
                categories={categories}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </div>
  );
};

export default Index;
