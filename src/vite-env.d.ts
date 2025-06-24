/// <reference types="vite/client" />

// Extend Navigator interface for online/offline detection
declare global {
  interface Navigator {
    onLine: boolean;
  }
}
