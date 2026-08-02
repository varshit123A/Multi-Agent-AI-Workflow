/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  UserCheck,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Code2,
  ShieldAlert,
  X,
  Edit3,
  Sliders,
  Check,
} from 'lucide-react';
import { AgentState } from '../types';

interface HumanReviewDrawerProps {
  workflow: AgentState | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmitReview: (
    action: 'approve' | 'reject' | 'edit_and_approve',
    notes: string,
    editedCode?: { files: Array<{ filename: string; language: string; content: string }> }
  ) => void;
}

export const HumanReviewDrawer: React.FC<HumanReviewDrawerProps> = ({
  workflow,
  isOpen,
  onClose,
  onSubmitReview,
}) => {
  if (!isOpen) return null;

  const [notes, setNotes] = useState<string>(
    'Reviewed security flags and verified API import boundaries.'
  );
  const [activeTab, setActiveTab] = useState<'diff' | 'flagged' | 'edit'>('diff');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const confidenceScore = workflow ? workflow.confidence_score : 0.84;
  const isBelowThreshold = confidenceScore < 0.9;

  const flaggedReasons = workflow?.review_feedback?.security_flags || [
    {
      type: 'SECURITY_BOUNDARY',
      severity: 'medium',
      line: 24,
      description: 'Potential unverified API import in Coding Agent output.',
      recommendation: 'Verify internal package dependency or approve explicit firewall ingress rules.',
    },
    {
      type: 'CONFIDENCE_GATE',
      severity: 'low',
      description: 'Human confirmation required for automated database schema migrations.',
      recommendation: 'Ensure migration scripts are backwards-compatible before deploy.',
    },
  ];

  // Sample before/after diff snippet for inspection
  const beforeCode = `# Coding Agent Draft Output
from fastapi import FastAPI, Depends
import requests # Unverified HTTP caller

app = FastAPI()

@app.get("/api/v1/billing")
def get_billing():
    resp = requests.get("https://external-api.internal/billing")
    return resp.json()`;

  const afterCode = `# Enterprise Sanitized & Verified Output
from fastapi import FastAPI, Depends, HTTPException
import httpx # OpenTelemetry async client
from app.core.security import verify_jwt_token

app = FastAPI()

@app.get("/api/v1/billing", dependencies=[Depends(verify_jwt_token)])
async def get_billing():
    async with httpx.AsyncClient() as client:
        resp = await client.get("https://internal-api.service/billing")
        resp.raise_for_status()
        return resp.json()`;

  const handleAction = async (action: 'approve' | 'reject' | 'edit_and_approve') => {
    setIsSubmitting(true);
    try {
      await onSubmitReview(action, notes);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/80 backdrop-blur-sm flex justify-end transition-opacity">
      {/* Drawer Overlay backdrop */}
      <div className="absolute inset-0" onClick={onClose} />

      {/* Sliding Drawer Container */}
      <div className="relative w-full max-w-3xl bg-slate-900 border-l border-slate-800 h-full shadow-2xl flex flex-col z-10 overflow-hidden">
        {/* Top Header */}
        <div className="p-6 border-b border-slate-800 bg-slate-950/80 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-amber-500/20 text-amber-300 border border-amber-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-bold text-white uppercase font-mono tracking-wider">
                  Human-in-the-Loop Approval Drawer
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  ACTION REQUIRED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 font-mono">
                Confidence Gate triggered before downstream deployment.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Confidence Gauge Badge Banner */}
        <div className="px-6 py-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center space-x-3">
            <div
              className={`p-2 rounded-xl border ${
                isBelowThreshold
                  ? 'bg-amber-500/15 border-amber-500/30 text-amber-300'
                  : 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300'
              }`}
            >
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-mono text-slate-400 uppercase">
                Confidence Rating Badge
              </div>
              <div className="text-base font-extrabold font-mono text-white flex items-center space-x-2">
                <span
                  className={
                    isBelowThreshold ? 'text-amber-400' : 'text-emerald-400'
                  }
                >
                  {(confidenceScore * 100).toFixed(0)}%
                </span>
                <span className="text-xs text-amber-300 font-mono font-semibold">
                  {isBelowThreshold
                    ? '- Below Threshold (Review Required)'
                    : '- Passed Baseline Threshold'}
                </span>
              </div>
            </div>
          </div>

          <div className="text-xs font-mono px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300">
            Node: <strong className="text-cyan-400">Confidence Router</strong>
          </div>
        </div>

        {/* Navigation Tabs inside Drawer */}
        <div className="px-6 pt-3 border-b border-slate-800 flex items-center space-x-4 bg-slate-950/40">
          {[
            { id: 'diff', label: 'Before & After Code Diff', icon: Code2 },
            { id: 'flagged', label: `Flagged Issues (${flaggedReasons.length})`, icon: ShieldAlert },
            { id: 'edit', label: 'Reviewer Notes', icon: Edit3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-3 text-xs font-mono font-semibold flex items-center space-x-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? 'border-cyan-500 text-cyan-300'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Main Drawer Scrollable Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {activeTab === 'diff' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-400">
                  Side-by-side Sanitization & Security Fixes
                </span>
                <span className="text-emerald-400">
                  + OpenTelemetry & JWT Auth injected
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Before Box */}
                <div className="rounded-xl overflow-hidden border border-rose-500/30 bg-slate-950">
                  <div className="px-3 py-2 bg-rose-500/10 border-b border-rose-500/30 text-[11px] font-mono font-bold text-rose-300 flex items-center justify-between">
                    <span>BEFORE (Raw Coding Agent Draft)</span>
                    <span>Line 24 Flag</span>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-slate-300 overflow-x-auto leading-relaxed">
                    {beforeCode}
                  </pre>
                </div>

                {/* After Box */}
                <div className="rounded-xl overflow-hidden border border-emerald-500/40 bg-slate-950">
                  <div className="px-3 py-2 bg-emerald-500/10 border-b border-emerald-500/30 text-[11px] font-mono font-bold text-emerald-300 flex items-center justify-between">
                    <span>AFTER (Sanitized & Hardened)</span>
                    <span>OWASP Verified</span>
                  </div>
                  <pre className="p-3 text-[11px] font-mono text-slate-200 overflow-x-auto leading-relaxed">
                    {afterCode}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'flagged' && (
            <div className="space-y-3">
              {flaggedReasons.map((flag, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-xl bg-slate-900/80 border border-amber-500/30 space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {flag.type}
                    </span>
                    <span className="text-xs font-mono text-slate-400">
                      {flag.line ? `Line ${flag.line}` : 'Pipeline Rule'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 font-medium">
                    {flag.description}
                  </p>
                  <div className="text-xs text-slate-400 font-mono bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                    <strong className="text-cyan-400">Recommendation:</strong> {flag.recommendation}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'edit' && (
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold font-mono uppercase text-slate-300 mb-2">
                  Reviewer Notes & Audit Commentary
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500 font-mono"
                  placeholder="Enter audit notes or modification instructions..."
                />
              </div>

              <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-xs text-slate-400 font-mono">
                These notes will be recorded in the LangGraph audit trail and OpenTelemetry spans.
              </div>
            </div>
          )}
        </div>

        {/* Bottom Drawer Footer: One-Click Action Buttons */}
        <div className="p-6 border-t border-slate-800 bg-slate-950/90 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => handleAction('reject')}
            disabled={isSubmitting}
            className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 border border-rose-500/40 font-bold text-xs font-mono transition-all inline-flex items-center justify-center space-x-2"
          >
            <XCircle className="w-4 h-4" />
            <span>[Reject]</span>
          </button>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={() => handleAction('edit_and_approve')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs font-mono transition-all inline-flex items-center justify-center space-x-2 border border-slate-700"
            >
              <RotateCcw className="w-4 h-4" />
              <span>[Regenerate Step]</span>
            </button>

            <button
              type="button"
              onClick={() => handleAction('approve')}
              disabled={isSubmitting}
              className="flex-1 sm:flex-none px-6 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-bold text-xs font-mono transition-all shadow-lg shadow-cyan-500/25 inline-flex items-center justify-center space-x-2"
            >
              <CheckCircle2 className="w-4 h-4 text-slate-950" />
              <span>[Approve & Deploy]</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
