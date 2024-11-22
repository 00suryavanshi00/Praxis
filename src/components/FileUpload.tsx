import React from 'react';
import { useAppDispatch } from '../hooks/useAppSelector';
import { setInvoices, setLoading, setError } from '../redux/store/invoiceSlice';
import { Upload } from 'lucide-react';
import FileAdapter from '@/services/FileAdapter';
import AIProxy from '@/services/AiProxyService';
import AIExtractionService from '@/services/AiExtractionService';

const FileUpload: React.FC = () => {
  const dispatch = useAppDispatch();

  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const files = Array.from(e.dataTransfer.files);
    await processFiles(files);
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    await processFiles(files);
  };

  const processFiles = async (files: File[]) => {
    dispatch(setLoading(true));
    try {
      // Process each file
      console.log('process starts')
      const results = await Promise.all(
        files.map(async (file) => {
          const data = await FileAdapter.adapt(file);
          console.log('data', data)
          const proxy = new AIProxy(AIExtractionService.getInstance('AIzaSyABwWh_0dK01CEkZpuPkGVZTW8GbI2L3hU'));
          console.log('proxy', proxy)
          const result = await proxy.extract(data);
          console.log('result', result)
          if (result && Array.isArray(result.invoices)) {
            return result.invoices;
          }
          return [];
        })
      );

      // Combine results
      const allInvoices = results.flat();
      dispatch(setInvoices(allInvoices));

      console.log({
        title: "Success!",
        description: `Processed ${files.length} file(s) successfully.`,
      });
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : 'An unknown error occurred';
      dispatch(setError(errorMessage));
      console.log({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div
      onDrop={handleDrop}
      onDragOver={(e) => e.preventDefault()}
      className="border-2 border-dashed rounded-lg p-8 text-center hover:border-blue-500 transition-colors"
    >
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept=".xlsx,.xls,.csv,.pdf,image/*"
        className="hidden"
        multiple
      />
      <div className="flex flex-col items-center">
        <Upload className="h-12 w-12 text-gray-400 mb-4" />
        <button
          onClick={() => fileInputRef.current?.click()}
          className="text-blue-600 hover:text-blue-700 font-medium"
        >
          Click to upload
        </button>
        <p className="text-gray-500 mt-2">or drag and drop</p>
        <p className="text-sm text-gray-400 mt-1">
          Support for Excel, CSV, PDF files, and images
        </p>
      </div>
    </div>
  );
};

export default FileUpload;
