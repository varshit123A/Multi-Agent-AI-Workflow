/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Activity,
  Clock,
  Coins,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileJson,
  Search,
  ChevronRight,
  Cpu,
} from 'lucide-react';
import { StepTraceLog } from '../types';

interface ExecutionTraceProps {
  steps: StepTraceLog[];
  isStreaming: boolean;
}

export const ExecutionTrace: React.FC<ExecutionTraceProps> = ({ steps, isStreaming }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTrace, setSelectedTrace] = useState<StepTraceLog | null>(null);

  const filteredSteps = steps.filter(
    (s) =>
      s.node.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.summary.toLowerCase().includes(searchTerm.toLowerCase()) ||
      s.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalTokens = steps.reduce((acc, s) => acc + (s.tokens || 0), 0);
  const totalDuration = steps.reduce((acc, s) => acc + (s.durationMs || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Bar / Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono">Total Steps Executed</span>
            <div className="text-xl font-bold text-white mt-0.5 font-mono">{steps.length}</div>
          </div>
          <Activity className="w-8 h-8 text-cyan-400 opacity-80" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono">Cumulative Latency</span>
            <div className="text-xl font-bold text-emerald-400 mt-0.5 font-mono">
              {(totalDuration / 1000).toFixed(2)}s
            </div>
          </div>
          <Clock className="w-8 h-8 text-emerald-400 opacity-80" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono">Tokens Consumed</span>
            <div className="text-xl font-bold text-teal-400 mt-0.5 font-mono">
              {totalTokens.toLocaleString()}
            </div>
          </div>
          <Coins className="w-8 h-8 text-teal-400 opacity-80" />
        </div>

        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-400 font-mono">OpenTelemetry Trace Status</span>
            <div className="text-sm font-bold text-cyan-300 mt-1 uppercase font-mono">
              {isStreaming ? 'STREAMING_SPAN' : 'OTLP_VERIFIED'}
            </div>
          </div>
          <Cpu className="w-8 h-8 text-cyan-400 opacity-80" />
        </div>
      </div>

      {/* Main Table Card */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-white flex items-center space-x-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <span>LangSmith / OpenTelemetry Execution Timeline</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5 font-mono">
              Node-by-node telemetry with latency spans, token counts, and JSON step payloads.
            </p>
          </div>

          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              placeholder="Search traces by node or id..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
            />
          </div>
        </div>

        {/* Table View */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider font-mono">
                <th className="py-3 px-4">Span / Node</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Latency (ms)</th>
                <th className="py-3 px-4">Tokens</th>
                <th className="py-3 px-4">Summary</th>
                <th className="py-3 px-4 text-right">Inspect Payload</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
              {filteredSteps.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-500 font-mono">
                    No matching execution traces found. Launch a StateGraph workflow to inspect OpenTelemetry spans.
                  </td>
                </tr>
              ) : (
                filteredSteps.map((step) => {
                  const isSelected = selectedTrace?.id === step.id;
                  return (
                    <tr
                      key={step.id}
                      onClick={() => setSelectedTrace(step)}
                      className={`cursor-pointer transition-colors ${
                        isSelected ? 'bg-cyan-600/10' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      <td className="py-3 px-4 font-mono font-semibold text-slate-200">
                        {step.node}
                      </td>
                      <td className="py-3 px-4">
                        {step.status === 'success' && (
                          <span className="inline-flex items-center space-x-1 text-emerald-400 font-semibold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            <span>SUCCESS</span>
                          </span>
                        )}
                        {step.status === 'warning' && (
                          <span className="inline-flex items-center space-x-1 text-amber-400 font-semibold">
                            <AlertTriangle className="w-3.5 h-3.5" />
                            <span>PAUSED</span>
                          </span>
                        )}
                        {step.status === 'error' && (
                          <span className="inline-flex items-center space-x-1 text-rose-400 font-semibold">
                            <XCircle className="w-3.5 h-3.5" />
                            <span>FLAGGED</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 font-mono text-slate-300">
                        {step.durationMs}ms
                      </td>
                      <td className="py-3 px-4 font-mono text-teal-300">
                        {step.tokens.toLocaleString()}
                      </td>
                      <td className="py-3 px-4 text-slate-300 max-w-md truncate">
                        {step.summary}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <button className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white inline-flex items-center space-x-1">
                          <FileJson className="w-4 h-4" />
                          <span>JSON</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Selected Trace Modal/Drawer */}
      {selectedTrace && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="px-2 py-0.5 rounded text-xs font-semibold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                OTLP Span JSON Payload
              </span>
              <h4 className="text-sm font-bold text-white font-mono">
                {selectedTrace.node} ({selectedTrace.id})
              </h4>
            </div>
            <button
              onClick={() => setSelectedTrace(null)}
              className="text-xs text-slate-400 hover:text-slate-200 font-mono"
            >
              Close Payload ✕
            </button>
          </div>

          <div className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 font-mono text-xs text-emerald-300 overflow-x-auto max-h-80">
            <pre>{JSON.stringify(selectedTrace.payload, null, 2)}</pre>
          </div>
        </div>
      )}
    </div>
  );
};
