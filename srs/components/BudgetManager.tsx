import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Wallet, TrendingUp, AlertTriangle, CheckCircle, Pencil, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card } from '@/components/ui/card';
import type { Budget, BudgetStatus } from '@/lib/types';

interface BudgetManagerProps {
  budgetStatuses: BudgetStatus[];
  categories: string[];
  onAddBudget: (budget: Omit<Budget, 'id'>) => void;
  onUpdateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
}

export function BudgetManager({
  budgetStatuses,
  categories,
  onAddBudget,
  onUpdateBudget,
  onDeleteBudget,
}: BudgetManagerProps) {
  const [showDialog, setShowDialog] = useState(false);
  const [editingBudget, setEditingBudget] = useState<Budget | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    limit: '',
    period: 'monthly' as 'monthly' | 'weekly',
    alertThreshold: '80',
  });

  const handleOpenDialog = (budget?: Budget) => {
    if (budget) {
      setEditingBudget(budget);
      setFormData({
        category: budget.category,
        limit: budget.limit.toString(),
        period: budget.period,
        alertThreshold: budget.alertThreshold.toString(),
      });
    } else {
      setEditingBudget(null);
      setFormData({
        category: '',
        limit: '',
        period: 'monthly',
        alertThreshold: '80',
      });
    }
    setShowDialog(true);
  };

  const handleSubmit = () => {
    const limit = parseFloat(formData.limit);
    const alertThreshold = parseFloat(formData.alertThreshold);

    if (!formData.category || !limit || !alertThreshold) return;

    if (editingBudget) {
      onUpdateBudget({
        ...editingBudget,
        category: formData.category,
        limit,
        period: formData.period,
        alertThreshold,
      });
    } else {
      onAddBudget({
        category: formData.category,
        limit,
        period: formData.period,
        alertThreshold,
      });
    }

    setShowDialog(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Budget Management</h2>
          <p className="text-sm text-muted-foreground">Track spending limits by category</p>
        </div>
        <Button onClick={() => handleOpenDialog()} size="sm">
          <Plus className="w-4 h-4 mr-1.5" />
          Add Budget
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {budgetStatuses.map((status, index) => (
            <motion.div
              key={status.budget.id}
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: index * 0.05 }}
            >
              <Card className="card-gradient border border-border p-4 relative overflow-hidden">
                {status.isOverBudget && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-destructive/10 rounded-bl-full" />
                )}
                {status.shouldAlert && (
                  <div className="absolute top-0 right-0 w-20 h-20 bg-warning/10 rounded-bl-full" />
                )}

                <div className="flex items-start justify-between mb-3 relative z-10">
                  <div className="flex items-center gap-2">
                    <div className={`p-2 rounded-lg ${
                      status.isOverBudget ? 'bg-destructive/20' : 
                      status.shouldAlert ? 'bg-warning/20' : 
                      'bg-primary/20'
                    }`}>
                      <DollarSign className={`w-4 h-4 ${
                        status.isOverBudget ? 'text-destructive' : 
                        status.shouldAlert ? 'text-warning' : 
                        'text-primary'
                      }`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-sm text-foreground">
                        {status.budget.category}
                      </h3>
                      <p className="text-xs text-muted-foreground capitalize">
                        {status.budget.period}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0"
                      onClick={() => handleOpenDialog(status.budget)}
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 text-destructive"
                      onClick={() => onDeleteBudget(status.budget.id)}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-baseline">
                    <span className="text-2xl font-bold font-mono text-foreground">
                      ₹{status.spent.toFixed(0)}
                    </span>
                    <span className="text-sm text-muted-foreground">
                      / ₹{status.budget.limit.toFixed(0)}
                    </span>
                  </div>

                  <Progress 
                    value={Math.min(status.percentageUsed, 100)} 
                    className="h-2"
                  />

                  <div className="flex items-center justify-between text-xs">
                    <span className={`font-medium ${
                      status.isOverBudget ? 'text-destructive' : 
                      status.percentageUsed >= status.budget.alertThreshold ? 'text-warning' : 
                      'text-muted-foreground'
                    }`}>
                      {status.percentageUsed.toFixed(0)}% used
                    </span>
                    {status.isOverBudget ? (
                      <div className="flex items-center gap-1 text-destructive">
                        <AlertTriangle className="w-3 h-3" />
                        <span>Over by ₹{Math.abs(status.remaining).toFixed(0)}</span>
                      </div>
                    ) : status.shouldAlert ? (
                      <div className="flex items-center gap-1 text-warning">
                        <TrendingUp className="w-3 h-3" />
                        <span>Approaching limit</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-success">
                        <CheckCircle className="w-3 h-3" />
                        <span>₹{status.remaining.toFixed(0)} left</span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {budgetStatuses.length === 0 && (
        <Card className="card-gradient border border-dashed border-border p-12 text-center">
          <Wallet className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
          <h3 className="text-lg font-semibold text-foreground mb-2">No Budgets Yet</h3>
          <p className="text-sm text-muted-foreground mb-4">
            Start tracking your spending by creating your first budget
          </p>
          <Button onClick={() => handleOpenDialog()}>
            <Plus className="w-4 h-4 mr-1.5" />
            Create Budget
          </Button>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingBudget ? 'Edit Budget' : 'Create New Budget'}</DialogTitle>
            <DialogDescription>
              Set spending limits for specific categories to track your budget
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category}
                onValueChange={(value) => setFormData({ ...formData, category: value })}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.filter(c => c !== 'Income').map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="limit">Budget Limit (₹)</Label>
              <Input
                id="limit"
                type="number"
                step="0.01"
                placeholder="500.00"
                value={formData.limit}
                onChange={(e) => setFormData({ ...formData, limit: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Select
                value={formData.period}
                onValueChange={(value: 'monthly' | 'weekly') =>
                  setFormData({ ...formData, period: value })
                }
              >
                <SelectTrigger id="period">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="alert">Alert Threshold (%)</Label>
              <Input
                id="alert"
                type="number"
                min="0"
                max="100"
                placeholder="80"
                value={formData.alertThreshold}
                onChange={(e) => setFormData({ ...formData, alertThreshold: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Get notified when you reach this percentage of your budget
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSubmit}>
              {editingBudget ? 'Update' : 'Create'} Budget
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
