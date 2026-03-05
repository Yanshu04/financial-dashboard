import { useState } from 'react';
import { motion } from 'framer-motion';
import { Filter, Search, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import type { Transaction } from '@/lib/types';

export interface FilterOptions {
  searchTerm: string;
  category: string;
  type: string;
  dateRange: string;
  minAmount: string;
  maxAmount: string;
}

interface TransactionFiltersProps {
  transactions: Transaction[];
  filters: FilterOptions;
  onFilterChange: (filters: FilterOptions) => void;
  categories: string[];
}

export function TransactionFilters({ transactions, filters, onFilterChange, categories }: TransactionFiltersProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleReset = () => {
    onFilterChange({
      searchTerm: '',
      category: 'all',
      type: 'all',
      dateRange: 'all',
      minAmount: '',
      maxAmount: '',
    });
  };

  const hasActiveFilters = 
    filters.searchTerm || 
    filters.category !== 'all' || 
    filters.type !== 'all' || 
    filters.dateRange !== 'all' ||
    filters.minAmount ||
    filters.maxAmount;

  return (
    <div className="card-gradient rounded-xl border border-border p-4">
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-primary" />
            <h3 className="font-semibold text-sm">Filters</h3>
            {hasActiveFilters && (
              <span className="text-xs px-2 py-0.5 rounded-full bg-primary/20 text-primary">
                Active
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={handleReset} className="h-7 text-xs">
                <X className="w-3 h-3 mr-1" />
                Clear
              </Button>
            )}
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="h-7">
                {isOpen ? 'Hide' : 'Show'}
              </Button>
            </CollapsibleTrigger>
          </div>
        </div>

        <CollapsibleContent>
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="space-y-4"
          >
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by description..."
                value={filters.searchTerm}
                onChange={(e) => onFilterChange({ ...filters, searchTerm: e.target.value })}
                className="pl-9"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
              {/* Category Filter */}
              <Select
                value={filters.category}
                onValueChange={(value) => onFilterChange({ ...filters, category: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Category" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* Type Filter */}
              <Select
                value={filters.type}
                onValueChange={(value) => onFilterChange({ ...filters, type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="debit">Expenses</SelectItem>
                  <SelectItem value="credit">Income</SelectItem>
                </SelectContent>
              </Select>

              {/* Date Range */}
              <Select
                value={filters.dateRange}
                onValueChange={(value) => onFilterChange({ ...filters, dateRange: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Date Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Time</SelectItem>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>

              {/* Amount Range */}
              <div className="flex gap-2">
                <Input
                  type="number"
                  placeholder="Min ₹"
                  value={filters.minAmount}
                  onChange={(e) => onFilterChange({ ...filters, minAmount: e.target.value })}
                  className="w-full"
                />
                <Input
                  type="number"
                  placeholder="Max ₹"
                  value={filters.maxAmount}
                  onChange={(e) => onFilterChange({ ...filters, maxAmount: e.target.value })}
                  className="w-full"
                />
              </div>
            </div>
          </motion.div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
