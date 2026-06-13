const currentRules = '[\n  {\n    "WorkflowName": "SampleWorkflow",\n    "Rules": [\n      {\n        "RuleName": "GiveDiscount",\n        "SuccessEvent": "10",\n        "ErrorMessage": "One or more conditions failed.",\n        "ErrorType": "Error",\n        "RuleExpressionType": "LambdaExpression",\n        "Expression": "input1.country == \\"us\\" AND input1.loyaltyFactor > 2"\n      }\n    ]\n  }\n]';

fetch('http://localhost:5064/api/Rules', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    WorkflowName: "Test No Version",
    JsonContent: currentRules,
    Status: "Draft"
  })
}).then(async res => {
  console.log("Status:", res.status);
  console.log(await res.text());
}).catch(console.error);