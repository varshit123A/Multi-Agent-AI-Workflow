/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Sparkles,
  GitBranch,
  BarChart3,
  ShieldCheck,
  UserCheck,
  Code2,
  ChevronLeft,
  ChevronRight,
  Cpu,
  Activity,
  CheckCircle2,
  AlertTriangle,
} from 'lucide-react';

export type DashboardTab =
  | 'playground'
  | 'graph'
  | 'eval'
  | 'guardrails'
  | 'human-review'
  | 'python-export';

interface SidebarProps {
  activeTab: DashboardTab;
  onSelectTab: (tab: DashboardTab) => void;
  pendingHumanReviewsCount: number;
  isStreaming: boolean;
  onOpenHumanReview?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  onSelectTab,
  pendingHumanReviewsCount,
  isStreaming,
  onOpenHumanReview,
}) => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const navItems = [
    {
      id: 'playground' as DashboardTab,
      label: 'Playground',
      sublabel: 'Prompt Execution',
      icon: Sparkles,
      badge: null,
      color: 'text-cyan-400',
      bgColor: 'bg-cyan-500/10',
    },
    {
      id: 'graph' as DashboardTab,
      label: 'Workflow Graph',
      sublabel: 'Live Agent Nodes',
      icon: GitBranch,
      badge: isStreaming ? 'LIVE' : null,
      color: 'text-sky-400',
      bgColor: 'bg-sky-500/10',
    },
    {
      id: 'eval' as DashboardTab,
      label: 'Evaluation & Quality',
      sublabel: 'Ragas & DeepEval',
      icon: BarChart3,
      badge: null,
      color: 'text-emerald-400',
      bgColor: 'bg-emerald-500/10',
    },
    {
      id: 'guardrails' as DashboardTab,
      label: 'Guardrails Log',
      sublabel: 'PII & Injection Shield',
      icon: ShieldCheck,
      badge: null,
      color: 'text-rose-400',
      bgColor: 'bg-rose-500/10',
    },
    {
      id: 'human-review' as DashboardTab,
      label: 'Human Review',
      sublabel: 'Approval Queue',
      icon: UserCheck,
      badge: pendingHumanReviewsCount > 0 ? pendingHumanReviewsCount : null,
      color: 'text-amber-400',
      bgColor: 'bg-amber-500/10',
    },
    {
      id: 'python-export' as DashboardTab,
      label: 'Python Code Export',
      sublabel: 'FastAPI + LangGraph',
      icon: Code2,
      badge: 'v0.1',
      color: 'text-teal-400',
      bgColor: 'bg-teal-500/10',
    },
  ];

  return (
    <aside
      className={`relative flex flex-col border-r border-slate-800/80 bg-slate-950/95 backdrop-blur-xl transition-all duration-300 ease-in-out shrink-0 select-none ${
        isCollapsed ? 'w-20' : 'w-64'
      }`}
    >
      {/* Top Brand & Status Indicator */}
      <div className="p-4 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="p-2 rounded-xl bg-gradient-to-br from-cyan-500 via-teal-500 to-emerald-500 text-slate-950 font-bold shadow-lg shadow-cyan-500/25 shrink-0 flex items-center justify-center">
            <Cpu className="w-5 h-5 text-slate-950" />
          </div>
          {!isCollapsed && (
            <div className="truncate">
              <div className="flex items-center space-x-1.5">
                <span className="text-sm font-bold tracking-tight text-white font-mono truncate">
                  LANGGRAPH.AI
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate font-mono">
                Enterprise Multi-Agent OS
              </p>
            </div>
          )}
        </div>

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800 transition-colors shrink-0"
          title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4" />
          ) : (
            <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>

      {/* Glowing Cyan Status Pill: "System Operational" */}
      <div className="px-3 py-3 border-b border-slate-800/60">
        <div
          className={`flex items-center justify-between px-3 py-2 rounded-xl bg-slate-900/80 border border-slate-800/80 ${
            isCollapsed ? 'justify-center px-1' : ''
          }`}
        >
          <div className="flex items-center space-x-2">
            <span className="relative flex h-2 w-2">
              <span
                className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${
                  isStreaming ? 'bg-cyan-400' : 'bg-emerald-400'
                }`}
              ></span>
              <span
                className={`relative inline-flex rounded-full h-2 w-2 ${
                  isStreaming ? 'bg-cyan-500' : 'bg-emerald-500'
                }`}
              ></span>
            </span>
            {!isCollapsed && (
              <span className="text-xs font-semibold text-slate-200 font-mono">
                {isStreaming ? 'Workflow Active...' : 'System Operational'}
              </span>
            )}
          </div>

          {!isCollapsed && (
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-cyan-400 border border-slate-700/60">
              99.9% SLO
            </span>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
        {!isCollapsed && (
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500 font-mono">
            Navigation
          </div>
        )}

        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                onSelectTab(item.id);
                if (item.id === 'human-review' && onOpenHumanReview) {
                  onOpenHumanReview();
                }
              }}
              className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-medium transition-all group ${
                isActive
                  ? 'bg-gradient-to-r from-cyan-500/20 via-cyan-500/10 to-transparent border border-cyan-500/50 text-white shadow-sm shadow-cyan-500/10'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/80 border border-transparent'
              }`}
              title={isCollapsed ? item.label : undefined}
            >
              <div className="flex items-center space-x-3 truncate">
                <div
                  className={`p-1.5 rounded-lg shrink-0 transition-colors ${
                    isActive ? `${item.bgColor} ${item.color}` : 'bg-slate-900 text-slate-400 group-hover:text-slate-200'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                {!isCollapsed && (
                  <div className="text-left truncate">
                    <div className={`font-semibold leading-tight truncate ${isActive ? 'text-white' : ''}`}>
                      {item.label}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">
                      {item.sublabel}
                    </div>
                  </div>
                )}
              </div>

              {/* Badges */}
              {!isCollapsed && item.badge && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold shrink-0 ${
                    item.badge === 'LIVE'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 animate-pulse'
                      : typeof item.badge === 'number'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                      : 'bg-teal-500/20 text-teal-300 border border-teal-500/40'
                  }`}
                >
                  {item.badge}
                </span>
              )}

              {isCollapsed && typeof item.badge === 'number' && (
                <span className="absolute right-2 top-2 w-2 h-2 rounded-full bg-amber-500"></span>
              )}
            </button>
          );
        })}
      </div>

      {/* Bottom Footer Details */}
      <div className="p-3 border-t border-slate-800/80 bg-slate-950/60">
        {!isCollapsed ? (
          <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">OpenTelemetry</span>
              <span className="text-emerald-400 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>Active</span>
              </span>
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-slate-400">Guardrails Shield</span>
              <span className="text-cyan-400 font-bold">Strict PII</span>
            </div>
          </div>
        ) : (
          <div className="flex justify-center">
            <div
              className="p-2 rounded-lg bg-slate-900 border border-slate-800 text-cyan-400"
              title="OpenTelemetry Active"
            >
              <Activity className="w-4 h-4" />
            </div>
          </div>
        )}
      </div>
    </aside>
  );
};
