import axios from 'axios';

const client = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Token storage keys
const ACCESS_TOKEN_KEY = 're_access_token';
const REFRESH_TOKEN_KEY = 're_refresh_token';

// Token getters/setters using localStorage
export const getAccessToken = () => localStorage.getItem(ACCESS_TOKEN_KEY);
export const setAccessToken = (token) => localStorage.setItem(ACCESS_TOKEN_KEY, token);
export const getRefreshToken = () => localStorage.getItem(REFRESH_TOKEN_KEY);
export const setRefreshToken = (token) => localStorage.setItem(REFRESH_TOKEN_KEY, token);
export const clearTokens = () => {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

// Simulation helpers for when backend is unreachable
const simulateAuthResponse = () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.warn("Auth API Unreachable. Running simulated auth response.");
      resolve({
        accessToken: 'mock-access-token-' + Date.now(),
        refreshToken: 'mock-refresh-token-' + Date.now(),
        expiresIn: 3600
      });
    }, 300);
  });
};

const simulateUserInfo = (email) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        email: email || 'user@example.com',
        isEmailConfirmed: true
      });
    }, 200);
  });
};

export const authClient = {
  // Email/password login
  login: async (email, password) => {
    try {
      const response = await client.post('/login', { email, password });
      const { accessToken, refreshToken, expiresIn } = response.data;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      return { success: true, accessToken, refreshToken, expiresIn };
    } catch (error) {
      console.error("Login API failed:", error);
      // Fallback simulation for dev without backend
      if (import.meta.env.DEV) {
        const mockData = await simulateAuthResponse(email);
        setAccessToken(mockData.accessToken);
        setRefreshToken(mockData.refreshToken);
        return { success: true, ...mockData, isMock: true };
      }
      throw error;
    }
  },

  // Email/password registration
  register: async (email, password) => {
    try {
      const response = await client.post('/register', { email, password });
      const { accessToken, refreshToken, expiresIn } = response.data;
      setAccessToken(accessToken);
      setRefreshToken(refreshToken);
      return { success: true, accessToken, refreshToken, expiresIn };
    } catch (error) {
      console.error("Register API failed:", error);
      if (import.meta.env.DEV) {
        const mockData = await simulateAuthResponse(email);
        setAccessToken(mockData.accessToken);
        setRefreshToken(mockData.refreshToken);
        return { success: true, ...mockData, isMock: true };
      }
      throw error;
    }
  },

  // Get current user info
  getCurrentUser: async () => {
    try {
      const response = await client.get('/manage/info', {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Get current user failed:", error);
      if (import.meta.env.DEV && getAccessToken()) {
        return simulateUserInfo();
      }
      throw error;
    }
  },

  // Refresh token
  refreshToken: async () => {
    return await refreshToken();
  },

  // Server-side logout
  logout: async () => {
    try {
      await client.post('/logout', {}, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
    } catch (error) {
      console.error("Logout API failed:", error);
      // Continue to clear tokens even if server call fails
    } finally {
      clearTokens();
    }
  },

  // WebAuthn / Passkey Login
  getPasskeyLoginOptions: async () => {
    try {
      const response = await client.post('/api/passkey/login-options');
      return response.data;
    } catch (error) {
      console.error("Get passkey login options failed:", error);
      throw error;
    }
  },

  verifyPasskeyLogin: async (credential) => {
    try {
      const response = await client.post('/api/passkey/login-verify', credential);
      const { accessToken, refreshToken } = response.data;
      if (accessToken) {
        setAccessToken(accessToken);
        setRefreshToken(refreshToken);
      }
      return response.data;
    } catch (error) {
      console.error("Verify passkey login failed:", error);
      throw error;
    }
  },

  // WebAuthn / Passkey Registration (admin-only)
  getPasskeyRegisterOptions: async () => {
    try {
      const response = await client.post('/api/passkey/register-options', {}, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Get passkey register options failed:", error);
      throw error;
    }
  },

  verifyPasskeyRegister: async (credential) => {
    try {
      const response = await client.post('/api/passkey/register-verify', credential, {
        headers: {
          'Authorization': `Bearer ${getAccessToken()}`
        }
      });
      return response.data;
    } catch (error) {
      console.error("Verify passkey register failed:", error);
      throw error;
    }
  }
};

// Standalone refresh token function for interceptors
export const refreshToken = async () => {
  const token = getRefreshToken();
  if (!token) {
    throw new Error('No refresh token available');
  }
  try {
    const response = await client.post('/refresh', { refreshToken: token });
    const { accessToken, refreshToken: newRefreshToken, expiresIn } = response.data;
    setAccessToken(accessToken);
    setRefreshToken(newRefreshToken);
    return { accessToken, refreshToken: newRefreshToken, expiresIn };
  } catch (error) {
    console.error("Token refresh failed:", error);
    clearTokens();
    throw error;
  }
};

// Helper to check if WebAuthn is supported
export const isWebAuthnSupported = () => {
  return typeof window !== 'undefined' && 
         window.PublicKeyCredential !== undefined &&
         typeof window.PublicKeyCredential === 'function';
};

export default authClient;
