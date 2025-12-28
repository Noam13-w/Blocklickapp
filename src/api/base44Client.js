import { createClient } from '@base44/sdk';
// import { getAccessToken } from '@base44/sdk/utils/auth-utils';

// Create a client with authentication required
export const base44 = createClient({
  appId: "685d8eb0c6e253c41e780e66", 
  requiresAuth: true // Ensure authentication is required for all operations
});
