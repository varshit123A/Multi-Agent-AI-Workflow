/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import {
  Code2,
  FolderTree,
  FileCode,
  Copy,
  Check,
  Download,
  Terminal,
} from 'lucide-react';
import { PYTHON_PROJECT_FILES } from '../data/pythonExportFiles';
import { PythonFileNode } from '../types';

export const PythonExportModal: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<PythonFileNode>(PYTHON_PROJECT_FILES[0]);
  const [copied, setCopied] = useState<boolean>(false);
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const filteredFiles =
    categoryFilter === 'all'
      ? PYTHON_PROJECT_FILES
      : PYTHON_PROJECT_FILES.filter((f) => f.category === categoryFilter);

  const downloadProjectTreeJson = () => {
    const dataStr =
      'data:text/json;charset=utf-8,' +
      encodeURIComponent(JSON.stringify(PYTHON_PROJECT_FILES, null, 2));
    const dlAnchor = document.createElement('a');
    dlAnchor.setAttribute('href', dataStr);
    dlAnchor.setAttribute('download', 'multi_agent_platform_python_export.json');
    dlAnchor.click();
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-lg font-bold text-white flex items-center space-x-2">
            <Code2 className="w-5 h-5 text-cyan-400" />
            <span>Python FastAPI + LangGraph Project Code Exporter</span>
          </h2>
          <p className="text-xs text-slate-400 mt-1 font-mono">
            Inspect and export the exact enterprise `multi_agent_platform/` repository structure requested.
          </p>
        </div>

        <button
          onClick={downloadProjectTreeJson}
          className="px-4 py-2.5 bg-gradient-to-r from-cyan-500 via-teal-500 to-emerald-500 hover:from-cyan-400 hover:to-emerald-400 text-slate-950 font-bold text-xs rounded-xl inline-flex items-center space-x-2 shadow-lg transition-all font-mono"
        >
          <Download className="w-4 h-4" />
          <span>Export Python Code JSON</span>
        </button>
      </div>

      {/* Directory Structure Tree View & Code Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Col: File Tree Selector */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-sm font-bold text-white flex items-center space-x-2">
              <FolderTree className="w-4 h-4 text-cyan-400" />
              <span className="font-mono">multi_agent_platform/</span>
            </h3>
            <span className="text-xs text-slate-400 font-mono">{PYTHON_PROJECT_FILES.length} Files</span>
          </div>

          {/* Category tabs */}
          <div className="flex flex-wrap gap-1.5">
            {[
              { id: 'all', label: 'All Files' },
              { id: 'graph', label: 'LangGraph' },
              { id: 'agents', label: 'Agents' },
              { id: 'eval', label: 'Evaluation' },
              { id: 'guardrails', label: 'Guardrails' },
              { id: 'api', label: 'FastAPI' },
              { id: 'docker', label: 'Docker' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all font-mono ${
                  categoryFilter === cat.id
                    ? 'bg-cyan-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* File list */}
          <div className="space-y-1 max-h-[500px] overflow-y-auto pr-1">
            {filteredFiles.map((file) => {
              const isSelected = selectedFile.path === file.path;
              return (
                <button
                  key={file.path}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start space-x-2.5 ${
                    isSelected
                      ? 'bg-cyan-500/20 border-cyan-500/60 text-cyan-200 shadow-md'
                      : 'bg-slate-950/40 border-transparent hover:bg-slate-800/50 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <FileCode className="w-4 h-4 shrink-0 mt-0.5 text-emerald-400" />
                  <div className="truncate">
                    <div className="text-xs font-mono font-semibold truncate">
                      {file.filename}
                    </div>
                    <div className="text-[10px] text-slate-500 truncate font-mono">{file.path}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right 2 Col: Source Code Viewer */}
        <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-slate-800 gap-2">
            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 font-mono">
                  {selectedFile.category}
                </span>
                <h3 className="text-sm font-bold font-mono text-emerald-300">
                  {selectedFile.path}
                </h3>
              </div>
              <p className="text-xs text-slate-400 mt-1 font-mono">{selectedFile.description}</p>
            </div>

            <button
              onClick={handleCopy}
              className="px-3.5 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold inline-flex items-center space-x-1.5 transition-colors font-mono"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Source</span>
                </>
              )}
            </button>
          </div>

          {/* Code Viewer Textarea / pre block */}
          <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden flex-1 max-h-[500px]">
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto overflow-y-auto max-h-[500px] leading-relaxed">
              {selectedFile.content}
            </pre>
          </div>

          {/* Architecture Deployment Note */}
          <div className="mt-4 p-3.5 rounded-xl bg-slate-950/80 border border-slate-800 flex items-center justify-between text-xs text-slate-400 font-mono">
            <div className="flex items-center space-x-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>
                Run locally with Docker: <code className="text-cyan-300 font-mono">docker-compose up --build</code>
              </span>
            </div>
            <span className="text-[11px] text-slate-500 font-mono">
              FastAPI + PostgreSQL + OpenTelemetry
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
