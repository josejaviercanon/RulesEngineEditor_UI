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
const simulateEvaluation = (rulesStr, factsStr) => {
  return new Promise((resolve) => {
    setTimeout(() => {
      console.warn("API Unreachable. Running simulated RulesEngine local evaluation.");
      let rules;
      try {
        rules = JSON.parse(rulesStr);
        if (!Array.isArray(rules)) rules = [rules];
      } catch {
        return resolve({ error: "Invalid Rules JSON" });
      }

      let facts = {};
      try {
        facts = JSON.parse(factsStr);
      } catch {
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
  dryRun: async (rulesJson, factsJson, settingsJson, useBackend = false) => {
    // Parse settings to extract customTypes if present
    let customTypes = null;
    try {
      const settings = JSON.parse(settingsJson || '{}');
      if (settings.CustomTypes && Array.isArray(settings.CustomTypes) && settings.CustomTypes.length > 0) {
        customTypes = settings.CustomTypes;
      }
    } catch { 
      // ignore parse errors
    }

    if (useBackend) {
      try {
        const payload = { rulesJson, factsJson, settingsJson };
        if (customTypes) {
          payload.customTypes = customTypes;
        }
        const response = await client.post('rules/dry-run', payload);
        return { isMock: false, data: response.data };
      } catch (error) {
        console.error("API /rules/dry-run failed:", error);
        // Fallback to local simulation
        return await simulateEvaluation(rulesJson, factsJson, settingsJson);
      }
    } else {
      // Sandbox mode: always use local simulation
      return await simulateEvaluation(rulesJson, factsJson, settingsJson);
    }
  },

  getWorkflows: async () => {
    try {
      const response = await client.get('rules');
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API /rules failed:", error);
      const stored = localStorage.getItem('mockWorkflows');
      return { isMock: true, data: stored ? JSON.parse(stored) : [] };
    }
  },

  getWorkflow: async (id) => {
    try {
      const response = await client.get(`rules/${id}`);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error(`API GET /rules/${id} failed:`, error);
      const stored = JSON.parse(localStorage.getItem('mockWorkflows') || '[]');
      const wf = stored.find(w => w.WorkflowDefinitionId === id || w.WorkflowDefinitionId === Number(id));
      return { isMock: true, data: wf || null };
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

  updateWorkflow: async (id, workflowDef) => {
    try {
      const response = await client.put(`rules/${id}`, workflowDef);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error(`API PUT /rules/${id} failed:`, error);
      const stored = JSON.parse(localStorage.getItem('mockWorkflows') || '[]');
      const idx = stored.findIndex(w => w.WorkflowDefinitionId === id || w.WorkflowDefinitionId === Number(id));
      if (idx >= 0) {
        stored[idx] = { ...stored[idx], ...workflowDef, WorkflowDefinitionId: stored[idx].WorkflowDefinitionId };
        localStorage.setItem('mockWorkflows', JSON.stringify(stored));
        return { isMock: true, data: stored[idx] };
      }
      return { isMock: true, data: null };
    }
  },

  deleteWorkflow: async (id) => {
    try {
      const response = await client.delete(`rules/${id}`);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error(`API DELETE /rules/${id} failed:`, error);
      const stored = JSON.parse(localStorage.getItem('mockWorkflows') || '[]');
      const filtered = stored.filter(w => w.WorkflowDefinitionId !== id && w.WorkflowDefinitionId !== Number(id));
      localStorage.setItem('mockWorkflows', JSON.stringify(filtered));
      return { isMock: true, data: { success: true } };
    }
  },

  getScenarios: async (workflowId) => {
    try {
      const response = await client.get('scenarios', { params: { workflowId } });
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error("API GET /scenarios failed:", error);
      const stored = JSON.parse(localStorage.getItem('mockScenarios') || '[]');
      const filtered = workflowId ? stored.filter(s => s.WorkflowDefinitionId === workflowId || s.WorkflowDefinitionId === Number(workflowId)) : stored;
      return { isMock: true, data: filtered };
    }
  },

  getScenario: async (id) => {
    try {
      const response = await client.get(`scenarios/${id}`);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error(`API GET /scenarios/${id} failed:`, error);
      const stored = JSON.parse(localStorage.getItem('mockScenarios') || '[]');
      const sc = stored.find(s => s.ScenarioId === id || s.ScenarioId === Number(id));
      return { isMock: true, data: sc || null };
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
  },

  updateScenario: async (id, scenario) => {
    try {
      const response = await client.put(`scenarios/${id}`, scenario);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error(`API PUT /scenarios/${id} failed:`, error);
      const stored = JSON.parse(localStorage.getItem('mockScenarios') || '[]');
      const idx = stored.findIndex(s => s.ScenarioId === id || s.ScenarioId === Number(id));
      if (idx >= 0) {
        stored[idx] = { ...stored[idx], ...scenario, ScenarioId: stored[idx].ScenarioId };
        localStorage.setItem('mockScenarios', JSON.stringify(stored));
        return { isMock: true, data: stored[idx] };
      }
      return { isMock: true, data: null };
    }
  },

  deleteScenario: async (id) => {
    try {
      const response = await client.delete(`scenarios/${id}`);
      return { isMock: false, data: response.data };
    } catch (error) {
      console.error(`API DELETE /scenarios/${id} failed:`, error);
      const stored = JSON.parse(localStorage.getItem('mockScenarios') || '[]');
      const filtered = stored.filter(s => s.ScenarioId !== id && s.ScenarioId !== Number(id));
      localStorage.setItem('mockScenarios', JSON.stringify(filtered));
      return { isMock: true, data: { success: true } };
    }
  }
};


