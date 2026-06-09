import { useReducer } from 'react';

const initialState = {
  currentRules: '[\n  {\n    "WorkflowName": "SampleWorkflow",\n    "Rules": [\n      {\n        "RuleName": "GiveDiscount",\n        "SuccessEvent": "10",\n        "ErrorMessage": "One or more conditions failed.",\n        "ErrorType": "Error",\n        "RuleExpressionType": "LambdaExpression",\n        "Expression": "input1.country == \\"us\\" AND input1.loyaltyFactor > 2"\n      }\n    ]\n  }\n]',
  currentFacts: '{\n  "input1": {\n    "country": "us",\n    "loyaltyFactor": 3,\n    "totalPurchases": 5000\n  }\n}',
  assertions: [
    { id: '1', path: '[0].IsSuccess', expectedValue: 'true', active: true }
  ],
  testResult: null,
  isMockMode: false,
  settings: {
    ValidationMode: "Default",
    EnableScopedParams: true,
    CustomTypes: [],
    NestedRuleExecutionMode: "All"
  },
  activeScenario: null
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
    case 'SET_SETTINGS':
      return { ...state, settings: { ...state.settings, ...action.payload } };
    case 'SET_ACTIVE_SCENARIO':
      return { ...state, activeScenario: action.payload };
    default:
      return state;
  }
}

export function useRulesState() {
  const [state, dispatch] = useReducer(rulesReducer, initialState);
  return { state, dispatch };
}
