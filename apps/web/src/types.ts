export type PRStatus = 'OPEN' | 'APPROVED' | 'REJECTED';
export type Decision = 'APPROVE' | 'REJECT' | 'NEEDS_INFO';

export type PRItem = { sku: string; qty: number; price: number };

export type PurchaseRequest = {
  id: string;
  requester: string;
  costCenter: string;
  total: number;
  status: PRStatus;
  items: PRItem[] | any;
  createdAt: string;
  updatedAt: string;
};

export type AssessmentTrace = {
  tool: string;
  args: Record<string, any>;
  result: Record<string, any>;
};

export type Assessment = {
  id: string;
  prId: string;
  decision: Decision;
  reason: string;
  traceJson?: string;
  createdAt: string;
};
