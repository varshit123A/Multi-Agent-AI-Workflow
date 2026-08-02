/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Sidebar, DashboardTab } from '../components/Sidebar';
import { AgentWorkflowVisualizer } from '../components/AgentWorkflowVisualizer';
import { EvalMetricsGrid } from '../components/EvalMetricsGrid';
import { EvalDashboard } from '../components/EvalDashboard';
import { GuardrailLogs } from '../components/GuardrailLogs';
import { PythonExportModal } from '../components/PythonExportModal';
import { ExecutionTrace } from '../components/ExecutionTrace';
import { HumanReviewDrawer } from '../components/HumanReviewDrawer';
import {
  Cpu,
  Activity,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  UserCheck,
  Sparkles,
  ExternalLink,
  Code2,
} from 'lucide-react';
import { AgentState } from '../types';

interface MainDashboardProps {
  workflow: AgentState | null;
  onStartWorkflow: (
    task: string,
    forceHuman: boolean,
    simPii: boolean,
    simInjection: boolean
  ) => void;
  isStreaming: boolean;
  onSubmitReview: (
    action: 'approve' | 'reject' | 'edit_and_approve',
    notes: string,
    editedCode?: { files: Array<{ filename: string; language: string; content: string }> }
  ) => void;
  apiBaseUrl: string;
}

export const MainDashboard: React.FC<MainDashboardProps> = ({
  workflow,
  onStartWorkflow,
  isStreaming,
  onSubmitReview,
  apiBaseUrl,
}) => {
  const [activeTab, setActiveTab] = useState<DashboardTab>('playground');
  const [showReviewDrawer, setShowReviewDrawer] = useState<boolean>(false);

  const pendingHumanReviewsCount =
    workflow?.status === 'waiting_for_human' || workflow?.requires_human_approval
      ? 1
      : 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      {/* Sleek Collapsible Enterprise Sidebar */}
      <Sidebar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'human-review') {
            setShowReviewDrawer(true);
          }
        }}
        pendingHumanReviewsCount={pendingHumanReviewsCount}
        isStreaming={isStreaming}
        onOpenHumanReview={() => setShowReviewDrawer(true)}
      />

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        {/* Top Header Bar */}
        <header className="h-16 px-6 border-b border-slate-800/80 bg-slate-900/80 backdrop-blur-md flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <span className="text-xs font-mono text-slate-400">
              Active Environment:
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-mono font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
              LangGraph StateGraph v0.1 (FastAPI + OpenTelemetry)
            </span>
          </div>

          <div className="flex items-center space-x-3">
            {pendingHumanReviewsCount > 0 && (
              <button
                onClick={() => setShowReviewDrawer(true)}
                className="px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/40 text-xs font-semibold font-mono flex items-center space-x-1.5 transition-all animate-pulse"
              >
                <UserCheck className="w-4 h-4" />
                <span>1 Human Approval Pending</span>
              </button>
            )}

            <button
              onClick={() => setActiveTab('python-export')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold font-mono flex items-center space-x-1.5 transition-colors border border-slate-700"
            >
              <Code2 className="w-4 h-4 text-teal-400" />
              <span>Export Enterprise Python</span>
            </button>
          </div>
        </header>

        {/* Scrollable View Content */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8 space-y-6">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'playground' && (
              <div className="space-y-6">
                <AgentWorkflowVisualizer
                  workflow={workflow}
                  onStartWorkflow={onStartWorkflow}
                  isStreaming={isStreaming}
                  onOpenHumanReview={() => setShowReviewDrawer(true)}
                />
              </div>
            )}

            {activeTab === 'graph' && (
              <div className="space-y-6">
                <AgentWorkflowVisualizer
                  workflow={workflow}
                  onStartWorkflow={onStartWorkflow}
                  isStreaming={isStreaming}
                  onOpenHumanReview={() => setShowReviewDrawer(true)}
                />
                <ExecutionTrace
                  steps={workflow?.stepHistory || []}
                  isStreaming={isStreaming}
                />
              </div>
            )}

            {activeTab === 'eval' && (
              <div className="space-y-6">
                <EvalMetricsGrid currentMetrics={workflow?.eval_metrics} />
                <EvalDashboard apiBaseUrl={apiBaseUrl} />
              </div>
            )}

            {activeTab === 'guardrails' && (
              <div className="space-y-6">
                <GuardrailLogs apiBaseUrl={apiBaseUrl} />
              </div>
            )}

            {activeTab === 'human-review' && (
              <div className="space-y-6">
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center space-x-2">
                      <UserCheck className="w-5 h-5 text-amber-400" />
                      <span>Human-in-the-Loop Approval Queue</span>
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 font-mono">
                      Inspect confidence gates, review code changes, and approve or reject pipeline steps.
                    </p>
                  </div>

                  <button
                    onClick={() => setShowReviewDrawer(true)}
                    className="px-4 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs transition-all shadow-md font-mono"
                  >
                    Open Review Drawer
                  </button>
                </div>

                <AgentWorkflowVisualizer
                  workflow={workflow}
                  onStartWorkflow={onStartWorkflow}
                  isStreaming={isStreaming}
                  onOpenHumanReview={() => setShowReviewDrawer(true)}
                />
              </div>
            )}

            {activeTab === 'python-export' && (
              <div className="space-y-6">
                <PythonExportModal />
              </div>
            )}
          </div>
        </main>
      </div>

      {/* Human-in-the-Loop Review Sliding Drawer */}
      <HumanReviewDrawer
        workflow={workflow}
        isOpen={showReviewDrawer}
        onClose={() => setShowReviewDrawer(false)}
        onSubmitReview={(action, notes, editedCode) => {
          onSubmitReview(action, notes, editedCode);
          setShowReviewDrawer(false);
        }}
      />
    </div>
  );
};
