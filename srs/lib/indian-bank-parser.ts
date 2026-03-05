import type { Transaction } from './types';
import { categorizeTransaction } from './financial-engine';

// Common Indian bank column patterns
const COLUMN_PATTERNS = {
  date: ['date', 'txn date', 'transaction date', 'value date', 'posting date', 'txn. date'],
  description: ['description', 'narration', 'particulars', 'transaction details', 'remarks', 'details', 'transaction remarks'],
  debit: ['debit', 'withdrawal', 'dr', 'debit amount', 'withdrawal amt', 'paid out'],
  credit: ['credit', 'deposit', 'cr', 'credit amount', 'deposit amt', 'paid in'],
  amount: ['amount', 'transaction amount', 'txn amount'],
  balance: ['balance', 'closing balance', 'available balance'],
  type: ['type', 'transaction type', 'txn type'],
};

// Indian date format patterns
const INDIAN_DATE_FORMATS = [
  /(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/,           // DD-MM-YYYY or DD/MM/YYYY
  /(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{4})/,       // DD-MMM-YYYY or DD/MMM/YYYY
  /(\d{1,2})[-\/]([A-Za-z]{3})[-\/](\d{2})/,       // DD-MMM-YY or DD/MMM/YY
  /(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/,           // YYYY-MM-DD
  /(\d{1,2})\s+([A-Za-z]+)\s+(\d{4})/,             // DD Month YYYY
];

const MONTH_MAP: Record<string, number> = {
  jan: 0, january: 0,
  feb: 1, february: 1,
  mar: 2, march: 2,
  apr: 3, april: 3,
  may: 4,
  jun: 5, june: 5,
  jul: 6, july: 6,
  aug: 7, august: 7,
  sep: 8, sept: 8, september: 8,
  oct: 9, october: 9,
  nov: 10, november: 10,
  dec: 11, december: 11,
};

function parseIndianDate(dateStr: string): Date | null {
  if (!dateStr) return null;
  
  const trimmed = dateStr.trim();
  
  // Try DD-MM-YYYY or DD/MM/YYYY
  const format1 = trimmed.match(/(\d{1,2})[-\/](\d{1,2})[-\/](\d{4})/);
  if (format1) {
    const day = parseInt(format1[1]);
    const month = parseInt(format1[2]) - 1;
    const year = parseInt(format1[3]);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Try DD-MMM-YYYY or DD/MMM/YYYY
  const format2 = trimmed.match(/(\d{1,2})[-\/\s]([A-Za-z]{3,})[-\/\s](\d{2,4})/);
  if (format2) {
    const day = parseInt(format2[1]);
    const monthStr = format2[2].toLowerCase();
    const yearStr = format2[3];
    const year = yearStr.length === 2 ? 2000 + parseInt(yearStr) : parseInt(yearStr);
    
    const month = MONTH_MAP[monthStr];
    if (month !== undefined) {
      const date = new Date(year, month, day);
      if (!isNaN(date.getTime())) return date;
    }
  }
  
  // Try YYYY-MM-DD
  const format3 = trimmed.match(/(\d{4})[-\/](\d{1,2})[-\/](\d{1,2})/);
  if (format3) {
    const year = parseInt(format3[1]);
    const month = parseInt(format3[2]) - 1;
    const day = parseInt(format3[3]);
    const date = new Date(year, month, day);
    if (!isNaN(date.getTime())) return date;
  }
  
  // Fallback to native Date parsing
  const fallback = new Date(trimmed);
  return !isNaN(fallback.getTime()) ? fallback : null;
}

function parseIndianAmount(amountStr: string): number {
  if (!amountStr) return 0;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = amountStr
    .replace(/[₹$,\s]/g, '')
    .replace(/\(/g, '-')  // Handle negative as (amount)
    .replace(/\)/g, '')
    .trim();
  
  const amount = parseFloat(cleaned);
  return isNaN(amount) ? 0 : Math.abs(amount);
}

function findColumnIndex(headers: string[], patterns: string[]): number {
  const lowerHeaders = headers.map(h => h.toLowerCase().trim());
  
  for (const pattern of patterns) {
    const index = lowerHeaders.findIndex(h => h.includes(pattern) || pattern.includes(h));
    if (index !== -1) return index;
  }
  
  return -1;
}

function detectColumns(headers: string[]) {
  return {
    date: findColumnIndex(headers, COLUMN_PATTERNS.date),
    description: findColumnIndex(headers, COLUMN_PATTERNS.description),
    debit: findColumnIndex(headers, COLUMN_PATTERNS.debit),
    credit: findColumnIndex(headers, COLUMN_PATTERNS.credit),
    amount: findColumnIndex(headers, COLUMN_PATTERNS.amount),
    balance: findColumnIndex(headers, COLUMN_PATTERNS.balance),
    type: findColumnIndex(headers, COLUMN_PATTERNS.type),
  };
}

export function parseIndianBankCSV(csvText: string): Transaction[] {
  const lines = csvText.trim().split('\n').filter(line => line.trim());
  if (lines.length < 2) return [];
  
  // Find header row (skip empty lines and bank name lines)
  let headerIndex = 0;
  for (let i = 0; i < Math.min(5, lines.length); i++) {
    const line = lines[i].toLowerCase();
    if (line.includes('date') && (line.includes('description') || line.includes('narration') || line.includes('particulars'))) {
      headerIndex = i;
      break;
    }
  }
  
  const headerLine = lines[headerIndex];
  const headers = headerLine.split(',').map(h => h.trim().replace(/^["']|["']$/g, ''));
  const columns = detectColumns(headers);
  
  const transactions: Transaction[] = [];
  const dataLines = lines.slice(headerIndex + 1);
  
  for (let i = 0; i < dataLines.length; i++) {
    const line = dataLines[i];
    if (!line.trim()) continue;
    
    // Parse CSV line (handle quoted fields)
    const parts: string[] = [];
    let current = '';
    let inQuotes = false;
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      if (char === '"' || char === "'") {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        parts.push(current.trim());
        current = '';
      } else {
        current += char;
      }
    }
    parts.push(current.trim());
    
    // Clean up parts
    const cleanParts = parts.map(p => p.replace(/^["']|["']$/g, '').trim());
    
    if (cleanParts.length < 2) continue;
    
    // Extract data
    const dateStr = columns.date >= 0 ? cleanParts[columns.date] : cleanParts[0];
    const date = parseIndianDate(dateStr);
    if (!date) continue;
    
    const description = columns.description >= 0 
      ? cleanParts[columns.description] 
      : cleanParts[1] || 'Transaction';
    
    if (!description || description.toLowerCase().includes('balance') || description.toLowerCase().includes('opening')) {
      continue;
    }
    
    let amount = 0;
    let type: 'credit' | 'debit' = 'debit';
    
    // Check if there are separate debit/credit columns
    if (columns.debit >= 0 && columns.credit >= 0) {
      const debitAmt = parseIndianAmount(cleanParts[columns.debit] || '0');
      const creditAmt = parseIndianAmount(cleanParts[columns.credit] || '0');
      
      if (creditAmt > 0) {
        amount = creditAmt;
        type = 'credit';
      } else if (debitAmt > 0) {
        amount = debitAmt;
        type = 'debit';
      }
    } else if (columns.amount >= 0) {
      // Single amount column
      const amountStr = cleanParts[columns.amount];
      amount = parseIndianAmount(amountStr);
      
      // Determine type from type column or amount sign
      if (columns.type >= 0) {
        const typeStr = cleanParts[columns.type].toLowerCase();
        type = typeStr.includes('cr') || typeStr.includes('credit') || typeStr.includes('deposit') ? 'credit' : 'debit';
      } else {
        // Check if original amount had negative sign or parentheses
        type = amountStr.includes('-') || amountStr.includes('(') ? 'debit' : 'credit';
      }
    } else {
      // Try to find amount in any column
      for (let j = 2; j < cleanParts.length; j++) {
        const parsed = parseIndianAmount(cleanParts[j]);
        if (parsed > 0) {
          amount = parsed;
          break;
        }
      }
    }
    
    if (amount === 0) continue;
    
    const { category, confidence } = categorizeTransaction(description, type);
    
    transactions.push({
      id: `txn-${Date.now()}-${i}`,
      date,
      description,
      amount,
      type,
      category,
      confidence,
    });
  }
  
  return transactions.sort((a, b) => b.date.getTime() - a.date.getTime());
}

// Export for backward compatibility
export function parseCSV(csvText: string): Transaction[] {
  return parseIndianBankCSV(csvText);
}
