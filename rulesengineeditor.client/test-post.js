const currentFacts = '{\n  "input1": {\n    "country": "us",\n    "loyaltyFactor": 3,\n    "totalPurchases": 5000\n  }\n}';
fetch('http://localhost:5064/api/Rules/scenarios', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    WorkflowDefinitionId: 96,
    ScenarioName: "Test Scenario",
    MockInputJson: currentFacts,
    ExpectedOutputJson: "[]"
  })
}).then(res => res.json()).then(data => console.log(data)).catch(console.error);