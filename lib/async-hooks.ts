class AsyncLocalStorage<T = any> {
  private storage: Map<string, T> = new Map();
  private currentId = 0;

  run<R>(store: T, callback: (...args: any[]) => R, ...args: any[]): R {
    const id = `als_${this.currentId++}`;
    this.storage.set(id, store);
    
    try {
      return callback(...args);
    } finally {
      this.storage.delete(id);
    }
  }

  getStore(): T | undefined {
    // W środowisku przeglądarki nie mamy prawdziwego async context
    // Zwracamy undefined - LangGraph powinien to obsłużyć
    return undefined;
  }
}

export { AsyncLocalStorage };