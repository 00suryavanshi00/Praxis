import React from 'react';
import { useSelector } from 'react-redux';
import FileUpload from './FileUpload';
import InvoiceList from './InvoiceList';
import { RootState } from '../redux/store/index';
import { AlertCircle, Loader2 } from 'lucide-react';

const InvoiceProcessing: React.FC = () => {
  const { items: invoices, loading, error } = useSelector((state: RootState) => state.invoices);

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-gray-900">Invoice Processing</h1>
          <p className="mt-2 text-gray-600">Upload your invoice files (images or Excel) for AI analysis</p>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-xl font-semibold mb-4">Upload Files</h2>
          <FileUpload />
        </div>

        {/* Status Messages */}
        {loading && (
          <div className="flex items-center justify-center space-x-2 text-blue-600">
            <Loader2 className="animate-spin" size={20} />
            <span>Processing your file...</span>
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-2">
            <AlertCircle className="text-red-500 flex-shrink-0" size={20} />
            <span className="text-red-700">{error}</span>
          </div>
        )}

        {/* Results Section */}
        {invoices.length > 0 && <InvoiceList invoices={invoices} />}
      </div>
    </div>
  );
};

export default InvoiceProcessing;