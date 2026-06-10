import axios from 'axios';
import { getAccessToken, refreshToken, clearTokens } from './authClient';

// The base client, relative URL. Proxied by Vite config if backend is available.
// Real backend: https://localhost:7119/api/
// OpenAPI spec: Api/v1.yaml (in project root) or https://localhost:7119/scalar/
const client = axios.create({
  baseURL: '/',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor: attach Bearer token
client.interceptors.request.use(
  (config) => {
    const token = getAccessToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: handle 401 and attempt token refresh
let isRefreshing = false;
let refreshSubscribers = [];

function onRefreshed(newToken) {
  refreshSubscribers.forEach((callback) => callback(newToken));
  refreshSubscribers = [];
}

function addRefreshSubscriber(callback) {
  refreshSubscribers.push(callback);
}

client.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying
    if (error.response?.status === 401 && !originalRequest._retry) {
      if (isRefreshing) {
        // Wait for refresh to complete
        return new Promise((resolve) => {
          addRefreshSubscriber((newToken) => {
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            resolve(client(originalRequest));
          });
        });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const result = await refreshToken();
        const newToken = result.accessToken;
        isRefreshing = false;
        onRefreshed(newToken);
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return client(originalRequest);
      } catch (refreshError) {
        isRefreshing = false;
        refreshSubscribers = [];
        clearTokens();
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Mock simulation of RuleResultTree structure based on Microsoft.RulesEngine
const simulateEvaluation = (rulesStr, factsStr, settingsStr) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.warn("API Unreachable. Running simulated RulesEngine local evaluation.");
      let rules = [];
      try {
        rules = JSON.parse(rulesStr);
        if (!Array.isArray(rules)) rules = [rules];
      } catch (e) {
        return resolve({ error: "Invalid Rules JSON" });
      }

      let facts = {};
      try {
        facts = JSON.parse(factsStr);
      } catch (e) {
        return resolve({ error: "Invalid Facts JSON" });
      }

      // Generate a mock RuleResultTree based on the input workflows
      const tree = rules.map(workflow => ({
        Rule: { RuleName: workflow.WorkflowName || "UnknownWorkflow" },
        IsSuccess: true, // Mock logic: assume success for demo
        ChildResults: (workflow.Rules || []).map(r => ({
          Rule: { RuleName: r.RuleName || "UnnamedRule" },
          IsSuccess: true,
          ExceptionMessage: null,
          Inputs: facts
        }))
      }));

      resolve({ isMock: true, data: tree });
    }, 500);
  });
};

export const rulesApi = {
  dryRun: async (rulesJson, factsJson, settingsJson) => {
    try {
      // Expecting { rulesJson, factsJson, settingsJson } as string properties
      const response = await client.post('rules/dry-run', {
        rulesJson,
        factsJson,
        settingsJson
      });
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API /rules/dry-run failed:", error);
      // Fallback to local simulation
      return await simulateEvaluation(rulesJson, factsJson, settingsJson);
    }
  },

  getWorkflows: async () => {
    try {
      const response = await client.get('rules');
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API /rules failed:", error);
      // Fallback to localStorage mock
      const stored = localStorage.getItem('mockWorkflows');
      return { isMock: true, data: stored ? JSON.parse(stored) : [] };
    }
  },

  saveWorkflow: async (workflowDef) => {
    try {
      const response = await client.post('rules', workflowDef);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API POST /rules failed:", error);
      const stored = JSON.parse(localStorage.getItem('mockWorkflows') || '[]');
      const newDef = { ...workflowDef, WorkflowDefinitionId: Date.now() };
      stored.push(newDef);
      localStorage.setItem('mockWorkflows', JSON.stringify(stored));
      return { isMock: true, data: newDef };
    }
  },

  getScenarios: async (workflowId) => {
    try {
      // In a real API, might be /rules/{workflowId}/scenarios
      const response = await client.get('scenarios', { params: { workflowId } });
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API GET /scenarios failed:", error);
      const stored = JSON.parse(localStorage.getItem('mockScenarios') || '[]');
      const filtered = workflowId ? stored.filter(s => s.WorkflowDefinitionId === workflowId) : stored;
      return { isMock: true, data: filtered };
    }
  },

  saveScenario: async (scenario) => {
    try {
      const response = await client.post('scenarios', scenario);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API POST /scenarios failed:", error);
      const stored = JSON.parse(localStorage.getItem('mockScenarios') || '[]');
      const newScenario = { ...scenario, ScenarioId: Date.now() };
      stored.push(newScenario);
      localStorage.setItem('mockScenarios', JSON.stringify(stored));
      return { isMock: true, data: newScenario };
    }
  }
};
