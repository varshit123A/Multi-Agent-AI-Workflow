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
  FileCode2,
  Edit3,
  Send,
  ShieldCheck,
  BarChart3,
  X,
} from 'lucide-react';
import { AgentState } from '../types';

interface HumanReviewModalProps {
  workflow: AgentState;
  onClose: () => void;
  onSubmitReview: (
    action: 'approve' | 'reject' | 'edit_and_approve',
    notes: string,
    editedCode?: { files: Array<{ filename: string; language: string; content: string }> }
  ) => void;
}

export const HumanReviewModal: React.FC<HumanReviewModalProps> = ({
  workflow,
  onClose,
  onSubmitReview,
}) => {
  const [notes, setNotes] = useState<string>('Reviewed architecture and security compliance. Verified production readiness.');
  const [editedFiles, setEditedFiles] = useState(workflow.code_output.files || []);
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [isEditingCode, setIsEditingCode] = useState<boolean>(false);

  const handleFileContentChange = (content: string) => {
    const updated = [...editedFiles];
    if (updated[activeFileIndex]) {
      updated[activeFileIndex] = {
        ...updated[activeFileIndex],
        content,
      };
      setEditedFiles(updated);
      setIsEditingCode(true);
    }
  };

  const currentFile = editedFiles[activeFileIndex];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-slate-900/95 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
              <UserCheck className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h3 className="text-lg font-bold text-white">
                  Confidence Router: Human-in-the-Loop Approval Required
                </h3>
                <span className="px-2 py-0.5 rounded text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                  PAUSED
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Workflow ID: <span className="font-mono">{workflow.id}</span> • Confidence Score:{' '}
                <strong className="text-amber-400 font-mono">{workflow.confidence_score}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {/* Reason Alert */}
          <div className="bg-amber-950/30 border border-amber-500/40 rounded-xl p-4 flex items-start space-x-3">
            <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div className="text-xs text-amber-200 space-y-1">
              <strong className="font-bold">Why is this workflow paused?</strong>
              <p>
                {workflow.confidence_score < 0.90
                  ? `Computed confidence score (${workflow.confidence_score}) is below the automatic threshold of 0.90.`
                  : 'Custom security guardrail policy or force human review flag was triggered.'}
              </p>
              <p className="text-amber-300/80">
                You can review the Planner's plan, generated Python files, OWASP audit, and Ragas quality metrics below. You can approve as-is, edit the code directly, or reject with feedback.
              </p>
            </div>
          </div>

          {/* Ragas Eval Metrics Summary Row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Faithfulness Score</span>
              <div className="text-xl font-bold text-emerald-400 font-mono mt-1">
                {((workflow.eval_metrics?.faithfulness || 0) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Hallucination Score</span>
              <div className="text-xl font-bold text-indigo-400 font-mono mt-1">
                {((workflow.eval_metrics?.hallucination_score || 0) * 100).toFixed(1)}%
              </div>
            </div>
            <div className="bg-slate-950/80 rounded-xl p-3.5 border border-slate-800 text-center">
              <span className="text-[10px] uppercase font-bold text-slate-400">Context Relevance</span>
              <div className="text-xl font-bold text-purple-400 font-mono mt-1">
                {((workflow.eval_metrics?.relevance || 0) * 100).toFixed(1)}%
              </div>
            </div>
          </div>

          {/* Code Inspector & Live Editor */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold text-white flex items-center space-x-2">
                <FileCode2 className="w-4 h-4 text-emerald-400" />
                <span>Generated Code Inspection &amp; Live Editor</span>
              </h4>
              <span className="text-xs text-slate-400">
                {isEditingCode ? 'Modified (Will apply on Edit & Approve)' : 'Unchanged'}
              </span>
            </div>

            {editedFiles.length > 0 ? (
              <div className="bg-slate-950/90 rounded-xl border border-slate-800 overflow-hidden">
                {/* File Tabs */}
                <div className="flex items-center overflow-x-auto border-b border-slate-800 bg-slate-900/60 px-2">
                  {editedFiles.map((f, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveFileIndex(i)}
                      className={`px-4 py-2.5 text-xs font-mono font-semibold transition-all border-b-2 ${
                        activeFileIndex === i
                          ? 'border-indigo-500 text-indigo-300 bg-slate-800/80'
                          : 'border-transparent text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {f.filename}
                    </button>
                  ))}
                </div>

                {/* Editor Area */}
                {currentFile && (
                  <div className="p-4">
                    <textarea
                      rows={10}
                      value={currentFile.content}
                      onChange={(e) => handleFileContentChange(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                )}
              </div>
            ) : (
              <div className="p-6 rounded-xl bg-slate-950/60 border border-slate-800 text-center text-xs text-slate-500">
                No code files generated yet for this workflow step.
              </div>
            )}
          </div>

          {/* Reviewer Notes textarea */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-slate-300">
              Human Reviewer Notes / Justification:
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add comments on why you are approving or rejecting..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 z-10 bg-slate-900/95 border-t border-slate-800 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
          <button
            onClick={() => onSubmitReview('reject', notes)}
            className="px-5 py-2.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 font-semibold text-xs inline-flex items-center space-x-2 transition-all"
          >
            <XCircle className="w-4 h-4" />
            <span>Reject Workflow</span>
          </button>

          <div className="flex items-center space-x-3">
            {isEditingCode && (
              <button
                onClick={() => onSubmitReview('edit_and_approve', notes, { files: editedFiles })}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-semibold text-xs inline-flex items-center space-x-2 shadow-lg shadow-purple-500/20 transition-all"
              >
                <Edit3 className="w-4 h-4" />
                <span>Submit Edits &amp; Approve</span>
              </button>
            )}

            <button
              onClick={() => onSubmitReview('approve', notes)}
              className="px-6 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-xs inline-flex items-center space-x-2 shadow-lg shadow-emerald-500/20 transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve as Generated (&rarr; END)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
