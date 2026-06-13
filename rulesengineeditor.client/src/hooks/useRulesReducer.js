import { useReducer } from 'react';

const emptyRules = '[]';
const emptyFacts = '{}';
const defaultSettings = '{\n  "ValidationMode": "Default",\n  "EnableScopedParams": true,\n  "NestedRuleExecutionMode": "All",\n  "CustomTypes": []\n}';

const initialState = {
  currentRules: emptyRules,
  currentFacts: emptyFacts,
  assertions: [],
  testResult: null,
  isMockMode: false,
  currentSettings: defaultSettings,
  activeScenario: null,
  currentWorkflowId: null,
  currentScenarioId: null,
  onlineMode: false
};

function rulesReducer(state, action) {
  switch (action.type) {
    case 'SET_RULES':
      return { ...state, currentRules: action.payload };
    case 'SET_FACTS':
      return { ...state, currentFacts: action.payload };
    case 'SET_TEST_RESULT':
      return { ...state, testResult: action.payload.data, isMockMode: action.payload.isMock };
    case 'ADD_ASSERTION':
      return { ...state, assertions: [...state.assertions, action.payload] };
    case 'REMOVE_ASSERTION':
      return { ...state, assertions: state.assertions.filter(a => a.id !== action.payload) };
    case 'UPDATE_ASSERTION':
      return {
        ...state,
        assertions: state.assertions.map(a => 
          a.id === action.payload.id ? { ...a, ...action.payload.updates } : a
        )
      };
    case 'SET_SETTINGS_JSON':
      return { ...state, currentSettings: action.payload };
    case 'SET_SETTINGS': {
      let current = {};
      try { current = JSON.parse(state.currentSettings); } catch { /* ignore parse error */ }
      current = { ...current, ...action.payload };
      return { ...state, currentSettings: JSON.stringify(current, null, 2) };
    }
    case 'SET_ACTIVE_SCENARIO':
      return { ...state, activeScenario: action.payload };
    case 'SET_WORKFLOW':
      return { 
        ...state, 
        currentWorkflowId: action.payload.id,
        currentRules: action.payload.rulesJson || state.currentRules
      };
    case 'SET_SCENARIO':
      return { 
        ...state, 
        currentScenarioId: action.payload.id,
        currentFacts: action.payload.factsJson || state.currentFacts,
        activeScenario: action.payload.scenario || null
      };
    case 'CLEAR_WORKFLOW':
      return { ...state, currentWorkflowId: null };
    case 'CLEAR_SCENARIO':
      return {
        ...state,
        currentScenarioId: null,
        activeScenario: null,
        currentFacts: emptyFacts,
        assertions: []
      };
    case 'LOAD_DEFAULT_TEMPLATE': {
      const name = action.payload || 'NewWorkflow';
      const template = JSON.stringify([{
        WorkflowName: name,
        Rules: [{
          RuleName: 'DefaultRule',
          SuccessEvent: '10',
          ErrorMessage: 'One or more conditions failed.',
          ErrorType: 'Error',
          RuleExpressionType: 'LambdaExpression',
          Expression: 'input1 == true'
        }]
      }], null, 2);
      return {
        ...state,
        currentRules: template,
        currentWorkflowId: null,
        currentScenarioId: null,
        activeScenario: null,
        currentFacts: emptyFacts,
        assertions: []
      };
    }
    case 'SET_ONLINE_MODE':
      return { ...state, onlineMode: action.payload };
    case 'CLEAR_ASSERTIONS':
      return { ...state, assertions: [] };
    case 'REPLACE_ASSERTIONS':
      return { ...state, assertions: action.payload || [] };
    default:
      return state;
  }
}

export function useRulesState() {
  const [state, dispatch] = useReducer(rulesReducer, initialState);
  return { state, dispatch };
}
