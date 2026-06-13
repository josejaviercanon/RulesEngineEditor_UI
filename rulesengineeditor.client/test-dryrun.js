import axios from 'axios';

const rules = '[\n  {\n    "WorkflowName": "SampleWorkflow",\n    "Rules": [\n      {\n        "RuleName": "GiveDiscount",\n        "SuccessEvent": "10",\n        "ErrorMessage": "One or more conditions failed.",\n        "ErrorType": "Error",\n        "RuleExpressionType": "LambdaExpression",\n        "Expression": "input1.country == \\"us\\" AND input1.loyaltyFactor > 2"\n      }\n    ]\n  }\n]';
const facts = '{\n  "input1": {\n    "country": "us",\n    "loyaltyFactor": 3,\n    "totalPurchases": 5000\n  }\n}';
const settings = '{\n  "ValidationMode": "Default",\n  "EnableScopedParams": true,\n  "NestedRuleExecutionMode": "All",\n  "CustomTypes": []\n}';

axios.post('http://localhost:5064/api/Rules/dry-run', {
  RulesJson: rules,
  FactsJson: facts,
  SettingsJson: settings
}).then(res => console.log(JSON.stringify(res.data, null, 2))).catch(err => console.error(err.response.data));
