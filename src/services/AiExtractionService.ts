import { GoogleGenerativeAI } from "@google/generative-ai";
import { ExtractionResult, Invoice } from "../types";
import * as XLSX from "xlsx";
import pdfToText from "react-pdftotext";

class AIExtractionService {
  private static instance: AIExtractionService;
  private genAI: GoogleGenerativeAI;

  private constructor(apiKey: string) {
    this.genAI = new GoogleGenerativeAI(apiKey);
  }

  public static getInstance(apiKey?: string): AIExtractionService {
    if (!AIExtractionService.instance) {
      if (!apiKey) {
        throw new Error("API Key is required for first-time initialization");
      }
      AIExtractionService.instance = new AIExtractionService(apiKey);
    }
    return AIExtractionService.instance;
  }

  private async fileToGenerativePart(fileData: any): Promise<{ inlineData: { data: string; mimeType: string } }> {
    // Check if fileData is a File or Blob
    if (fileData instanceof File) {
      const mimeType = fileData.type;
  
      // Handle PDF files
      if (mimeType.includes("pdf")) {
        const pdfText = await this.extractTextFromPDF(fileData);
        return { inlineData: { data: pdfText, mimeType: "application/pdf" } };
      }
  
      // Handle XLSX files
      if (mimeType.includes("application/vnd.openxmlformats-officedocument.spreadsheetml.sheet") || 
          fileData.name.endsWith(".xlsx")) {
        const excelText = await this.extractTextFromExcel(fileData);
        return { inlineData: { data: excelText, mimeType: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" } };
      }
  
      // Handle other file types as base64
      return new Promise<{ inlineData: { data: string; mimeType: string } }>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          if (reader.result === null) {
            reject(new Error("File reading failed: result is null"));
            return;
          }
          const base64Data = reader.result.toString().split(",")[1];
          resolve({
            inlineData: { data: base64Data, mimeType: fileData.type || "application/octet-stream" },
          });
        };
        reader.onerror = reject;
        reader.readAsDataURL(fileData);
      });
    }
  
    // Log the type of fileData for debugging
    console.error("Invalid file data type:", typeof fileData, fileData);
    throw new Error("Invalid file data type. Expected File, Blob, or base64 string.");
  }

  public async extractData(fileData: any): Promise<ExtractionResult> {
    try {
      const model = this.genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const imagePart = await this.fileToGenerativePart(fileData);
      const prompt = this.generatePrompt(fileData);

      const result = await model.generateContent([prompt, imagePart]);
      const response = await result.response;
      const text = response.text();

      return this.parseGeminiResponse(text);
    } catch (error) {
      console.error("Error in AI extraction:", error);
      throw new Error("Failed to process file with AI");
    }
  }

  private generatePrompt(fileData: any): string {
    if (typeof fileData === "string") {
      return "Please analyze this image and extract any invoice-related information including amounts, dates, and vendor details. Return the data in a structured format.";
    }

    const mimeType = fileData instanceof File ? fileData.type : "";

    if (mimeType.includes("spreadsheet") || fileData.name.endsWith(".csv") || fileData.name.endsWith(".xlsx")) {
      return "Please analyze this spreadsheet data and extract invoice-related information. Structure the data with consistent fields like amount, date, and vendor name.";
    }

    if (mimeType.includes("pdf")) {
      return "Please analyze this PDF and extract any invoice-related information including amounts, dates, and vendor details. Return the data in a structured format.";
    }

    return "Please analyze this file and extract any invoice-related information. Return the data in a structured format.";
  }

  private parseGeminiResponse(response: string): ExtractionResult {
    try {
      const invoices = this.convertToInvoices(response);
      return { invoices, rawData: response };
    } catch (error) {
      return { invoices: [], error: "Failed to parse AI response" };
    }
  }

  private convertToInvoices(text: string): Invoice[] {
    try {
      return [];
    } catch (error) {
      console.error("Error converting to invoices:", error);
      return [];
    }
  }

  private async extractTextFromPDF(file: File): Promise<string> {
    return pdfToText(file)
      .then((text) => text)
      .catch((error) => {
        console.error("Failed to extract text from PDF", error);
        throw new Error("PDF text extraction failed");
      });
  }

  private async extractTextFromExcel(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          let text = "";

          // Iterate through each sheet and extract data
          workbook.SheetNames.forEach((sheetName) => {
            const sheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(sheet, { header: 1 }); // Get rows as arrays
            json.forEach((row:any) => {
              text += row.join(", ") + "\n"; // Join each row's cells with a comma
            });
          });

          resolve(text);
        } catch (error) {
          console.error("Error reading Excel file:", error);
          reject(new Error("Failed to extract text from Excel file"));
        }
      };
      reader.onerror = reject;
      reader.readAsArrayBuffer(file);
    });
  }
}

export default AIExtractionService;
