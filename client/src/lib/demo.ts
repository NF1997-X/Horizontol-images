// Demo mode configuration
export const DEMO_MODE = true; // Set to false when database is working

// API base URL helper  
export function getApiUrl(endpoint: string): string {
  if (DEMO_MODE) {
    // Route all API calls to demo endpoint
    if (endpoint.startsWith('/api/')) {
      return '/api/demo';
    }
    return endpoint;
  }
  
  // Normal API endpoints
  return endpoint;
}

// Demo data for quick testing
export const DEMO_CONFIG = {
  pageId: '1',
  rowIds: ['1', '2', '3'],
  imageCount: 10,
  features: {
    upload: false,      // Disable upload in demo mode
    edit: false,        // Disable editing in demo mode  
    delete: false,      // Disable deletion in demo mode
    share: true,        // Enable sharing (works with demo data)
    preview: true,      // Enable preview mode
    darkMode: true,     // Enable dark mode toggle
  }
};

export default DEMO_CONFIG;