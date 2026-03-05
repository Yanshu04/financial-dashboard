import { useState } from 'react';
import { motion } from 'framer-motion';
import { Pencil, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { Transaction } from '@/lib/types';

interface TransactionTableProps {
  transactions: Transaction[];
  onEdit?: (transaction: Transaction) => void;
}

const ITEMS_PER_PAGE = 30;

export function TransactionTable({ transactions, onEdit }: TransactionTableProps) {
  const [currentPage, setCurrentPage] = useState(1);
  const totalPages = Math.ceil(transactions.length / ITEMS_PER_PAGE);
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const endIndex = startIndex + ITEMS_PER_PAGE;
  const displayed = transactions.slice(startIndex, endIndex);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.5 }}
      className="card-gradient rounded-xl border border-border p-6"
    >
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-sm font-medium text-muted-foreground">Recent Transactions</h3>
        <span className="text-xs text-muted-foreground font-mono">{transactions.length} total</span>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left pb-2 text-muted-foreground font-medium">Date</th>
              <th className="text-left pb-2 text-muted-foreground font-medium">Description</th>
              <th className="text-left pb-2 text-muted-foreground font-medium">Category</th>
              <th className="text-right pb-2 text-muted-foreground font-medium">Confidence</th>
              <th className="text-right pb-2 text-muted-foreground font-medium">Amount</th>
              {onEdit && <th className="text-right pb-2 text-muted-foreground font-medium">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {displayed.map((t, i) => (
              <motion.tr
                key={t.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.01 * i }}
                className="border-b border-border/50 hover:bg-secondary/30 transition-colors"
              >
                <td className="py-2.5 font-mono text-muted-foreground">{t.date.toLocaleDateString()}</td>
                <td className="py-2.5 text-foreground">{t.description}</td>
                <td className="py-2.5">
                  <span className="px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px]">
                    {t.category}
                  </span>
                </td>
                <td className="py-2.5 text-right font-mono text-muted-foreground">
                  {(t.confidence * 100).toFixed(0)}%
                </td>
                <td className={`py-2.5 text-right font-mono font-medium ${t.type === 'credit' ? 'text-success' : 'text-foreground'}`}>
                  {t.type === 'credit' ? '+' : '-'}₹{t.amount.toFixed(2)}
                </td>
                {onEdit && (
                  <td className="py-2.5 text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onEdit(t)}
                      className="h-6 w-6 p-0"
                    >
                      <Pencil className="w-3 h-3" />
                    </Button>
                  </td>
                )}
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {transactions.length > ITEMS_PER_PAGE && (
        <div className="flex items-center justify-between mt-6 pt-4 border-t border-border">
          <span className="text-xs text-muted-foreground">
            Showing {startIndex + 1}-{Math.min(endIndex, transactions.length)} of {transactions.length} transactions
          </span>
          
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            
            <div className="flex items-center gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <Button
                  key={page}
                  variant={page === currentPage ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setCurrentPage(page)}
                  className="h-8 min-w-8 p-0"
                >
                  {page}
                </Button>
              ))}
            </div>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>
      )}
    </motion.div>
  );
}
