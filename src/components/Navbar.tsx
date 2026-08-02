/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from 'react';
import {
  GitBranch,
  Activity,
  ShieldCheck,
  BarChart3,
  Code2,
  UserCheck,
  Cpu,
  Sparkles,
} from 'lucide-react';

export type NavTab = 'orchestration' | 'trace' | 'eval' | 'guardrails' | 'python-export';

interface NavbarProps {
  activeTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  pendingHumanReviewsCount: number;
  onOpenHumanReview: () => void;
  isStreaming: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  pendingHumanReviewsCount,
  onOpenHumanReview,
  isStreaming,
}) => {
  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 border-b border-slate-800 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo / Title */}
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-600 to-pink-600 text-white shadow-lg shadow-indigo-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-base font-bold tracking-tight text-white">
                  Enterprise Multi-Agent AI Workflow
                </span>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  LangGraph v0.1
                </span>
              </div>
              <p className="text-xs text-slate-400">
                StateGraph • Ragas Eval • Guardrails • Human-in-the-Loop
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <nav className="hidden md:flex items-center space-x-1">
            <button
              onClick={() => onSelectTab('orchestration')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'orchestration'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <GitBranch className="w-4 h-4" />
              <span>State Graph & Monitor</span>
            </button>

            <button
              onClick={() => onSelectTab('trace')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'trace'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Activity className="w-4 h-4" />
              <span>Execution Trace</span>
            </button>

            <button
              onClick={() => onSelectTab('eval')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'eval'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Ragas Evaluation</span>
            </button>

            <button
              onClick={() => onSelectTab('guardrails')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'guardrails'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Guardrails & Sandbox</span>
            </button>

            <button
              onClick={() => onSelectTab('python-export')}
              className={`flex items-center space-x-2 px-3.5 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'python-export'
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>Python Export</span>
            </button>
          </nav>

          {/* Right Action: Human-in-the-loop button + Status Indicator */}
          <div className="flex items-center space-x-3">
            {pendingHumanReviewsCount > 0 && (
              <button
                onClick={onOpenHumanReview}
                className="relative flex items-center space-x-2 px-3.5 py-1.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-amber-300 rounded-lg text-sm font-semibold transition-all animate-pulse shadow-md shadow-amber-500/10"
              >
                <UserCheck className="w-4 h-4 text-amber-400" />
                <span>Human Approval Required</span>
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-amber-500 text-slate-900 text-xs font-bold">
                  {pendingHumanReviewsCount}
                </span>
              </button>
            )}

            <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-800/80 border border-slate-700/60 text-xs text-slate-300">
              <span
                className={`w-2 h-2 rounded-full ${
                  isStreaming
                    ? 'bg-emerald-400 animate-ping'
                    : 'bg-emerald-500'
                }`}
              />
              <span className="font-mono">
                {isStreaming ? 'EXEC_STREAM_ACTIVE' : 'SYSTEM_READY'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
