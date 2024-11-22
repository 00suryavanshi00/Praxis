export interface Invoice {
    id?: string;
    // Add other invoice fields as needed
    amount?: number;
    date?: string;
    vendor?: string;
  }
  
  export interface ExtractionResult {
    invoices: Invoice[];
    rawData?: any;
    error?: string;
  }