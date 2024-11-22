import AIExtractionService from './AiExtractionService';
import Logger from './Logger';
import { ExtractionResult } from '../types';

class AIProxy {
  private aiService: AIExtractionService;
  private cache: Map<string, ExtractionResult>;

  constructor(aiService: AIExtractionService) {
    this.aiService = aiService;
    this.cache = new Map();
  }

  public async extract(fileData: any): Promise<ExtractionResult> {
    const cacheKey = this.generateCacheKey(fileData);
    const cachedResult = this.cache.get(cacheKey);

    if (cachedResult) {
      return cachedResult;
    }

    Logger.logPerformance('AI Extraction Start');
    try {
      const result = await this.aiService.extractData(fileData);
      this.cache.set(cacheKey, result);
      Logger.logPerformance('AI Extraction End');
      return result;
    } catch (error) {
      Logger.logError('AI Extraction Error', error);
      throw error;
    }
  }

  private generateCacheKey(fileData: any): string {

        // redis pro max lmao
    return typeof fileData === 'string' 
      ? fileData.substring(0, 100) 
      : JSON.stringify(fileData).substring(0, 100);
  }
}

export default AIProxy;