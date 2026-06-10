import { createContext, useReducer, useEffect, useCallback } from 'react';
import { authClient, getAccessToken, isWebAuthnSupported } from '../services/authClient';
import { startAuthentication, startRegistration } from '@simplewebauthn/browser';

// Auth state shape
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  isDevAutoLogin: false
};

function authReducer(state, action) {
  switch (action.type) {
    case 'AUTH_START':
      return { ...state, isLoading: true, error: null };
    case 'AUTH_SUCCESS':
      return {
        ...state,
        user: action.payload.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        isDevAutoLogin: action.payload.isDevAutoLogin || false
      };
    case 'AUTH_FAILURE':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload.error,
        isDevAutoLogin: false
      };
    case 'AUTH_LOGOUT':
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
        isDevAutoLogin: false
      };
    case 'AUTH_LOADING':
      return { ...state, isLoading: true };
    case 'CLEAR_ERROR':
      return { ...state, error: null };
    default:
      return state;
  }
}

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Helper to set auth success
  const setAuthSuccess = useCallback((userData, isDevAutoLogin = false) => {
    dispatch({
      type: 'AUTH_SUCCESS',
      payload: { user: userData, isDevAutoLogin }
    });
  }, []);

  // Login with email/password
  const login = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authClient.login(email, password);
      const userInfo = await authClient.getCurrentUser();
      // For dev auto-login, hardcode Administrator role
      const userWithRoles = {
        ...userInfo,
        roles: email === 'admin@localhost.local' ? ['Administrator'] : (userInfo.roles || [])
      };
      setAuthSuccess(userWithRoles);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, [setAuthSuccess]);

  // Login with Passkey (WebAuthn)
  const loginWithPasskey = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    dispatch({ type: 'AUTH_START' });
    try {
      // Get challenge from server
      const options = await authClient.getPasskeyLoginOptions();
      
      // Start WebAuthn authentication
      const assertion = await startAuthentication({ optionsJSON: options });
      
      // Verify with server
      const result = await authClient.verifyPasskeyLogin(assertion);
      
      if (result.accessToken) {
        const userInfo = await authClient.getCurrentUser();
        setAuthSuccess(userInfo);
        return { success: true };
      } else {
        throw new Error('Passkey verification failed');
      }
    } catch (error) {
      // Handle user cancellation gracefully
      if (error.name === 'NotAllowedError') {
        dispatch({ type: 'AUTH_FAILURE', payload: { error: 'Passkey authentication cancelled' } });
        return { success: false, error: 'Passkey authentication cancelled' };
      }
      
      const errorMessage = error.message || 'Passkey login failed';
      dispatch({ type: 'AUTH_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, [setAuthSuccess]);

  // Register Passkey (admin-only)
  const registerPasskey = useCallback(async () => {
    if (!isWebAuthnSupported()) {
      return { success: false, error: 'WebAuthn is not supported in this browser' };
    }

    try {
      // Get creation options from server
      const options = await authClient.getPasskeyRegisterOptions();
      
      // Start WebAuthn registration
      const attestation = await startRegistration({ optionsJSON: options });
      
      // Verify with server
      await authClient.verifyPasskeyRegister(attestation);
      
      return { success: true };
    } catch (error) {
      if (error.name === 'NotAllowedError') {
        return { success: false, error: 'Passkey registration cancelled' };
      }
      return { success: false, error: error.message || 'Passkey registration failed' };
    }
  }, []);

  // Register with email/password
  const register = useCallback(async (email, password) => {
    dispatch({ type: 'AUTH_START' });
    try {
      await authClient.register(email, password);
      const userInfo = await authClient.getCurrentUser();
      setAuthSuccess(userInfo);
      return { success: true };
    } catch (error) {
      const errorMessage = error.response?.data?.detail || error.message || 'Registration failed';
      dispatch({ type: 'AUTH_FAILURE', payload: { error: errorMessage } });
      return { success: false, error: errorMessage };
    }
  }, [setAuthSuccess]);

  // Logout
  const logout = useCallback(async () => {
    try {
      await authClient.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      dispatch({ type: 'AUTH_LOGOUT' });
    }
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    dispatch({ type: 'CLEAR_ERROR' });
  }, []);

  // Dev auto-login
  const performDevAutoLogin = useCallback(async () => {
    if (!import.meta.env.DEV) return false;
    
    try {
      const result = await login('admin@localhost.local', 'Admin@123456');
      if (result.success) {
        // Mark as dev auto-login and ensure admin role
        dispatch({
          type: 'AUTH_SUCCESS',
          payload: {
            user: {
              email: 'admin@localhost.local',
              isEmailConfirmed: true,
              roles: ['Administrator']
            },
            isDevAutoLogin: true
          }
        });
        return true;
      }
    } catch (error) {
      console.warn('Dev auto-login failed:', error);
    }
    return false;
  }, [login]);

  // Initial session check and dev auto-login
  useEffect(() => {
    const initAuth = async () => {
      // Try dev auto-login first
      const devAutoLoginSuccess = await performDevAutoLogin();
      if (devAutoLoginSuccess) return;

      // Check for existing session
      const token = getAccessToken();
      if (token) {
        try {
          const userInfo = await authClient.getCurrentUser();
          setAuthSuccess(userInfo);
        } catch {
          // Token is invalid or expired
          dispatch({
            type: 'AUTH_FAILURE',
            payload: { error: null }
          });
        }
      } else {
        dispatch({
          type: 'AUTH_FAILURE',
          payload: { error: null }
        });
      }
    };

    initAuth();
  }, [performDevAutoLogin, setAuthSuccess]);

  const value = {
    user: state.user,
    isAuthenticated: state.isAuthenticated,
    isLoading: state.isLoading,
    error: state.error,
    isDevAutoLogin: state.isDevAutoLogin,
    login,
    loginWithPasskey,
    registerPasskey,
    register,
    logout,
    clearError
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export default AuthContext;
