import Tesseract from 'tesseract.js';
import type { Transaction } from './types';
import { parseIndianBankCSV } from './indian-bank-parser';

export interface OCRProgress {
  status: string;
  progress: number;
}

export async function processImageToTransactions(
  file: File,
  onProgress?: (progress: OCRProgress) => void
): Promise<Transaction[]> {
  try {
    // Perform OCR on the image
    const result = await Tesseract.recognize(file, 'eng', {
      logger: (m) => {
        if (onProgress && m.status) {
          onProgress({
            status: m.status,
            progress: m.progress || 0,
          });
        }
      },
    });

    const text = result.data.text;
    
    // Try to parse the OCR text as CSV-like data
    const transactions = parseOCRText(text);
    
    return transactions;
  } catch (error) {
    console.error('OCR Error:', error);
    throw new Error('Failed to process image. Please try with a clearer image or CSV file.');
  }
}

function parseOCRText(text: string): Transaction[] {
  // Clean up OCR text
  const cleaned = text
    .replace(/\r\n/g, '\n')
    .replace(/\r/g, '\n')
    .split('\n')
    .filter(line => line.trim())
    .join('\n');
  
  // First, try to detect if it looks like a CSV format
  const lines = cleaned.split('\n');
  
  // Check if it has comma-separated values
  const hasCommas = lines.some(line => line.split(',').length > 2);
  
  if (hasCommas) {
    // Try parsing as CSV
    try {
      const transactions = parseIndianBankCSV(cleaned);
      if (transactions.length > 0) return transactions;
    } catch (error) {
      console.log('Failed to parse as CSV, trying structured text parsing');
    }
  }
  
  // Try parsing as structured text (table format)
  return parseStructuredText(lines);
}

function parseStructuredText(lines: string[]): Transaction[] {
  const transactions: Transaction[] = [];
  
  // This is a simplified parser for table-like text
  // You might need to adjust based on actual bank statement formats
  
  for (const line of lines) {
    // Skip header lines, empty lines, and summary lines
    if (!line.trim() || 
        line.toLowerCase().includes('statement') ||
        line.toLowerCase().includes('account') ||
        line.toLowerCase().includes('balance brought') ||
        line.length < 10) {
      continue;
    }
    
    // Try to extract transaction data using patterns
    // This is a basic implementation - you may need to enhance it
    const parts = line.split(/\s{2,}/).filter(p => p.trim());
    
    if (parts.length >= 3) {
      // Try to identify date, description, and amount
      // This is where you'd implement more sophisticated parsing
      // based on your specific bank statement formats
    }
  }
  
  return transactions;
}

export function isImageFile(file: File): boolean {
  return file.type.startsWith('image/');
}

export function isCSVFile(file: File): boolean {
  return file.type === 'text/csv' || file.name.endsWith('.csv');
}
