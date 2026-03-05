# Indian Bank Statement Support

## Supported File Types

### 1. CSV Files ✓
Upload CSV files exported from your bank's internet banking portal.

### 2. Image Files ✓ (NEW)
Upload screenshots or scanned copies of bank statements:
- JPG/JPEG
- PNG
- GIF
- WebP
- BMP

Images are processed using OCR (Optical Character Recognition) to extract transaction data.

## Supported Indian Banks

The system automatically detects and parses statements from major Indian banks including:

- **State Bank of India (SBI)**
- **HDFC Bank**
- **ICICI Bank**
- **Axis Bank**
- **Kotak Mahindra Bank**
- **Punjab National Bank (PNB)**
- **Bank of Baroda**
- **Canara Bank**
- And most other Indian banks

## Supported Date Formats

The parser automatically detects various Indian date formats:

- `DD-MM-YYYY` (e.g., 15-03-2026)
- `DD/MM/YYYY` (e.g., 15/03/2026)
- `DD-MMM-YYYY` (e.g., 15-Mar-2026)
- `DD/MMM/YYYY` (e.g., 15/Mar/2026)
- `DD-MMM-YY` (e.g., 15-Mar-26)
- `DD Month YYYY` (e.g., 15 March 2026)
- `YYYY-MM-DD` (ISO format)

## Supported Column Names

The system automatically detects columns with various names:

### Date Columns
- Date, Txn Date, Transaction Date, Value Date, Posting Date, Txn. Date

### Description Columns
- Description, Narration, Particulars, Transaction Details, Remarks, Details

### Amount Columns
- Debit, Withdrawal, Dr, Debit Amount, Withdrawal Amt
- Credit, Deposit, Cr, Credit Amount, Deposit Amt
- Amount, Transaction Amount, Txn Amount

### Balance Columns
- Balance, Closing Balance, Available Balance

## Currency Format Support

- Rupee symbol: ₹
- Dollar symbol: $
- Comma separators: 1,50,000.00 (Indian format)
- Negative amounts in parentheses: (500.00)

## Example CSV Format

```csv
Transaction Date,Description,Debit,Credit,Balance
01-Mar-2026,NEFT Transfer,5000.00,,45000.00
02-Mar-2026,UPI-Swiggy,450.50,,44549.50
02-Mar-2026,Salary Credit,,75000.00,119549.50
03-Mar-2026,ATM Withdrawal,2000.00,,117549.50
```

## Tips for Best Results

### For CSV Files:
1. Export directly from your bank's internet banking portal
2. Keep the header row intact
3. Don't manually edit the file before uploading

### For Image Files:
1. Ensure the image is clear and well-lit
2. Avoid shadows or glare on the document
3. Make sure text is readable and not blurry
4. Straighten the document (not tilted)
5. Higher resolution images work better
6. PDF files can be converted to images first

## How It Works

### CSV Processing:
1. Auto-detects column headers (works even if columns are in different order)
2. Parses Indian date formats automatically
3. Identifies debit/credit columns
4. Handles various currency formats
5. Auto-categorizes transactions

### Image Processing (OCR):
1. Uploads image file
2. Processes with Tesseract.js OCR engine
3. Extracts text from image
4. Parses extracted text as CSV-like data
5. Auto-categorizes transactions

## Troubleshooting

### CSV Issues:
- **No transactions found**: Check if the CSV has a header row
- **Wrong dates**: Ensure dates follow DD-MM-YYYY or similar format
- **Missing amounts**: Verify debit/credit columns are present

### Image Issues:
- **OCR not working**: Try a higher resolution image
- **Wrong data extracted**: Use CSV format instead for better accuracy
- **Slow processing**: Large images take longer to process
- **No results**: Ensure text is clearly visible in the image

## Sample Files

Check the `sample-indian-bank.csv` file in the project root for a working example.

## Privacy & Security

All file processing happens **entirely in your browser**:
- No data is sent to any server
- Files are not uploaded to the cloud
- OCR processing is done locally
- Data is stored only in your browser's localStorage
- Clear your browser data to remove all information
