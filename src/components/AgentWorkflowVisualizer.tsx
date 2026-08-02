/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Cpu,
  Terminal as TerminalIcon,
  ShieldAlert,
  ArrowRight,
  UserCheck,
  Zap,
  Activity,
  FileCode,
  Layers,
  ChevronRight,
  Search,
  Code2,
  FileCheck,
  BarChart2,
  ShieldCheck,
  GitCommit,
} from 'lucide-react';
import { AgentState, NodeName, StepTraceLog } from '../types';

interface AgentWorkflowVisualizerProps {
  workflow: AgentState | null;
  onStartWorkflow: (
    task: string,
    forceHuman: boolean,
    simPii: boolean,
    simInjection: boolean
  ) => void;
  isStreaming: boolean;
  onOpenHumanReview: () => void;
}

export const AgentWorkflowVisualizer: React.FC<AgentWorkflowVisualizerProps> = ({
  workflow,
  onStartWorkflow,
  isStreaming,
  onOpenHumanReview,
}) => {
  const [taskInput, setTaskInput] = useState<string>(
    workflow?.task ||
      'Build a secure Python FastAPI microservice for customer billing with PostgreSQL, JWT authentication, and OpenTelemetry tracing.'
  );
  const [forceHumanReview, setForceHumanReview] = useState<boolean>(true);
  const [simulatePii, setSimulatePii] = useState<boolean>(true);
  const [simulateInjection, setSimulateInjection] = useState<boolean>(false);
  const [selectedNode, setSelectedNode] = useState<NodeName | null>('Supervisor Node');
  const [activeTab, setActiveTab] = useState<'terminal' | 'inspector' | 'code'>('terminal');

  // Ordered LangGraph Node sequence requested in prompt (No Purple/Indigo theme!)
  const pipelineNodes: Array<{
    id: NodeName;
    label: string;
    description: string;
    icon: React.ElementType;
    color: string;
    bgColor: string;
  }> = [
    {
      id: 'Supervisor Node',
      label: 'Supervisor',
      description: 'Task Orchestrator & State Manager',
      icon: Cpu,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'Planner Agent',
      label: 'Planner',
      description: 'Deconstructs into DAG Execution Plan',
      icon: Layers,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10 border-sky-500/30',
    },
    {
      id: 'Research Agent',
      label: 'Research',
      description: 'Retrieves API Docs & Libraries',
      icon: Search,
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10 border-teal-500/30',
    },
    {
      id: 'Coding Agent',
      label: 'Coding',
      description: 'Synthesizes Full-Stack Source & Tests',
      icon: Code2,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'Reviewer Agent',
      label: 'Reviewer',
      description: 'OWASP & Static Analysis Checker',
      icon: FileCheck,
      color: 'text-cyan-300',
      bgColor: 'bg-cyan-500/10 border-cyan-500/30',
    },
    {
      id: 'Evaluation Engine',
      label: 'Eval Engine',
      description: 'Ragas Score: Faithfulness & Relevance',
      icon: BarChart2,
      color: 'text-emerald-300',
      bgColor: 'bg-emerald-500/10 border-emerald-500/30',
    },
    {
      id: 'Guardrail Engine',
      label: 'Guardrails',
      description: 'PII Scrubbing & Injection Shield',
      icon: ShieldCheck,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10 border-rose-500/30',
    },
    {
      id: 'Confidence Router',
      label: 'Confidence Router',
      description: 'Threshold Routing & Human Approval',
      icon: UserCheck,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10 border-amber-500/30',
    },
  ];

  const handleLaunch = () => {
    if (!taskInput.trim() || isStreaming) return;
    onStartWorkflow(taskInput, forceHumanReview, simulatePii, simulateInjection);
  };

  const getStepLogForNode = (nodeName: NodeName): StepTraceLog | undefined => {
    return workflow?.stepHistory?.find((s) => s.node === nodeName);
  };

  const selectedStepLog = selectedNode ? getStepLogForNode(selectedNode) : undefined;

  // Determine which node is currently active
  const activeNodeName = workflow?.activeNode || 'Supervisor Node';

  return (
    <div className="space-y-6">
      {/* Top Controls Banner */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase tracking-wide bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                Live LangGraph Runner
              </span>
              <span className="text-xs text-slate-400 font-mono">
                StateGraph v0.1 • WebSocket Stream
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight flex items-center space-x-2.5">
              <span>Enterprise Multi-Agent AI Workflow</span>
            </h1>
            <p className="text-xs text-slate-400 max-w-2xl">
              Execute complex multi-agent coding and analysis tasks with automatic evaluation, guardrail security scrubbing, and human-in-the-loop confidence gating.
            </p>
          </div>

          {/* Quick Simulation Toggles */}
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setForceHumanReview(!forceHumanReview)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 font-mono ${
                forceHumanReview
                  ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <UserCheck className="w-3.5 h-3.5" />
              <span>Human Approval Gate</span>
            </button>

            <button
              type="button"
              onClick={() => setSimulatePii(!simulatePii)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 font-mono ${
                simulatePii
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>PII Masking Test</span>
            </button>

            <button
              type="button"
              onClick={() => setSimulateInjection(!simulateInjection)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center space-x-1.5 font-mono ${
                simulateInjection
                  ? 'bg-teal-500/20 border-teal-500/50 text-teal-300'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Prompt Injection Check</span>
            </button>
          </div>
        </div>

        {/* Prompt Input Box */}
        <div className="mt-5 relative">
          <div className="flex flex-col sm:flex-row items-stretch gap-3">
            <div className="relative flex-1">
              <textarea
                value={taskInput}
                onChange={(e) => setTaskInput(e.target.value)}
                disabled={isStreaming}
                rows={2}
                placeholder="Describe your enterprise software architecture task..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 transition-all font-mono leading-relaxed"
              />
              <span className="absolute right-3 bottom-3 text-[10px] text-slate-500 font-mono hidden sm:inline">
                Ctrl + Enter to Execute
              </span>
            </div>

            <button
              type="button"
              onClick={handleLaunch}
              disabled={isStreaming}
              className={`px-6 py-3 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center space-x-2 shadow-lg transition-all shrink-0 font-mono ${
                isStreaming
                  ? 'bg-cyan-600/40 text-cyan-200 border border-cyan-500/40 cursor-not-allowed'
                  : 'bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 shadow-cyan-500/25'
              }`}
            >
              {isStreaming ? (
                <>
                  <Activity className="w-4 h-4 animate-spin text-cyan-300" />
                  <span>Executing Pipeline...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-slate-950 text-slate-950" />
                  <span>Run Workflow</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* LANGGRAPH STATE GRAPH PIPELINE VISUALIZER */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800/80">
          <div className="flex items-center space-x-2.5">
            <GitCommit className="w-5 h-5 text-cyan-400" />
            <h2 className="text-sm font-bold text-white tracking-wide uppercase font-mono">
              LangGraph State Pipeline
            </h2>
            <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[11px] font-mono">
              8 Managed Nodes
            </span>
          </div>

          {workflow && (
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="text-slate-400">
                Confidence Score:{' '}
                <span
                  className={`font-bold ${
                    workflow.confidence_score >= 0.9
                      ? 'text-emerald-400'
                      : workflow.confidence_score >= 0.75
                      ? 'text-amber-400'
                      : 'text-rose-400'
                  }`}
                >
                  {(workflow.confidence_score * 100).toFixed(1)}%
                </span>
              </span>
              <span className="text-slate-600">•</span>
              <span className="text-slate-400">
                Status:{' '}
                <span className="text-slate-200 uppercase font-semibold">
                  {workflow.status}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Horizontal Node Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-8 gap-3 relative">
          {pipelineNodes.map((node, index) => {
            const Icon = node.icon;
            const stepLog = getStepLogForNode(node.id);
            const isActive =
              isStreaming && (activeNodeName === node.id || workflow?.activeNode === node.id);
            const isCompleted =
              !!stepLog || (workflow?.status === 'completed' && !isActive);
            const isPausedHere =
              (workflow?.status === 'waiting_for_human' || workflow?.requires_human_approval) &&
              node.id === 'Confidence Router';
            const isSelected = selectedNode === node.id;

            return (
              <div
                key={node.id}
                onClick={() => setSelectedNode(node.id)}
                className={`relative group cursor-pointer rounded-xl p-3.5 border transition-all duration-300 flex flex-col justify-between select-none ${
                  isActive
                    ? 'animate-pulse border-cyan-500 bg-cyan-500/10 shadow-lg shadow-cyan-500/20 text-cyan-300'
                    : isPausedHere
                    ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/20 text-amber-200'
                    : isSelected
                    ? 'border-cyan-400 bg-slate-800/90 shadow-md text-white'
                    : isCompleted
                    ? 'border-emerald-500/40 bg-slate-900/60 text-slate-200 hover:border-emerald-500/60'
                    : 'border-slate-800/80 bg-slate-950/60 text-slate-400 hover:border-slate-700'
                }`}
              >
                {/* Connector arrow for larger screens */}
                {index < pipelineNodes.length - 1 && (
                  <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600">
                    <ChevronRight className="w-3.5 h-3.5" />
                  </div>
                )}

                {/* Top header row: Icon + Step index */}
                <div className="flex items-center justify-between mb-2">
                  <div
                    className={`p-1.5 rounded-lg border ${
                      isActive
                        ? 'bg-cyan-500/20 border-cyan-400/50 text-cyan-300'
                        : isPausedHere
                        ? 'bg-amber-500/20 border-amber-400/50 text-amber-300'
                        : isCompleted
                        ? 'bg-emerald-500/20 border-emerald-400/50 text-emerald-400'
                        : `${node.bgColor} ${node.color}`
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                  </div>

                  <span className="text-[10px] font-mono font-semibold text-slate-500">
                    0{index + 1}
                  </span>
                </div>

                {/* Node Title & Description */}
                <div>
                  <h3 className="text-xs font-bold leading-tight truncate mb-1">
                    {node.label}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-2 leading-snug font-mono">
                    {node.description}
                  </p>
                </div>

                {/* Bottom Badge Row */}
                <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono">
                  {isActive ? (
                    <span className="text-cyan-400 font-bold flex items-center space-x-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping"></span>
                      <span>ACTIVE</span>
                    </span>
                  ) : isPausedHere ? (
                    <span className="text-amber-300 font-bold flex items-center space-x-1">
                      <AlertTriangle className="w-3 h-3 text-amber-400" />
                      <span>ACTION REQ</span>
                    </span>
                  ) : isCompleted ? (
                    <span className="text-emerald-400 font-bold flex items-center space-x-1">
                      <CheckCircle2 className="w-3 h-3" />
                      <span>
                        ✓ {stepLog ? `${(stepLog.durationMs / 1000).toFixed(1)}s` : 'DONE'}
                      </span>
                    </span>
                  ) : (
                    <span className="text-slate-600">IDLE</span>
                  )}

                  {stepLog && stepLog.tokens > 0 && (
                    <span className="text-slate-400">{stepLog.tokens}k tk</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Human-in-the-Loop Quick Alert Box */}
        {workflow &&
          (workflow.status === 'waiting_for_human' || workflow.requires_human_approval) && (
            <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-500/15 via-amber-600/10 to-slate-900 border border-amber-500/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
              <div className="flex items-center space-x-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  <UserCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-amber-200">
                    Human-in-the-Loop Review Required
                  </h4>
                  <p className="text-xs text-amber-300/80">
                    Confidence score {(workflow.confidence_score * 100).toFixed(1)}% is below the 90.0% safety threshold.
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={onOpenHumanReview}
                className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md inline-flex items-center space-x-1.5 shrink-0"
              >
                <span>Review & Approve Output</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
      </div>

      {/* LOWER SECTION: TERMINAL LOGS & NODE INSPECTOR */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl overflow-hidden shadow-xl">
        {/* Tab Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/60">
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setActiveTab('terminal')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-2 transition-all ${
                activeTab === 'terminal'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <TerminalIcon className="w-3.5 h-3.5" />
              <span>Live Streaming Terminal</span>
            </button>

            <button
              onClick={() => setActiveTab('inspector')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-2 transition-all ${
                activeTab === 'inspector'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Node Inspector: {selectedNode || 'Select Node'}</span>
            </button>

            <button
              onClick={() => setActiveTab('code')}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono flex items-center space-x-2 transition-all ${
                activeTab === 'code'
                  ? 'bg-cyan-500/20 border border-cyan-500/40 text-cyan-300'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Synthesized Artifacts ({workflow?.code_output?.files?.length || 0})</span>
            </button>
          </div>

          <div className="text-[11px] font-mono text-slate-500 hidden sm:block">
            {workflow?.stepHistory?.length || 0} telemetry steps recorded
          </div>
        </div>

        {/* Tab Contents: Cyan / Emerald Syntax & Highlighting */}
        <div className="p-4 bg-slate-950">
          {activeTab === 'terminal' && (
            <div className="space-y-2 max-h-[380px] overflow-y-auto pr-2 font-mono text-xs">
              {!workflow?.stepHistory || workflow.stepHistory.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <TerminalIcon className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
                  <p>No execution logs yet. Click "Run Workflow" to launch the multi-agent pipeline.</p>
                </div>
              ) : (
                workflow.stepHistory.map((log, index) => (
                  <div
                    key={log.id || index}
                    className="p-3 rounded-xl bg-slate-900/70 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:border-slate-700 transition-colors"
                  >
                    <div className="flex items-start space-x-3">
                      <span className="text-slate-500 text-[10px] pt-0.5 shrink-0">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/15 text-cyan-300 border border-cyan-500/30">
                        {log.node}
                      </span>
                      <span className="text-slate-200 font-medium break-all">
                        {log.summary}
                      </span>
                    </div>

                    <div className="flex items-center space-x-3 shrink-0 text-[11px]">
                      {log.durationMs && (
                        <span className="text-emerald-400 flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>{(log.durationMs / 1000).toFixed(2)}s</span>
                        </span>
                      )}
                      {log.tokens && (
                        <span className="px-1.5 py-0.5 rounded bg-slate-800 text-cyan-300">
                          {log.tokens} tk
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === 'inspector' && (
            <div className="space-y-4">
              {selectedStepLog ? (
                <div className="space-y-4">
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-slate-900/80 border border-slate-800">
                    <div>
                      <h3 className="text-sm font-bold font-mono text-cyan-300">
                        {selectedStepLog.node}
                      </h3>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {selectedStepLog.summary}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="px-2 py-1 rounded bg-slate-800 text-emerald-300">
                        Duration: {(selectedStepLog.durationMs / 1000).toFixed(2)}s
                      </span>
                      <span className="px-2 py-1 rounded bg-slate-800 text-cyan-300">
                        Tokens: {selectedStepLog.tokens}k
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <h4 className="text-xs font-bold text-cyan-400 font-mono mb-2 uppercase">
                        State Payload
                      </h4>
                      <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                        {JSON.stringify(selectedStepLog.payload || {}, null, 2)}
                      </pre>
                    </div>

                    <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                      <h4 className="text-xs font-bold text-emerald-400 font-mono mb-2 uppercase">
                        Security & Eval Metadata
                      </h4>
                      <pre className="text-[11px] font-mono text-slate-300 overflow-x-auto max-h-56 p-3 rounded-lg bg-slate-950 border border-slate-800/80">
                        {JSON.stringify(
                          {
                            guardrails: selectedStepLog.guardrails || { clean: true },
                            evalMetrics: selectedStepLog.evalMetrics || null,
                          },
                          null,
                          2
                        )}
                      </pre>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 text-center text-slate-500">
                  <Activity className="w-8 h-8 mx-auto mb-2 opacity-40 text-cyan-500" />
                  <p>
                    No step trace recorded for <strong className="text-slate-300">{selectedNode}</strong> yet.
                  </p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'code' && (
            <div className="space-y-4">
              {!workflow?.code_output?.files || workflow.code_output.files.length === 0 ? (
                <div className="py-12 text-center text-slate-500">
                  <FileCode className="w-8 h-8 mx-auto mb-2 opacity-40 text-emerald-500" />
                  <p>No code synthesized yet. Run the workflow to generate enterprise Python FastAPI source files.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-1 space-y-2">
                    <div className="text-xs font-bold font-mono text-slate-400 px-1 uppercase">
                      Generated Files ({workflow.code_output.files.length})
                    </div>
                    {workflow.code_output.files.map((file, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs font-mono flex items-center justify-between"
                      >
                        <span className="text-slate-200 truncate">{file.filename}</span>
                        <span className="text-[10px] px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300">
                          {file.language}
                        </span>
                      </div>
                    ))}
                  </div>

                  <div className="lg:col-span-2">
                    <div className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 space-y-2">
                      <div className="text-xs font-bold font-mono text-emerald-400">
                        {workflow.code_output.files[0].filename}
                      </div>
                      <pre className="text-xs font-mono text-slate-300 overflow-x-auto max-h-72 p-3 rounded-lg bg-slate-950 border border-slate-800">
                        {workflow.code_output.files[0].content}
                      </pre>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
