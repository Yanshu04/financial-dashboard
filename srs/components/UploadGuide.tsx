import { Info, FileText, Image as ImageIcon, CheckCircle2 } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Button } from '@/components/ui/button';
import { useState } from 'react';

export function UploadGuide() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Alert className="border-primary/20 bg-primary/5">
        <Info className="h-4 w-4 text-primary" />
        <AlertTitle className="flex items-center justify-between">
          <span>Indian Bank Statements Supported</span>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 text-xs">
              {isOpen ? 'Hide' : 'Show'} Details
            </Button>
          </CollapsibleTrigger>
        </AlertTitle>
        <AlertDescription className="text-xs mt-2">
          Upload CSV or Image files from SBI, HDFC, ICICI, Axis, Kotak, and other Indian banks
        </AlertDescription>
        
        <CollapsibleContent className="mt-4 space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <FileText className="w-4 h-4 text-primary" />
                <span>CSV Files</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                  <span>Auto-detects column order</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                  <span>Multiple date formats (DD-MM-YYYY, etc.)</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                  <span>Debit/Credit columns auto-detected</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium">
                <ImageIcon className="w-4 h-4 text-primary" />
                <span>Image Files (OCR)</span>
              </div>
              <ul className="space-y-1 text-xs text-muted-foreground ml-6">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                  <span>JPG, PNG formats supported</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                  <span>Use clear, well-lit photos</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="w-3 h-3 mt-0.5 shrink-0 text-success" />
                  <span>OCR processed in browser (private)</span>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-2 border-t border-border">
            <p className="text-xs text-muted-foreground">
              <strong>Privacy:</strong> All processing happens in your browser. No data is sent to any server.
            </p>
          </div>
        </CollapsibleContent>
      </Alert>
    </Collapsible>
  );
}
