import { useCallback, useState } from 'react';
import { Upload, FileText, Image, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { parseIndianBankCSV } from '@/lib/indian-bank-parser';
import { processImageToTransactions, isImageFile, isCSVFile, type OCRProgress } from '@/lib/ocr-processor';
import { Progress } from '@/components/ui/progress';
import type { Transaction } from '@/lib/types';

interface CSVUploadProps {
  onDataLoaded: (transactions: Transaction[]) => void;
}

export function CSVUpload({ onDataLoaded }: CSVUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ocrProgress, setOcrProgress] = useState<OCRProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    setFileName(file.name);
    setError(null);
    setIsProcessing(true);
    
    try {
      if (isImageFile(file)) {
        // Process image with OCR
        setOcrProgress({ status: 'Loading image...', progress: 0 });
        const transactions = await processImageToTransactions(file, (progress) => {
          setOcrProgress(progress);
        });
        
        if (transactions.length > 0) {
          onDataLoaded(transactions);
          setOcrProgress(null);
        } else {
          setError('No transactions found in the image. Please try a CSV file or a clearer image.');
        }
      } else if (isCSVFile(file)) {
        // Process CSV file
        const reader = new FileReader();
        reader.onload = (e) => {
          try {
            const text = e.target?.result as string;
            const transactions = parseIndianBankCSV(text);
            if (transactions.length > 0) {
              onDataLoaded(transactions);
            } else {
              setError('No valid transactions found in the CSV. Please check the file format.');
            }
          } catch (err) {
            setError('Failed to parse CSV file. Please check the format.');
            console.error('CSV parsing error:', err);
          }
          setIsProcessing(false);
        };
        reader.onerror = () => {
          setError('Failed to read file');
          setIsProcessing(false);
        };
        reader.readAsText(file);
      } else {
        setError('Please upload a CSV or image file (JPG, PNG, PDF)');
        setIsProcessing(false);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to process file');
      setIsProcessing(false);
      setOcrProgress(null);
    }
  }, [onDataLoaded]);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }, [handleFile]);

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
        isDragging ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/50'
      } ${isProcessing ? 'pointer-events-none opacity-75' : 'cursor-pointer'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
    >
      <input
        type="file"
        accept=".csv,image/*"
        onChange={handleChange}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        disabled={isProcessing}
      />
      
      <AnimatePresence mode="wait">
        {isProcessing && ocrProgress ? (
          <motion.div
            key="processing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-4"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <div className="w-full max-w-xs">
              <p className="text-sm text-foreground font-medium mb-2">
                {ocrProgress.status}
              </p>
              <Progress value={ocrProgress.progress * 100} className="h-2" />
              <p className="text-xs text-muted-foreground mt-2">
                {Math.round(ocrProgress.progress * 100)}% complete
              </p>
            </div>
          </motion.div>
        ) : isProcessing ? (
          <motion.div
            key="loading"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-sm text-foreground font-medium">Processing file...</p>
          </motion.div>
        ) : fileName && !error ? (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            {fileName.match(/\.(jpg|jpeg|png|gif|bmp|webp)$/i) ? (
              <Image className="w-10 h-10 text-primary" />
            ) : (
              <FileText className="w-10 h-10 text-primary" />
            )}
            <div>
              <p className="text-sm text-foreground font-medium">{fileName}</p>
              <p className="text-xs text-success mt-1">✓ File loaded successfully</p>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="idle"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center gap-3"
          >
            <div className="flex gap-3 mb-2">
              <FileText className="w-8 h-8 text-muted-foreground" />
              <span className="text-muted-foreground">or</span>
              <Image className="w-8 h-8 text-muted-foreground" />
            </div>
            <Upload className="w-10 h-10 text-muted-foreground mb-2" />
            <div>
              <p className="text-sm text-foreground font-medium">
                Drop your bank statement here
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                CSV or Image (JPG, PNG) - Indian bank formats supported
              </p>
            </div>
            <div className="mt-3 text-xs text-muted-foreground space-y-1">
              <p>✓ SBI, HDFC, ICICI, Axis, Kotak formats</p>
              <p>✓ Automatic date format detection</p>
              <p>✓ Debit/Credit columns auto-detected</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {error && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20"
        >
          <p className="text-xs text-destructive">{error}</p>
        </motion.div>
      )}
    </motion.div>
  );
}
