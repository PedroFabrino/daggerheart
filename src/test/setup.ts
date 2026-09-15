import '@testing-library/jest-dom';

// Ensure a reliable in-memory Storage for Node environment
class MockLocalStorage implements Storage {
  private store: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.store).length;
  }

  clear(): void {
    this.store = {};
  }

  getItem(key: string): string | null {
    return this.store[key] || null;
  }

  setItem(key: string, value: string): void {
    this.store[key] = String(value);
  }

  removeItem(key: string): void {
    delete this.store[key];
  }

  key(index: number): string | null {
    return Object.keys(this.store)[index] || null;
  }
}

const mockStore = new MockLocalStorage();
Object.defineProperty(globalThis, 'localStorage', {
  value: mockStore,
  writable: true,
});
