/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  Sparkles,
  FileCode2,
  BookOpen,
  AlertTriangle,
  Cpu,
  Layers,
  ArrowRight,
  RefreshCw,
} from 'lucide-react';
import { AgentState, NodeName } from '../types';

interface AgentMonitorProps {
  workflow: AgentState | null;
  onStartWorkflow: (task: string, forceHuman: boolean, simPii: boolean, simInjection: boolean) => void;
  isStreaming: boolean;
  onOpenHumanReview: () => void;
}

interface NodeDefinition {
  name: NodeName;
  label: string;
  category: 'core' | 'agent' | 'eval' | 'guardrail' | 'router';
  description: string;
}

const LANGGRAPH_NODES: NodeDefinition[] = [
  { name: 'START', label: 'START', category: 'core', description: 'State initialization' },
  { name: 'Supervisor Node', label: 'Supervisor Node', category: 'agent', description: 'Analyzes task & orchestrates flow' },
  { name: 'Planner Agent', label: 'Planner Agent', category: 'agent', description: 'Decomposes task into structured steps' },
  { name: 'Research Agent', label: 'Research Agent', category: 'agent', description: 'Extracts technical docs & stack refs' },
  { name: 'Coding Agent', label: 'Coding Agent', category: 'agent', description: 'Generates modular FastAPI code & tests' },
  { name: 'Reviewer Agent', label: 'Reviewer Agent', category: 'agent', description: 'OWASP Top 10 security & static audit' },
  { name: 'Evaluation Engine', label: 'Evaluation Engine', category: 'eval', description: 'Ragas quality (Faithfulness, Hallucination)' },
  { name: 'Guardrail Engine', label: 'Guardrail Engine', category: 'guardrail', description: 'PII masking, injection check & schema' },
  { name: 'Confidence Router', label: 'Confidence Router', category: 'router', description: 'Human-in-the-Loop conditional router' },
  { name: 'END', label: 'END / Final Response', category: 'core', description: 'Sanitized enterprise output' },
];

const PRESET_TASKS = [
  {
    title: 'OAuth2 Payment Microservice',
    task: 'Build an OAuth2-secured payment microservice in Python FastAPI with Stripe webhook handling and Async SQLAlchemy 2.0 PostgreSQL persistence.',
  },
  {
    title: 'PII-Sensitive ETL Pipeline',
    task: 'Generate a secure PII data pipeline in FastAPI that ingests customer records, redacts Email & SSN, and loads into PostgreSQL with audit logs.',
  },
  {
    title: 'OWASP-Compliant Auth Microservice',
    task: 'Implement a zero-trust authentication microservice using Python 3.11, PyJWT OAuth2 bearer tokens, refresh token rotation, and SQL injection prevention.',
  },
];

export const AgentMonitor: React.FC<AgentMonitorProps> = ({
  workflow,
  onStartWorkflow,
  isStreaming,
  onOpenHumanReview,
}) => {
  const [taskInput, setTaskInput] = useState<string>(PRESET_TASKS[0].task);
  const [forceHuman, setForceHuman] = useState<boolean>(false);
  const [simPii, setSimPii] = useState<boolean>(false);
  const [simInjection, setSimInjection] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<NodeName | null>(null);

  const activeNode = workflow?.activeNode || 'START';
  const status = workflow?.status || 'idle';

  // Determine node visual state
  const getNodeState = (nodeName: NodeName) => {
    if (!workflow) return 'default';
    if (workflow.activeNode === nodeName && isStreaming) return 'active';
    
    const indexOrder = LANGGRAPH_NODES.map((n) => n.name);
    const currentIndex = indexOrder.indexOf(workflow.activeNode);
    const nodeIndex = indexOrder.indexOf(nodeName);

    if (workflow.status === 'waiting_for_human' && nodeName === 'Confidence Router') {
      return 'paused_human';
    }
    if (workflow.status === 'completed' || (nodeIndex <= currentIndex && currentIndex !== -1)) {
      return 'completed';
    }
    return 'default';
  };

  return (
    <div className="space-y-6">
      {/* Top Banner: Workflow Launch Form */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-lg font-bold text-white flex items-center space-x-2">
              <Layers className="w-5 h-5 text-indigo-400" />
              <span>LangGraph StateGraph Orchestrator</span>
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              Trigger automated multi-agent code synthesis, OWASP security audit, Ragas evaluation, and PII guardrails.
            </p>
          </div>

          {/* Preset buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Presets:</span>
            {PRESET_TASKS.map((preset, idx) => (
              <button
                key={idx}
                onClick={() => setTaskInput(preset.task)}
                className="px-2.5 py-1 text-xs rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
              >
                {preset.title}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <textarea
            value={taskInput}
            onChange={(e) => setTaskInput(e.target.value)}
            rows={2}
            placeholder="Describe your enterprise system architecture or microservice requirement..."
            className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40"
          />

          {/* Simulation & Guardrail check toggles */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-2 border-t border-slate-800/80">
            <div className="flex flex-wrap items-center gap-4 text-xs">
              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={simPii}
                  onChange={(e) => setSimPii(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
                <span>Test PII Redaction (Add sample Email/SSN)</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-slate-300 hover:text-white">
                <input
                  type="checkbox"
                  checked={simInjection}
                  onChange={(e) => setSimInjection(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
                <span>Test Prompt Injection Defense</span>
              </label>

              <label className="flex items-center space-x-2 cursor-pointer text-amber-300 hover:text-amber-200">
                <input
                  type="checkbox"
                  checked={forceHuman}
                  onChange={(e) => setForceHuman(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-amber-500 focus:ring-0"
                />
                <span>Force Human-in-the-Loop Pause (&lt; 0.90 confidence)</span>
              </label>
            </div>

            <button
              onClick={() => onStartWorkflow(taskInput, forceHuman, simPii, simInjection)}
              disabled={isStreaming}
              className={`flex items-center space-x-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-lg ${
                isStreaming
                  ? 'bg-indigo-600/50 text-indigo-200 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white shadow-indigo-500/20'
              }`}
            >
              {isStreaming ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Orchestrating...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  <span>Execute StateGraph</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Centerpiece: State Graph Diagram (LangGraph Topology) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-purple-400" />
              <span>LangGraph Directed StateGraph Topology</span>
            </h3>
            <p className="text-xs text-slate-400">
              Click any node to inspect its internal TypedDict state (`AgentState`)
            </p>
          </div>

          {workflow && (
            <div className="flex items-center space-x-4">
              <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                Confidence: <strong className="text-emerald-400 font-mono">{(workflow.confidence_score * 100).toFixed(0)}%</strong>
              </div>
              <div className="px-3 py-1 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
                Status: <strong className="uppercase text-indigo-300 font-mono">{workflow.status}</strong>
              </div>
            </div>
          )}
        </div>

        {/* Directed Node Flow */}
        <div className="relative overflow-x-auto pb-6">
          <div className="flex items-center space-x-3 min-w-max px-2">
            {LANGGRAPH_NODES.map((node, index) => {
              const state = getNodeState(node.name);
              const isSelected = selectedNode === node.name;

              let badgeStyle = 'bg-slate-800/90 border-slate-700 text-slate-400';
              if (state === 'active') {
                badgeStyle =
                  'bg-indigo-600/20 border-indigo-500 text-indigo-300 shadow-lg shadow-indigo-500/20 animate-pulse ring-2 ring-indigo-500/50';
              } else if (state === 'completed') {
                badgeStyle = 'bg-emerald-950/40 border-emerald-500/60 text-emerald-300';
              } else if (state === 'paused_human') {
                badgeStyle =
                  'bg-amber-950/60 border-amber-500 text-amber-300 ring-2 ring-amber-500/60 animate-bounce';
              }

              return (
                <React.Fragment key={node.name}>
                  <button
                    onClick={() => setSelectedNode(node.name)}
                    className={`flex flex-col items-start p-3.5 rounded-xl border text-left transition-all min-w-[150px] max-w-[170px] ${badgeStyle} ${
                      isSelected ? 'ring-2 ring-purple-400/80' : ''
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                        {node.category}
                      </span>
                      {state === 'completed' && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                      {state === 'active' && <Clock className="w-3.5 h-3.5 text-indigo-400 animate-spin" />}
                      {state === 'paused_human' && <UserCheck className="w-3.5 h-3.5 text-amber-400" />}
                    </div>
                    <span className="text-xs font-bold truncate w-full text-slate-200">
                      {node.label}
                    </span>
                    <span className="text-[10px] text-slate-400 truncate w-full mt-0.5">
                      {node.description}
                    </span>
                  </button>

                  {index < LANGGRAPH_NODES.length - 1 && (
                    <div className="flex items-center text-slate-600 px-0.5">
                      <ArrowRight className="w-4 h-4" />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>

        {/* Human Approval Alert Banner if paused */}
        {workflow?.status === 'waiting_for_human' && (
          <div className="mt-4 bg-amber-950/40 border border-amber-500/50 rounded-xl p-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <div>
                <h4 className="text-sm font-bold text-amber-200">
                  Confidence Score ({workflow.confidence_score}) &lt; 0.90 or Security Policy Flagged
                </h4>
                <p className="text-xs text-amber-300/80">
                  StateGraph execution paused at the Confidence Router. A human reviewer must approve or reject before routing to END.
                </p>
              </div>
            </div>
            <button
              onClick={onOpenHumanReview}
              className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg shadow-lg transition-colors"
            >
              Open Human Review Drawer
            </button>
          </div>
        )}
      </div>

      {/* Selected Node Drawer / Inspector */}
      {selectedNode && workflow && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Node Inspector
              </span>
              <h4 className="text-base font-bold text-white">{selectedNode}</h4>
            </div>
            <button
              onClick={() => setSelectedNode(null)}
              className="text-xs text-slate-400 hover:text-slate-200"
            >
              Close Drawer ✕
            </button>
          </div>

          {/* Render payload details relevant to the node */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left Column: Messages / Context */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Node Messages & Context
              </h5>
              <div className="space-y-2 max-h-60 overflow-y-auto pr-2">
                {workflow.messages
                  .filter((m) => !m.node || m.node === selectedNode || selectedNode === 'END')
                  .map((msg, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded-lg bg-slate-900 border border-slate-800 text-xs space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-indigo-400 uppercase text-[10px]">
                          [{msg.role}] {msg.node || ''}
                        </span>
                        <span className="text-slate-500 text-[10px]">
                          {new Date(msg.timestamp).toLocaleTimeString()}
                        </span>
                      </div>
                      <p className="text-slate-300 font-mono text-[11px] whitespace-pre-wrap">
                        {msg.content}
                      </p>
                    </div>
                  ))}
              </div>
            </div>

            {/* Right Column: Node Specific Payload */}
            <div className="bg-slate-950/80 rounded-xl p-4 border border-slate-800/80 space-y-3">
              <h5 className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                Structured State Output (`AgentState`)
              </h5>

              {selectedNode === 'Planner Agent' && (
                <div className="space-y-1.5">
                  <span className="text-xs text-slate-400">Generated Execution Plan:</span>
                  <ul className="space-y-1.5 text-xs text-slate-200">
                    {workflow.plan.map((step, idx) => (
                      <li
                        key={idx}
                        className="p-2 rounded bg-slate-900 border border-slate-800 font-mono"
                      >
                        {step}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode === 'Research Agent' && (
                <div className="space-y-2 text-xs">
                  <div className="p-2 rounded bg-slate-900 border border-slate-800 text-slate-300">
                    <strong>Summary:</strong> {workflow.research_data.summary}
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {workflow.research_data.technical_stack.map((tech, i) => (
                      <span
                        key={i}
                        className="px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-[11px]"
                      >
                        {tech}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {selectedNode === 'Coding Agent' && (
                <div className="space-y-2 text-xs">
                  <span className="text-slate-400">
                    Generated Files ({workflow.code_output.files.length}):
                  </span>
                  {workflow.code_output.files.map((file, i) => (
                    <div
                      key={i}
                      className="p-2.5 rounded bg-slate-900 border border-slate-800 space-y-1"
                    >
                      <div className="font-mono text-emerald-400 font-semibold">
                        {file.filename}
                      </div>
                      <pre className="text-[10px] text-slate-300 overflow-x-auto max-h-32 p-1 bg-slate-950 rounded">
                        {file.content}
                      </pre>
                    </div>
                  ))}
                </div>
              )}

              {selectedNode === 'Reviewer Agent' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center space-x-2">
                    <span className="text-slate-400">OWASP Top 10 Compliant:</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold">
                      {workflow.review_feedback.owasp_compliant ? 'TRUE (0 Vulnerabilities)' : 'FALSE'}
                    </span>
                  </div>
                  <ul className="space-y-1">
                    {workflow.review_feedback.performance_notes.map((note, i) => (
                      <li key={i} className="text-slate-300 font-mono text-[11px]">
                        • {note}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {selectedNode === 'Evaluation Engine' && (
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Faithfulness</span>
                    <div className="text-base font-bold text-emerald-400">
                      {((workflow.eval_metrics?.faithfulness || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Hallucination</span>
                    <div className="text-base font-bold text-indigo-400">
                      {((workflow.eval_metrics?.hallucination_score || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
                    <span className="text-[10px] text-slate-400">Relevance</span>
                    <div className="text-base font-bold text-purple-400">
                      {((workflow.eval_metrics?.relevance || 0) * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              )}

              {selectedNode === 'Guardrail Engine' && (
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2 rounded bg-slate-900 border border-slate-800">
                    <span className="text-slate-400">Safety Check Status:</span>
                    <span
                      className={`font-bold ${
                        workflow.guardrail_flags.clean ? 'text-emerald-400' : 'text-red-400'
                      }`}
                    >
                      {workflow.guardrail_flags.clean ? 'CLEAN (PASSED)' : 'SECURITY FLAG DETECTED'}
                    </span>
                  </div>
                  {workflow.guardrail_flags.flags_list.map((flag, i) => (
                    <div
                      key={i}
                      className="p-2 rounded bg-amber-950/30 border border-amber-500/40 text-amber-200 text-[11px]"
                    >
                      • {flag}
                    </div>
                  ))}
                </div>
              )}

              {(selectedNode === 'START' ||
                selectedNode === 'Supervisor Node' ||
                selectedNode === 'END' ||
                selectedNode === 'Confidence Router') && (
                <div className="text-xs text-slate-400 space-y-2">
                  <p>
                    <strong>Node:</strong> {selectedNode}
                  </p>
                  <p>
                    <strong>Confidence Score:</strong> {workflow.confidence_score}
                  </p>
                  <p>
                    <strong>Requires Human Approval:</strong>{' '}
                    {workflow.requires_human_approval ? 'Yes (Paused)' : 'No (Auto-Routed)'}
                  </p>
                  {workflow.final_output && (
                    <div className="p-3 rounded bg-slate-900 border border-slate-800 text-slate-200 font-mono whitespace-pre-wrap">
                      {workflow.final_output}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Code Viewer Preview Section if Workflow has generated code */}
      {workflow && workflow.code_output?.files?.length > 0 && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <FileCode2 className="w-5 h-5 text-emerald-400" />
              <span>Generated Production Code & OpenAPI Specification</span>
            </h3>
            <span className="text-xs text-slate-400">
              {workflow.code_output.files.length} modules synthesized
            </span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {workflow.code_output.files.map((file, idx) => (
              <div
                key={idx}
                className="bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden flex flex-col"
              >
                <div className="px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 flex items-center justify-between">
                  <span className="font-mono text-xs font-semibold text-emerald-300">
                    {file.filename}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-400">
                    {file.language}
                  </span>
                </div>
                <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-72">
                  {file.content}
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
