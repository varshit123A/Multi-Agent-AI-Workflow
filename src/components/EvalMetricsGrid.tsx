/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  CheckCircle2,
  TrendingUp,
  ShieldCheck,
  Activity,
  Award,
  Sparkles,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { EvalMetrics } from '../types';

interface EvalMetricsGridProps {
  currentMetrics?: EvalMetrics;
  historicalRuns?: Array<{
    runId: string;
    timestamp: string;
    faithfulness: number;
    hallucination_score: number;
    relevance: number;
    tokens: number;
  }>;
}

export const EvalMetricsGrid: React.FC<EvalMetricsGridProps> = ({
  currentMetrics,
  historicalRuns,
}) => {
  const [selectedSuite, setSelectedSuite] = useState<'ragas' | 'deepeval' | 'all'>('all');

  const metrics: EvalMetrics = currentMetrics || {
    faithfulness: 0.96,
    hallucination_score: 0.02,
    relevance: 0.94,
    latency_ms: 1420,
    tokens_used: 12400,
  };

  const sampleHistory = historicalRuns || [
    { runId: 'Run #101', timestamp: '14:02', faithfulness: 0.88, hallucination_score: 0.08, relevance: 0.86, tokens: 9800 },
    { runId: 'Run #102', timestamp: '14:15', faithfulness: 0.91, hallucination_score: 0.05, relevance: 0.89, tokens: 10400 },
    { runId: 'Run #103', timestamp: '14:31', faithfulness: 0.94, hallucination_score: 0.03, relevance: 0.92, tokens: 11200 },
    { runId: 'Run #104', timestamp: '15:04', faithfulness: 0.92, hallucination_score: 0.04, relevance: 0.91, tokens: 10900 },
    { runId: 'Run #105', timestamp: '15:28', faithfulness: 0.96, hallucination_score: 0.02, relevance: 0.94, tokens: 12400 },
    { runId: 'Run #106 (Latest)', timestamp: '15:52', faithfulness: 0.97, hallucination_score: 0.01, relevance: 0.96, tokens: 11800 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              Ragas + DeepEval Suite
            </span>
            <span className="text-xs text-slate-400 font-mono">Automated CI/CD Quality Gates</span>
          </div>
          <h2 className="text-lg font-bold text-white mt-1 flex items-center space-x-2">
            <Award className="w-5 h-5 text-emerald-400" />
            <span>Evaluation & Quality Score Dashboard</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Real-time verification of LLM output faithfulness, hallucination mitigation, and context relevance.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex items-center space-x-1.5 bg-slate-950 p-1 rounded-xl border border-slate-800">
          {[
            { id: 'all', label: 'All Metrics' },
            { id: 'ragas', label: 'Ragas Suite' },
            { id: 'deepeval', label: 'DeepEval Suite' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setSelectedSuite(tab.id as any)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all font-mono ${
                selectedSuite === tab.id
                  ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* 3 High-Impact Gauge / Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* CARD 1: Faithfulness Score */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-emerald-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Faithfulness Score
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Ragas Answer Grounding</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[10px] font-mono font-bold">
              PASSING
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {(metrics.faithfulness * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-emerald-400 flex items-center space-x-1 mt-1 font-mono">
                <TrendingUp className="w-3.5 h-3.5" />
                <span>+4.2% vs. baseline</span>
              </div>
            </div>

            {/* Visual Gauge Bar */}
            <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full"
                style={{ width: `${metrics.faithfulness * 100}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CARD 2: Hallucination Risk */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-cyan-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Hallucination Risk
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">DeepEval Groundedness</p>
              </div>
            </div>
            <span className="px-2.5 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-[10px] font-mono font-bold">
              Minimal Risk - {metrics.hallucination_score.toFixed(2)}
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {metrics.hallucination_score.toFixed(2)}
              </div>
              <div className="text-xs text-cyan-400 flex items-center space-x-1 mt-1 font-mono">
                <span>0 unsupported factual claims</span>
              </div>
            </div>

            <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-cyan-400 to-teal-400 h-full rounded-full"
                style={{ width: `${Math.max(8, metrics.hallucination_score * 100)}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* CARD 3: Context Relevance & Answer Quality */}
        <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden group hover:border-teal-500/50 transition-colors">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="p-2 rounded-xl bg-teal-500/15 text-teal-400 border border-teal-500/30">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  Context Relevance
                </h3>
                <p className="text-[11px] text-slate-500 font-mono">Ragas Precision</p>
              </div>
            </div>
            <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 text-[10px] font-mono font-bold">
              OPTIMAL
            </span>
          </div>

          <div className="flex items-end justify-between">
            <div>
              <div className="text-3xl font-extrabold text-white font-mono tracking-tight">
                {(metrics.relevance * 100).toFixed(0)}%
              </div>
              <div className="text-xs text-teal-400 flex items-center space-x-1 mt-1 font-mono">
                <Activity className="w-3.5 h-3.5" />
                <span>99.2% schema adherence</span>
              </div>
            </div>

            <div className="w-24 bg-slate-800 rounded-full h-2.5 overflow-hidden">
              <div
                className="bg-gradient-to-r from-teal-400 to-cyan-400 h-full rounded-full"
                style={{ width: `${metrics.relevance * 100}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Area Chart Tracking Score Quality Over Past Runs */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
          <div>
            <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
              Historical Quality Score Trend (Past 6 Execution Pipelines)
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Tracking Faithfulness, Context Relevance, and Hallucination suppression across workflow iterations.
            </p>
          </div>
          <div className="flex items-center space-x-4 text-xs font-mono">
            <span className="flex items-center space-x-1.5 text-emerald-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400"></span>
              <span>Faithfulness</span>
            </span>
            <span className="flex items-center space-x-1.5 text-cyan-400">
              <span className="w-2.5 h-2.5 rounded-full bg-cyan-400"></span>
              <span>Relevance</span>
            </span>
            <span className="flex items-center space-x-1.5 text-teal-400">
              <span className="w-2.5 h-2.5 rounded-full bg-teal-400"></span>
              <span>Hallucination</span>
            </span>
          </div>
        </div>

        <div className="h-72 w-full">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sampleHistory} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="faithGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="relGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0.0} />
                </linearGradient>
                <linearGradient id="tealGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#14b8a6" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
              <XAxis dataKey="runId" stroke="#64748b" textAnchor="end" height={40} tick={{ fontSize: 11 }} />
              <YAxis stroke="#64748b" domain={[0, 1]} tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  backgroundColor: '#0f172a',
                  borderColor: '#334155',
                  borderRadius: '0.75rem',
                  fontSize: '0.75rem',
                  color: '#f8fafc',
                }}
              />
              <Area
                type="monotone"
                dataKey="faithfulness"
                name="Faithfulness"
                stroke="#10b981"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#faithGradient)"
              />
              <Area
                type="monotone"
                dataKey="relevance"
                name="Relevance"
                stroke="#06b6d4"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#relGradient)"
              />
              <Area
                type="monotone"
                dataKey="hallucination_score"
                name="Hallucination Score"
                stroke="#14b8a6"
                strokeWidth={2}
                fillOpacity={1}
                fill="url(#tealGradient)"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Ragas Test Suite Breakdown Table */}
      <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-6 shadow-xl backdrop-blur-md">
        <div className="flex items-center justify-between pb-4 mb-4 border-b border-slate-800">
          <h3 className="text-sm font-bold text-white uppercase font-mono tracking-wide">
            Automated Evaluation Suite Details
          </h3>
          <span className="text-xs font-mono text-slate-400">4 / 4 Assertions Passed</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="pb-3 font-semibold">Evaluation Assertion</th>
                <th className="pb-3 font-semibold">Framework</th>
                <th className="pb-3 font-semibold">Target Threshold</th>
                <th className="pb-3 font-semibold">Observed Score</th>
                <th className="pb-3 font-semibold text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-slate-300">
              <tr>
                <td className="py-3 font-semibold text-white">Answer Grounding & Faithfulness</td>
                <td className="py-3 text-slate-400">Ragas v0.1.9</td>
                <td className="py-3 text-slate-400">≥ 0.90</td>
                <td className="py-3 text-emerald-400 font-bold">0.96</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    PASSED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Hallucination Mitigation</td>
                <td className="py-3 text-slate-400">DeepEval Groundedness</td>
                <td className="py-3 text-slate-400">≤ 0.05</td>
                <td className="py-3 text-cyan-400 font-bold">0.02</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-bold">
                    PASSED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">Context Precision & Recall</td>
                <td className="py-3 text-slate-400">Ragas v0.1.9</td>
                <td className="py-3 text-slate-400">≥ 0.85</td>
                <td className="py-3 text-teal-400 font-bold">0.94</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-teal-500/20 text-teal-300 border border-teal-500/30 font-bold">
                    PASSED
                  </span>
                </td>
              </tr>
              <tr>
                <td className="py-3 font-semibold text-white">OWASP Security & Code Safety</td>
                <td className="py-3 text-slate-400">Guardrails Shield</td>
                <td className="py-3 text-slate-400">0 Critical CVEs</td>
                <td className="py-3 text-emerald-400 font-bold">0 CVEs Found</td>
                <td className="py-3 text-right">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold">
                    PASSED
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
