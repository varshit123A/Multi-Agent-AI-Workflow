/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type NodeName =
  | 'START'
  | 'Supervisor Node'
  | 'Planner Agent'
  | 'Research Agent'
  | 'Coding Agent'
  | 'Reviewer Agent'
  | 'Evaluation Engine'
  | 'Guardrail Engine'
  | 'Confidence Router'
  | 'END';

export type WorkflowStatus =
  | 'idle'
  | 'running'
  | 'waiting_for_human'
  | 'completed'
  | 'failed'
  | 'rejected';

export interface EvalMetrics {
  faithfulness: number;
  hallucination_score: number;
  relevance: number;
  latency_ms?: number;
  tokens_used?: number;
}

export interface GuardrailFlags {
  clean: boolean;
  pii_detected: boolean;
  pii_masked_text?: string;
  injection_attempt_detected: boolean;
  schema_valid: boolean;
  flags_list: string[];
}

export interface StepTraceLog {
  id: string;
  node: NodeName;
  timestamp: string;
  durationMs: number;
  tokens: number;
  status: 'success' | 'warning' | 'error' | 'running';
  summary: string;
  payload: Record<string, any>;
  guardrails?: GuardrailFlags;
  evalMetrics?: EvalMetrics;
}

/**
 * Core TypedDict state definition as requested in the specification
 */
export interface AgentState {
  id: string;
  status: WorkflowStatus;
  createdAt: string;
  updatedAt: string;
  messages: Array<{
    role: 'user' | 'assistant' | 'system' | 'reviewer';
    content: string;
    timestamp: string;
    node?: NodeName;
  }>;
  task: string;
  plan: string[];
  research_data: {
    summary: string;
    api_docs: Array<{ title: string; url: string; snippet: string }>;
    technical_stack: string[];
  };
  code_output: {
    files: Array<{ filename: string; language: string; content: string }>;
    unit_tests: string;
    api_spec: string;
  };
  review_feedback: {
    security_flags: Array<{
      type: string;
      severity: 'high' | 'medium' | 'low';
      line?: number;
      description: string;
      recommendation: string;
    }>;
    performance_notes: string[];
    owasp_compliant: boolean;
  };
  eval_metrics: EvalMetrics;
  guardrail_flags: GuardrailFlags;
  confidence_score: number;
  requires_human_approval: boolean;
  final_output: string;
  // Execution trace metadata
  activeNode: NodeName;
  stepHistory: StepTraceLog[];
}

export interface HumanReviewActionRequest {
  action: 'approve' | 'reject' | 'regenerate' | 'edit_and_approve';
  notes?: string;
  editedCode?: {
    files: Array<{ filename: string; language: string; content: string }>;
  };
}

export interface GuardrailAuditEntry {
  id: string;
  timestamp: string;
  workflowId?: string;
  source: 'pipeline' | 'sandbox';
  originalText: string;
  processedText: string;
  piiDetected: boolean;
  injectionDetected: boolean;
  schemaValid: boolean;
  violations: string[];
}

export interface PythonFileNode {
  path: string;
  filename: string;
  content: string;
  description: string;
  category: 'api' | 'agents' | 'graph' | 'eval' | 'guardrails' | 'core' | 'docker';
}
