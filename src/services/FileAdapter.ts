import * as XLSX from 'xlsx';
import { getDocument } from 'pdfjs-dist';

class FileAdapter {
  static async adapt(file: File): Promise<any> {
    const fileType = file.type;
    
    if (fileType.includes('image')) {
      return await this.handleImage(file);
    } else if (fileType.includes('spreadsheet') || file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      return await this.handleExcel(file);
    } else if (file.name.endsWith('.csv')) {
      return await this.handleCSV(file);
    } else if (fileType.includes('pdf')) {
      return await this.handlePDF(file);
    } else {
      throw new Error('Unsupported file type');
    }
  }

  private static async handleImage(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const base64String = reader.result as string;
        resolve(base64String.split(',')[1]); // Remove data URL prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  }

  private static async handleExcel(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: 'array' });
          const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
          const jsonData = XLSX.utils.sheet_to_json(firstSheet);
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }

  private static async handleCSV(file: File): Promise<any[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result as string;
          const rows = text.split('\n').map(row => row.split(','));
          const headers = rows[0];
          const jsonData = rows.slice(1).map(row => {
            return row.reduce((acc, cell, idx) => {
              acc[headers[idx]] = cell;
              return acc;
            }, {} as any);
          });
          resolve(jsonData);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  private static async handlePDF(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = async (e) => {
        try {
          const typedArray = new Uint8Array(e.target?.result as ArrayBuffer);
          const pdf = await getDocument(typedArray).promise;
          let text = '';
          
          // Loop through all the pages in the PDF and extract text
          for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
            const page = await pdf.getPage(pageNum);
            const content = await page.getTextContent();
            const pageText = content.items.map((item: any) => item.str).join(' ');
            text += pageText + '\n'; // Accumulate all text content from each page
          }

          resolve(text);
        } catch (error) {
          reject(error);
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}


export default FileAdapter;
