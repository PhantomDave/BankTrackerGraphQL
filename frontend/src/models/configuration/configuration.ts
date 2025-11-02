export interface RuleValue {
  id: number;
  configurationId: number;
  name: string;
  value: number;
}

export interface Configuration {
  id: number;
  accountId: number;
  ruleName: string;
  ruleValues?: RuleValue[];
}
