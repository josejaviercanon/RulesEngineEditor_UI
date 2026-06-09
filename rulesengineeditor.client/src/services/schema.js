export const rulesEngineSettingsSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'object',
  properties: {
    CustomTypes: {
      type: 'array',
      items: { type: 'string' },
      description: 'A list of custom classes or utility types to register for rule expressions.'
    },
    EnableExceptionAsErrorMessage: {
      type: 'boolean',
      default: true,
      description: 'When set to true, returns any exception occurred while rule execution as ErrorMessage otherwise throws an exception.'
    },
    IgnoreException: {
      type: 'boolean',
      default: false,
      description: 'When set to true, it will ignore any exception thrown with rule compilation/execution.'
    },
    EnableFormattedErrorMessage: {
      type: 'boolean',
      default: true,
      description: 'Enables ErrorMessage Formatting.'
    },
    EnableScopedParams: {
      type: 'boolean',
      default: true,
      description: 'Enables Global params and local params for rules.'
    },
    IsExpressionCaseSensitive: {
      type: 'boolean',
      default: false,
      description: 'Sets whether expressions are case sensitive.'
    },
    AutoRegisterInputType: {
      type: 'boolean',
      default: true,
      description: 'Auto Registers input type in Custom Type to allow calling method on type.'
    },
    NestedRuleExecutionMode: {
      type: 'string',
      enum: ['All', 'Performance'],
      default: 'All',
      description: 'Sets the mode for Nested rule execution. Performance mode skips nested rules whose execution does not impact parent rule\'s result.'
    },
    UseFastExpressionCompiler: {
      type: 'boolean',
      default: false,
      description: 'Whether to use FastExpressionCompiler for rule compilation.'
    },
    EnableExceptionAsErrorMessageForRuleExpressionParsing: {
      type: 'boolean',
      default: true,
      description: 'Sets the mode for ParsingException to cascade to child elements and result in an expression parser.'
    }
  }
};

export const rulesEngineWorkflowSchema = {
  $schema: 'http://json-schema.org/draft-07/schema#',
  type: 'array',
  description: 'An array of Workflow objects for Microsoft RulesEngine.',
  items: {
    type: 'object',
    required: ['WorkflowName', 'Rules'],
    properties: {
      WorkflowName: { type: 'string', description: 'The unique name of the workflow.' },
      WorkflowsToInject: {
        type: 'array',
        items: { type: 'string' },
        description: 'Other workflows to inject into this workflow context.'
      },
      RuleExpressionType: {
        type: 'string',
        enum: ['LambdaExpression'],
        default: 'LambdaExpression'
      },
      GlobalParams: {
        type: 'array',
        items: { $ref: '#/definitions/ScopedParam' },
        description: 'Global parameters applicable to all rules in this workflow.'
      },
      Rules: {
        type: 'array',
        items: {
          anyOf: [
            { $ref: '#/definitions/Rule' }
          ]
        },
        description: 'The list of rules to evaluate in this workflow.'
      }
    }
  },
  definitions: {
    ScopedParam: {
      type: 'object',
      required: ['Name', 'Expression'],
      properties: {
        Name: { type: 'string' },
        Expression: { type: 'string' }
      }
    },
    ActionInfo: {
      type: 'object',
      required: ['Name'],
      properties: {
        Name: { type: 'string', description: 'The name of the action to execute.' },
        Context: { type: 'object', description: 'Contextual parameters for the action.' }
      },
      oneOf: [
        {
          properties: {
            Name: { const: 'OutputExpression', description: 'Inbuilt action to output an evaluated expression.' },
            Context: {
              type: 'object',
              required: ['Expression'],
              properties: {
                Expression: { type: 'string', description: 'The expression to evaluate and return.' }
              }
            }
          }
        },
        {
          properties: {
            Name: { const: 'EvaluateRule', description: 'Inbuilt action to evaluate another rule.' },
            Context: {
              type: 'object',
              required: ['WorkflowName', 'RuleName'],
              properties: {
                WorkflowName: { type: 'string' },
                RuleName: { type: 'string' }
              }
            }
          }
        },
        {
          properties: {
            Name: { type: 'string', description: 'Custom action name.' },
            Context: { type: 'object' }
          }
        }
      ]
    },
    RuleActions: {
      type: 'object',
      properties: {
        OnSuccess: { $ref: '#/definitions/ActionInfo', description: 'Action to execute on success.' },
        OnFailure: { $ref: '#/definitions/ActionInfo', description: 'Action to execute on failure.' }
      }
    },
    Rule: {
      type: 'object',
      required: ['RuleName'],
      properties: {
        RuleName: { type: 'string' },
        Properties: { type: 'object', description: 'Custom property or tags of the rule.' },
        Operator: {
          type: 'string',
          enum: ['And', 'AndAlso', 'Or', 'OrElse'],
          description: 'The logical operator for combining nested Rules.'
        },
        ErrorMessage: { type: 'string' },
        Enabled: { type: 'boolean', default: true },
        RuleExpressionType: { type: 'string', enum: ['LambdaExpression'], default: 'LambdaExpression' },
        WorkflowsToInject: { type: 'array', items: { type: 'string' } },
        Rules: {
          type: 'array',
          items: { $ref: '#/definitions/Rule' }
        },
        LocalParams: { type: 'array', items: { $ref: '#/definitions/ScopedParam' } },
        Expression: { type: 'string', description: 'The logic expression to evaluate.' },
        Actions: { $ref: '#/definitions/RuleActions' },
        SuccessEvent: { type: 'string' }
      }
    }
  }
};
