class Logger {
    static logPerformance(message: string) {
      console.log(`[Performance]: ${message} at ${new Date().toISOString()}`);
    }
  
    static logError(message: string, error: any) {
      console.error(`[Error]: ${message}`, error);
    }
  }
  
  export default Logger;
  